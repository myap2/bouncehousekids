const { supabase } = require('./_shared/supabase');
const { verifyToken, getTokenFromHeaders } = require('./_shared/auth');
const { sendEmail } = require('./_shared/email');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'PUT, PATCH, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'PUT' && event.httpMethod !== 'PATCH') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Verify authentication
  const token = getTokenFromHeaders(event.headers);
  const payload = verifyToken(token);

  if (!payload) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const { bookingId, status, notes, sendNotification } = JSON.parse(event.body);

    if (!bookingId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Booking ID is required' }),
      };
    }

    if (!supabase) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not configured' }),
      };
    }

    // Build update object
    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.status = status;
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    // Update booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send notification email if requested
    if (sendNotification && booking) {
      const statusMessages = {
        confirmed: 'Your booking has been confirmed!',
        cancelled: 'Your booking has been cancelled.',
        completed: 'Thank you for choosing My Bounce Place! We hope you had a great event.',
      };

      if (statusMessages[status]) {
        await sendEmail({
          to: booking.customer_email,
          subject: `Booking Update - My Bounce Place`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Booking Update</h2>
              <p>Hi ${booking.customer_name},</p>
              <p>${statusMessages[status]}</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Event Date:</strong> ${new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Location:</strong> ${booking.event_address}</p>
                <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
              </div>
              <p>If you have any questions, please contact us at <a href="tel:3852888065">(385) 288-8065</a>.</p>
              <p>- The My Bounce Place Team</p>
            </div>
          `,
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        booking,
      }),
    };
  } catch (error) {
    console.error('Error updating booking:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update booking' }),
    };
  }
};
