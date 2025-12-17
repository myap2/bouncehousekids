// Twilio SMS Integration for My Bounce Place
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables

const twilio = require('twilio');

let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.log('Twilio not configured: missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN');
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    return twilioClient;
  } catch (error) {
    console.error('Error initializing Twilio client:', error);
    return null;
  }
}

/**
 * Send an SMS message
 * @param {string} to - Phone number to send to (E.164 format)
 * @param {string} message - Message content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendSMS(to, message) {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !fromNumber) {
    console.log('Twilio not configured, skipping SMS');
    return { success: false, error: 'SMS not configured' };
  }

  // Format phone number to E.164 if not already
  let formattedPhone = to.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '+1' + formattedPhone;
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedPhone,
    });

    console.log('SMS sent:', result.sid);
    return { success: true, messageId: result.sid };

  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send booking confirmation SMS
 * @param {Object} booking - The booking object
 */
async function sendBookingConfirmationSMS(booking) {
  if (!booking.customer_phone) {
    console.log('No phone number for booking, skipping SMS');
    return;
  }

  const eventDate = new Date(booking.event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const message = `My Bounce Place: Your booking is confirmed for ${eventDate}! Deposit of $${parseFloat(booking.deposit_amount).toFixed(2)} received. We'll contact you before your event. Questions? Call (385) 288-8065`;

  return sendSMS(booking.customer_phone, message);
}

/**
 * Send 3-day reminder SMS
 * @param {Object} booking - The booking object
 */
async function send3DayReminderSMS(booking) {
  if (!booking.customer_phone) return;

  const eventDate = new Date(booking.event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const balanceDue = parseFloat(booking.total_amount) - parseFloat(booking.deposit_amount);

  let message = `My Bounce Place: Your bounce house rental is in 3 days! Date: ${eventDate}. `;
  if (balanceDue > 0) {
    message += `Balance due: $${balanceDue.toFixed(2)}. `;
  }
  message += `Please ensure setup area is clear. Questions? (385) 288-8065`;

  return sendSMS(booking.customer_phone, message);
}

/**
 * Send 1-day reminder SMS
 * @param {Object} booking - The booking object
 */
async function send1DayReminderSMS(booking) {
  if (!booking.customer_phone) return;

  const eventDate = new Date(booking.event_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const balanceDue = parseFloat(booking.total_amount) - parseFloat(booking.deposit_amount);

  let message = `My Bounce Place: TOMORROW is the big day! ${eventDate} at ${booking.event_start_time || 'TBD'}. `;
  if (balanceDue > 0) {
    message += `Have $${balanceDue.toFixed(2)} ready. `;
  }
  message += `We'll arrive 1-2 hrs early for setup. See you soon!`;

  return sendSMS(booking.customer_phone, message);
}

/**
 * Send booking cancellation SMS
 * @param {Object} booking - The booking object
 */
async function sendCancellationSMS(booking) {
  if (!booking.customer_phone) return;

  const message = `My Bounce Place: Your booking for ${new Date(booking.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} has been cancelled. If you have questions, please call (385) 288-8065.`;

  return sendSMS(booking.customer_phone, message);
}

/**
 * Send SMS to admin about new booking
 * @param {Object} booking - The booking object
 */
async function sendAdminNewBookingSMS(booking) {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) return;

  const eventDate = new Date(booking.event_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const message = `New Booking! ${booking.customer_name} for ${eventDate}. Total: $${parseFloat(booking.total_amount).toFixed(2)}. Check admin dashboard for details.`;

  return sendSMS(adminPhone, message);
}

module.exports = {
  sendSMS,
  sendBookingConfirmationSMS,
  send3DayReminderSMS,
  send1DayReminderSMS,
  sendCancellationSMS,
  sendAdminNewBookingSMS,
};
