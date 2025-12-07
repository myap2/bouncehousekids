const { supabase } = require('./_shared/supabase');

// Cache Valley zip codes for delivery fee calculation
const CACHE_VALLEY_ZIPS = ['84321', '84322', '84325', '84326', '84332', '84333', '84335', '84339', '84341'];

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
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
    const { bounceHouseId, date } = JSON.parse(event.body);

    if (!date) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Date is required' }),
      };
    }

    // Check if Supabase is configured
    if (!supabase) {
      // Fallback to hardcoded blocked dates if DB not configured
      const blockedDates = [
        '2025-12-25', '2025-12-31', '2026-01-01',
        '2026-01-15', '2026-02-16', '2026-05-25',
        '2026-07-04', '2026-09-07', '2026-10-12',
        '2026-11-11', '2026-11-26', '2026-12-25',
      ];

      const isBlocked = blockedDates.includes(date);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          available: !isBlocked,
          reason: isBlocked ? 'This date is blocked (holiday)' : null,
        }),
      };
    }

    // Check blocked dates in database
    const { data: blockedDate, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('date', date)
      .or(`bounce_house_id.is.null,bounce_house_id.eq.${bounceHouseId || ''}`)
      .single();

    if (blockedError && blockedError.code !== 'PGRST116') {
      // PGRST116 = no rows found (which is good)
      throw blockedError;
    }

    if (blockedDate) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          available: false,
          reason: blockedDate.reason || 'This date is not available',
        }),
      };
    }

    // Check existing bookings for this date
    let query = supabase
      .from('bookings')
      .select('id')
      .eq('event_date', date)
      .in('status', ['pending', 'confirmed']);

    if (bounceHouseId) {
      query = query.eq('bounce_house_id', bounceHouseId);
    }

    const { data: existingBookings, error: bookingError } = await query;

    if (bookingError) {
      throw bookingError;
    }

    if (existingBookings && existingBookings.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          available: false,
          reason: 'This date is already booked',
        }),
      };
    }

    // Date is available
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: true,
        reason: null,
      }),
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to check availability' }),
    };
  }
};
