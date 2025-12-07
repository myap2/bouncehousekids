const { supabase } = require('./_shared/supabase');
const { sendEmail } = require('./_shared/email');
const { send3DayReminderSMS, send1DayReminderSMS } = require('./_shared/sms');

// This function runs on a schedule (configured in netlify.toml)
// It sends reminder emails to customers with upcoming bookings

exports.handler = async (event) => {
  console.log('Running scheduled reminder check...');

  if (!supabase) {
    console.log('Database not configured, skipping reminders');
    return { statusCode: 200, body: 'Database not configured' };
  }

  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  const oneDayFromNow = new Date(today);
  oneDayFromNow.setDate(today.getDate() + 1);

  const formatDate = (date) => date.toISOString().split('T')[0];

  try {
    // Get bookings for 3-day reminder
    const { data: threeDayBookings, error: error3 } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_date', formatDate(threeDaysFromNow))
      .eq('status', 'confirmed')
      .is('reminder_3day_sent', null);

    // Get bookings for 1-day reminder
    const { data: oneDayBookings, error: error1 } = await supabase
      .from('bookings')
      .select('*')
      .eq('event_date', formatDate(oneDayFromNow))
      .eq('status', 'confirmed')
      .is('reminder_1day_sent', null);

    if (error3) console.error('Error fetching 3-day bookings:', error3);
    if (error1) console.error('Error fetching 1-day bookings:', error1);

    const results = {
      threeDayReminders: 0,
      oneDayReminders: 0,
      errors: [],
    };

    // Send 3-day reminders
    for (const booking of (threeDayBookings || [])) {
      try {
        await send3DayReminder(booking);
        await send3DayReminderSMS(booking);
        await markReminderSent(booking.id, 'reminder_3day_sent');
        results.threeDayReminders++;
      } catch (error) {
        console.error(`Error sending 3-day reminder for ${booking.id}:`, error);
        results.errors.push({ bookingId: booking.id, type: '3-day', error: error.message });
      }
    }

    // Send 1-day reminders
    for (const booking of (oneDayBookings || [])) {
      try {
        await send1DayReminder(booking);
        await send1DayReminderSMS(booking);
        await markReminderSent(booking.id, 'reminder_1day_sent');
        results.oneDayReminders++;
      } catch (error) {
        console.error(`Error sending 1-day reminder for ${booking.id}:`, error);
        results.errors.push({ bookingId: booking.id, type: '1-day', error: error.message });
      }
    }

    // Also send admin notification for tomorrow's bookings
    if (oneDayBookings && oneDayBookings.length > 0) {
      await sendAdminDailyDigest(oneDayBookings);
    }

    console.log('Reminder results:', results);

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };

  } catch (error) {
    console.error('Error in reminder function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function send3DayReminder(booking) {
  const eventDate = new Date(booking.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const balanceDue = parseFloat(booking.total_amount) - parseFloat(booking.deposit_amount);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Your Bounce House Event is Coming Up!</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hi ${booking.customer_name},</p>

        <p>This is a friendly reminder that your bounce house rental is in <strong>3 days</strong>!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${booking.event_start_time || 'To be confirmed'}</p>
          <p><strong>Location:</strong> ${booking.event_address}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404;">Preparation Checklist</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Ensure the setup area is clear and level (15' x 15' minimum)</li>
            <li>Have access to an electrical outlet within 50 feet</li>
            <li>Check for overhead obstructions (trees, wires)</li>
            <li>Remove sharp objects from the area</li>
          </ul>
        </div>

        ${balanceDue > 0 ? `
        <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Balance Due:</strong> $${balanceDue.toFixed(2)}</p>
          <p style="margin: 5px 0 0; font-size: 0.9rem;">Payment is due upon delivery. We accept cash, check, or card.</p>
        </div>
        ` : ''}

        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Important:</strong> Please ensure your liability waiver is signed before the event.</p>
          <p style="margin: 10px 0 0;">
            <a href="${process.env.SITE_URL || 'https://mybounceplace.com'}/#waiver" style="color: #1976d2;">Sign Waiver Online</a>
          </p>
        </div>

        <p>Questions? Reply to this email or call us at <a href="tel:3852888065">(385) 288-8065</a>.</p>

        <p>We're excited for your event!</p>
        <p>- The My Bounce Place Team</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: booking.customer_email,
    subject: `Reminder: Your Bounce House Event is in 3 Days! - ${eventDate}`,
    html,
  });
}

async function send1DayReminder(booking) {
  const eventDate = new Date(booking.event_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const balanceDue = parseFloat(booking.total_amount) - parseFloat(booking.deposit_amount);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Tomorrow is the Big Day!</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hi ${booking.customer_name},</p>

        <p>Get ready! Your bounce house rental is <strong>TOMORROW</strong>!</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #f5576c;">Event Details</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${booking.event_start_time || 'To be confirmed'}</p>
          <p><strong>Location:</strong> ${booking.event_address}</p>
        </div>

        <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #2e7d32;">Delivery Information</h4>
          <p>Our team will arrive approximately 1-2 hours before your event start time for setup.</p>
          <p>Please ensure someone 18+ is present to sign for delivery.</p>
        </div>

        ${balanceDue > 0 ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Balance Due Tomorrow:</strong> $${balanceDue.toFixed(2)}</p>
          <p style="margin: 5px 0 0; font-size: 0.9rem;">Please have payment ready upon delivery.</p>
        </div>
        ` : ''}

        <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #c62828;">Safety Reminders</h4>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Adult supervision required at all times</li>
            <li>No shoes, jewelry, or sharp objects in the bounce house</li>
            <li>Follow posted weight and capacity limits</li>
            <li>No food or drinks inside the bounce house</li>
          </ul>
        </div>

        <p>Have a fantastic event! If you need to reach us tomorrow, call <a href="tel:3852888065">(385) 288-8065</a>.</p>

        <p>- The My Bounce Place Team</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: booking.customer_email,
    subject: `Tomorrow! Your Bounce House Event - ${eventDate}`,
    html,
  });
}

async function sendAdminDailyDigest(bookings) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bookingsList = bookings.map(b => `
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4a90d9;">
      <p style="margin: 0 0 5px;"><strong>${b.customer_name}</strong></p>
      <p style="margin: 0 0 5px; color: #666;">${b.event_address}</p>
      <p style="margin: 0 0 5px;">Time: ${b.event_start_time || 'TBD'}</p>
      <p style="margin: 0;">Phone: <a href="tel:${b.customer_phone}">${b.customer_phone}</a></p>
      <p style="margin: 5px 0 0; font-size: 0.9rem;">Balance: $${(parseFloat(b.total_amount) - parseFloat(b.deposit_amount)).toFixed(2)}</p>
    </div>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #4a90d9; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Tomorrow's Bookings</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">${dateStr}</p>
      </div>

      <div style="padding: 20px; background: #f5f5f5;">
        <p>You have <strong>${bookings.length} booking${bookings.length > 1 ? 's' : ''}</strong> scheduled for tomorrow:</p>
        ${bookingsList}

        <p style="margin-top: 20px;">
          <a href="${process.env.SITE_URL || 'https://mybounceplace.com'}/admin.html"
             style="display: inline-block; background: #4a90d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            View in Admin Dashboard
          </a>
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `Tomorrow's Bookings (${bookings.length}) - ${dateStr}`,
    html,
  });
}

async function markReminderSent(bookingId, field) {
  if (!supabase) return;

  await supabase
    .from('bookings')
    .update({ [field]: new Date().toISOString() })
    .eq('id', bookingId);
}
