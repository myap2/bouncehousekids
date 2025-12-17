// Google Calendar Integration for My Bounce Place
// Requires GOOGLE_SERVICE_ACCOUNT_KEY environment variable (base64 encoded JSON key)
// and GOOGLE_CALENDAR_ID environment variable

const { google } = require('googleapis');

let calendarClient = null;

function getCalendarClient() {
  if (calendarClient) return calendarClient;

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.log('Google Calendar not configured: missing GOOGLE_SERVICE_ACCOUNT_KEY');
    return null;
  }

  try {
    // Decode base64 encoded service account key
    const keyJson = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials: keyJson,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    calendarClient = google.calendar({ version: 'v3', auth });
    return calendarClient;
  } catch (error) {
    console.error('Error initializing Google Calendar client:', error);
    return null;
  }
}

/**
 * Create a calendar event for a booking
 * @param {Object} booking - The booking object
 * @returns {Promise<{eventId: string, eventLink: string} | null>}
 */
async function createCalendarEvent(booking) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendar || !calendarId) {
    console.log('Google Calendar not configured, skipping event creation');
    return null;
  }

  try {
    // Parse event date and time
    const eventDate = new Date(booking.event_date);
    const [hours, minutes] = (booking.event_start_time || '10:00').split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // End time is 8 hours later for daily rental
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 8);

    // Build event description
    const description = `
Customer: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_phone || 'N/A'}

Package: ${booking.rental_type}
Total: $${parseFloat(booking.total_amount).toFixed(2)}
Deposit Paid: $${parseFloat(booking.deposit_amount).toFixed(2)}
Balance Due: $${(parseFloat(booking.total_amount) - parseFloat(booking.deposit_amount)).toFixed(2)}

Guests: ${booking.guests_count || 'Not specified'}
Special Requests: ${booking.special_requests || 'None'}

Booking ID: ${booking.id}
    `.trim();

    const event = {
      summary: `Bounce House - ${booking.customer_name}`,
      location: booking.event_address,
      description: description,
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: 'America/Denver', // Mountain Time
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Denver',
      },
      colorId: '2', // Green color
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
    });

    console.log('Created Google Calendar event:', response.data.id);

    return {
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    };

  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return null;
  }
}

/**
 * Update a calendar event
 * @param {string} eventId - The Google Calendar event ID
 * @param {Object} updates - The fields to update
 */
async function updateCalendarEvent(eventId, updates) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendar || !calendarId || !eventId) {
    return null;
  }

  try {
    // First get the existing event
    const existing = await calendar.events.get({
      calendarId,
      eventId,
    });

    // Merge updates
    const updatedEvent = {
      ...existing.data,
      ...updates,
    };

    const response = await calendar.events.update({
      calendarId,
      eventId,
      resource: updatedEvent,
    });

    console.log('Updated Google Calendar event:', eventId);
    return response.data;

  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    return null;
  }
}

/**
 * Delete a calendar event
 * @param {string} eventId - The Google Calendar event ID
 */
async function deleteCalendarEvent(eventId) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendar || !calendarId || !eventId) {
    return false;
  }

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });

    console.log('Deleted Google Calendar event:', eventId);
    return true;

  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return false;
  }
}

/**
 * Mark an event as cancelled (changes color, adds CANCELLED prefix)
 * @param {string} eventId - The Google Calendar event ID
 */
async function cancelCalendarEvent(eventId) {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendar || !calendarId || !eventId) {
    return false;
  }

  try {
    const existing = await calendar.events.get({
      calendarId,
      eventId,
    });

    const updatedEvent = {
      ...existing.data,
      summary: `[CANCELLED] ${existing.data.summary}`,
      colorId: '11', // Red color
    };

    await calendar.events.update({
      calendarId,
      eventId,
      resource: updatedEvent,
    });

    console.log('Marked Google Calendar event as cancelled:', eventId);
    return true;

  } catch (error) {
    console.error('Error cancelling Google Calendar event:', error);
    return false;
  }
}

module.exports = {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  cancelCalendarEvent,
};
