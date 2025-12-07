const { supabase } = require('./_shared/supabase');
const { stripe } = require('./_shared/stripe');

// Cache Valley zip codes
const CACHE_VALLEY_ZIPS = ['84321', '84322', '84325', '84326', '84332', '84333', '84335', '84339', '84341'];

// Pricing configuration
const PRICING = {
  daily: 150,
  weekend: 200,
  weekly: 800,
};

const DELIVERY_FEES = {
  cache_valley: 20,
  outside: 50,
};

const DEPOSIT_PERCENTAGE = 0.5; // 50% deposit

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const {
      bounceHouseId,
      eventDate,
      eventTime,
      rentalType,
      customerName,
      customerEmail,
      customerPhone,
      eventAddress,
      eventZip,
      guestsCount,
      specialRequests,
      promoCode,
    } = JSON.parse(event.body);

    // Validate required fields
    if (!eventDate || !rentalType || !customerName || !customerEmail || !eventAddress) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['eventDate', 'rentalType', 'customerName', 'customerEmail', 'eventAddress'],
        }),
      };
    }

    // Check if Stripe is configured
    if (!stripe) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Payment system not configured' }),
      };
    }

    // Calculate pricing
    const basePrice = PRICING[rentalType] || PRICING.daily;
    const deliveryZone = eventZip && CACHE_VALLEY_ZIPS.includes(eventZip) ? 'cache_valley' : 'outside';
    const deliveryFee = DELIVERY_FEES[deliveryZone];
    let subtotal = basePrice + deliveryFee;
    let discountAmount = 0;
    let appliedPromoCode = null;

    // Validate and apply promo code if provided
    if (promoCode && supabase) {
      const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo && !promoError) {
        const today = new Date().toISOString().split('T')[0];
        const isValid = (!promo.valid_from || today >= promo.valid_from) &&
                       (!promo.valid_until || today <= promo.valid_until) &&
                       (promo.max_uses === null || promo.uses_count < promo.max_uses) &&
                       (!promo.min_order_amount || subtotal >= promo.min_order_amount);

        if (isValid) {
          if (promo.discount_type === 'percentage') {
            discountAmount = subtotal * (promo.discount_value / 100);
          } else {
            discountAmount = promo.discount_value;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          discountAmount = Math.round(discountAmount * 100) / 100;
          appliedPromoCode = promo.code;

          // Increment usage count
          await supabase
            .from('promo_codes')
            .update({ uses_count: promo.uses_count + 1 })
            .eq('id', promo.id);
        }
      }
    }

    const totalAmount = subtotal - discountAmount;
    const depositAmount = Math.round(totalAmount * DEPOSIT_PERCENTAGE * 100) / 100;

    // Get site URL for redirects
    const siteUrl = process.env.SITE_URL || 'https://mybounceplace.com';

    // Create booking record (pending status)
    let bookingId = null;
    if (supabase) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          bounce_house_id: bounceHouseId || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          event_date: eventDate,
          event_start_time: eventTime,
          event_address: eventAddress,
          event_zip: eventZip,
          delivery_zone: deliveryZone,
          rental_type: rentalType,
          guests_count: guestsCount ? parseInt(guestsCount) : null,
          special_requests: specialRequests,
          base_price: basePrice,
          delivery_fee: deliveryFee,
          discount_amount: discountAmount,
          promo_code: appliedPromoCode,
          deposit_amount: depositAmount,
          total_amount: totalAmount,
          payment_status: 'pending',
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      bookingId = booking.id;
    }

    // Format date for display
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Bounce House Rental - ${rentalType.charAt(0).toUpperCase() + rentalType.slice(1)}`,
              description: `Event Date: ${formattedDate}\nLocation: ${eventAddress}\nDeposit (50% of $${totalAmount.toFixed(2)} total)`,
            },
            unit_amount: Math.round(depositAmount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId || 'no-db',
        event_date: eventDate,
        rental_type: rentalType,
        customer_name: customerName,
        total_amount: totalAmount.toString(),
        deposit_amount: depositAmount.toString(),
      },
      success_url: `${siteUrl}/#booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#booking-cancelled`,
    });

    // Update booking with Stripe session ID
    if (supabase && bookingId) {
      await supabase
        .from('bookings')
        .update({ stripe_session_id: session.id })
        .eq('id', bookingId);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        checkoutUrl: session.url,
        sessionId: session.id,
        bookingId,
        pricing: {
          basePrice,
          deliveryFee,
          discountAmount,
          promoCode: appliedPromoCode,
          subtotal,
          totalAmount,
          depositAmount,
        },
      }),
    };
  } catch (error) {
    console.error('Error creating checkout:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
    };
  }
};
