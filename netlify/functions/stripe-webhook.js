const { supabase } = require('./_shared/supabase');
const { stripe } = require('./_shared/stripe');
const { sendBookingConfirmation } = require('./_shared/email');
const { createCalendarEvent } = require('./_shared/google-calendar');
const { sendBookingConfirmationSMS, sendAdminNewBookingSMS } = require('./_shared/sms');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Stripe not configured' }),
    };
  }

  let stripeEvent;

  try {
    // Verify webhook signature
    if (webhookSecret) {
      const signature = event.headers['stripe-signature'];
      stripeEvent = stripe.webhooks.constructEvent(
        event.body,
        signature,
        webhookSecret
      );
    } else {
      // For testing without signature verification
      stripeEvent = JSON.parse(event.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        console.log('Checkout session completed:', session.id);

        const bookingId = session.metadata?.booking_id;

        if (bookingId && bookingId !== 'no-db' && supabase) {
          // Update booking status
          const { data: booking, error: updateError } = await supabase
            .from('bookings')
            .update({
              payment_status: 'deposit_paid',
              status: 'confirmed',
              stripe_payment_intent_id: session.payment_intent,
              deposit_paid_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating booking:', updateError);
            throw updateError;
          }

          // Send confirmation emails
          if (booking) {
            await sendBookingConfirmation(booking);

            // Create Google Calendar event
            const calendarResult = await createCalendarEvent(booking);
            if (calendarResult && calendarResult.eventId) {
              // Store calendar event ID in booking record
              await supabase
                .from('bookings')
                .update({
                  google_calendar_event_id: calendarResult.eventId,
                })
                .eq('id', bookingId);
            }

            // Send SMS confirmations
            await sendBookingConfirmationSMS(booking);
            await sendAdminNewBookingSMS(booking);
          }
        } else {
          // No database - just log
          console.log('Payment successful, metadata:', session.metadata);

          // Still try to send email with session metadata
          const bookingData = {
            customer_name: session.metadata?.customer_name || session.customer_details?.name || 'Customer',
            customer_email: session.customer_email,
            event_date: session.metadata?.event_date,
            event_address: 'Address on file',
            rental_type: session.metadata?.rental_type || 'daily',
            total_amount: parseFloat(session.metadata?.total_amount || 0),
            deposit_amount: parseFloat(session.metadata?.deposit_amount || 0),
          };

          await sendBookingConfirmation(bookingData);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = stripeEvent.data.object;
        const bookingId = session.metadata?.booking_id;

        if (bookingId && bookingId !== 'no-db' && supabase) {
          // Mark booking as cancelled/expired
          await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              notes: 'Payment session expired',
            })
            .eq('id', bookingId);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object;
        console.log('Payment failed:', paymentIntent.id);
        // Could notify admin or update booking status
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
};
