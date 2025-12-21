const { supabase } = require('./_shared/supabase');
const { stripe } = require('./_shared/stripe');
const { CONFIG } = require('./_shared/config');

// Use config values (with fallbacks for backwards compatibility)
const LOCAL_ZIPS = CONFIG.LOCAL_ZIPS.length > 0 ? CONFIG.LOCAL_ZIPS : ['84321', '84322', '84325', '84326', '84332', '84333', '84335', '84339', '84341'];
const PRICING = CONFIG.PRICING;
const DELIVERY_FEES = {
  local: CONFIG.DELIVERY_FEES.local,
  outside: CONFIG.DELIVERY_FEES.outside,
};
const DEPOSIT_PERCENTAGE = CONFIG.DEPOSIT_PERCENTAGE;

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
      addOns,
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
    const deliveryZone = eventZip && LOCAL_ZIPS.includes(eventZip) ? 'local' : 'outside';
    const deliveryFee = DELIVERY_FEES[deliveryZone];

    // Calculate add-ons pricing
    let addOnsTotal = 0;
    let processedAddOns = [];

    if (addOns && Array.isArray(addOns) && addOns.length > 0 && supabase) {
      // Fetch add-on details from database
      const addOnIds = addOns.map(a => a.id);
      const { data: addOnData, error: addOnError } = await supabase
        .from('add_ons')
        .select('id, name, price_per_unit, max_quantity')
        .in('id', addOnIds)
        .eq('is_active', true);

      if (!addOnError && addOnData) {
        const addOnMap = Object.fromEntries(addOnData.map(a => [a.id, a]));

        for (const requested of addOns) {
          const addOn = addOnMap[requested.id];
          if (addOn && requested.quantity > 0) {
            // Enforce max quantity
            const quantity = Math.min(requested.quantity, addOn.max_quantity);
            const subtotalItem = addOn.price_per_unit * quantity;
            addOnsTotal += subtotalItem;

            processedAddOns.push({
              id: addOn.id,
              name: addOn.name,
              quantity,
              price_per_unit: parseFloat(addOn.price_per_unit),
              subtotal: Math.round(subtotalItem * 100) / 100,
            });
          }
        }
      }
    }

    addOnsTotal = Math.round(addOnsTotal * 100) / 100;
    let subtotal = basePrice + deliveryFee + addOnsTotal;
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
      // Only use bounceHouseId if it's a valid UUID format
      const isValidUUID = bounceHouseId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bounceHouseId);

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          bounce_house_id: isValidUUID ? bounceHouseId : null,
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
          add_ons: processedAddOns.length > 0 ? processedAddOns : null,
          add_ons_total: addOnsTotal,
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

    // Build description including add-ons
    let description = `Event Date: ${formattedDate}\nLocation: ${eventAddress}`;
    if (processedAddOns.length > 0) {
      const addOnsList = processedAddOns.map(a => `${a.quantity}x ${a.name}`).join(', ');
      description += `\nAdd-ons: ${addOnsList}`;
    }
    description += `\nDeposit (50% of $${totalAmount.toFixed(2)} total)`;

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
              description: description,
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
        add_ons_total: addOnsTotal.toString(),
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
          addOnsTotal,
          addOns: processedAddOns,
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
