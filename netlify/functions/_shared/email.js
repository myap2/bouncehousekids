const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mybounceplace.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'bookings@mybounceplace.com';

async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    console.warn('Resend API key not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

async function sendBookingConfirmation(booking) {
  const { customer_name, customer_email, event_date, event_address, rental_type, total_amount, deposit_amount } = booking;

  const formattedDate = new Date(event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Booking Confirmed!</h1>
      <p>Hi ${customer_name},</p>
      <p>Thank you for booking with My Bounce Place! Your bounce house rental has been confirmed.</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Booking Details</h2>
        <p><strong>Event Date:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${event_address}</p>
        <p><strong>Rental Type:</strong> ${rental_type}</p>
        <p><strong>Total Amount:</strong> $${total_amount}</p>
        <p><strong>Deposit Paid:</strong> $${deposit_amount}</p>
        <p><strong>Balance Due:</strong> $${(total_amount - deposit_amount).toFixed(2)}</p>
      </div>

      <h3>What's Next?</h3>
      <ul>
        <li>We'll contact you 1-2 days before your event to confirm delivery time</li>
        <li>Please ensure the setup area is clear and accessible</li>
        <li>Make sure you have an electrical outlet within 50 feet of the setup location</li>
        <li>Don't forget to sign the waiver before your event!</li>
      </ul>

      <p>If you have any questions, please contact us at <a href="tel:3852888065">(385) 288-8065</a> or reply to this email.</p>

      <p>We look forward to making your event bounce-tastic!</p>
      <p>- The My Bounce Place Team</p>
    </div>
  `;

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2196F3;">New Booking Received!</h1>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Customer Info</h2>
        <p><strong>Name:</strong> ${customer_name}</p>
        <p><strong>Email:</strong> ${customer_email}</p>
        <p><strong>Phone:</strong> ${booking.customer_phone || 'Not provided'}</p>
      </div>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Event Details</h2>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${event_address}</p>
        <p><strong>Rental Type:</strong> ${rental_type}</p>
        <p><strong>Guests:</strong> ${booking.guests_count || 'Not specified'}</p>
        <p><strong>Special Requests:</strong> ${booking.special_requests || 'None'}</p>
      </div>

      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Payment</h2>
        <p><strong>Total:</strong> $${total_amount}</p>
        <p><strong>Deposit Paid:</strong> $${deposit_amount}</p>
        <p><strong>Balance Due:</strong> $${(total_amount - deposit_amount).toFixed(2)}</p>
      </div>
    </div>
  `;

  // Send to customer
  await sendEmail({
    to: customer_email,
    subject: 'Your My Bounce Place Booking is Confirmed!',
    html: customerHtml,
  });

  // Send to admin
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Booking: ${customer_name} - ${formattedDate}`,
    html: adminHtml,
  });
}

module.exports = { sendEmail, sendBookingConfirmation };
