const { supabase } = require('./_shared/supabase');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const bounceHouseId = params.bounceHouseId;
    const year = parseInt(params.year) || new Date().getFullYear();
    const month = parseInt(params.month) || new Date().getMonth() + 1;

    // Calculate date range for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Hardcoded blocked dates fallback
    const hardcodedBlockedDates = [
      '2025-12-25', '2025-12-31', '2026-01-01',
      '2026-01-15', '2026-02-16', '2026-05-25',
      '2026-07-04', '2026-09-07', '2026-10-12',
      '2026-11-11', '2026-11-26', '2026-12-25',
      '2027-01-01', '2027-01-18', '2027-02-15',
    ];

    if (!supabase) {
      // Return hardcoded data if DB not configured
      const dates = [];
      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isBlocked = hardcodedBlockedDates.includes(dateStr);
        const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);

        dates.push({
          date: dateStr,
          available: !isBlocked && !isPast,
          status: isPast ? 'past' : (isBlocked ? 'blocked' : 'available'),
          reason: isBlocked ? 'Holiday' : null,
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ dates }),
      };
    }

    // Fetch blocked dates from database
    const { data: blockedDates, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('date, reason')
      .gte('date', startDate)
      .lte('date', endDate)
      .or(`bounce_house_id.is.null${bounceHouseId ? `,bounce_house_id.eq.${bounceHouseId}` : ''}`);

    if (blockedError) {
      throw blockedError;
    }

    // Fetch confirmed bookings (always block)
    let confirmedQuery = supabase
      .from('bookings')
      .select('event_date')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .eq('status', 'confirmed');

    if (bounceHouseId) {
      confirmedQuery = confirmedQuery.eq('bounce_house_id', bounceHouseId);
    }

    const { data: confirmedBookings, error: confirmedError } = await confirmedQuery;

    if (confirmedError) {
      throw confirmedError;
    }

    // Fetch pending bookings created in last 10 minutes (temporary hold)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    let pendingQuery = supabase
      .from('bookings')
      .select('event_date')
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .eq('status', 'pending')
      .gte('created_at', tenMinutesAgo);

    if (bounceHouseId) {
      pendingQuery = pendingQuery.eq('bounce_house_id', bounceHouseId);
    }

    const { data: pendingBookings, error: pendingError } = await pendingQuery;

    if (pendingError) {
      throw pendingError;
    }

    // Combine both confirmed and recent pending bookings
    const bookings = [...(confirmedBookings || []), ...(pendingBookings || [])];

    // Build blocked dates set
    const blockedDatesSet = new Set(blockedDates?.map(d => d.date) || []);
    const bookedDatesSet = new Set(bookings?.map(b => b.event_date) || []);
    const blockedReasons = {};
    blockedDates?.forEach(d => {
      blockedReasons[d.date] = d.reason;
    });

    // Generate calendar data
    const dates = [];
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);
      const isBlocked = blockedDatesSet.has(dateStr);
      const isBooked = bookedDatesSet.has(dateStr);

      let status = 'available';
      let reason = null;

      if (isPast) {
        status = 'past';
      } else if (isBlocked) {
        status = 'blocked';
        reason = blockedReasons[dateStr] || 'Not available';
      } else if (isBooked) {
        status = 'booked';
        reason = 'Already booked';
      }

      dates.push({
        date: dateStr,
        available: status === 'available',
        status,
        reason,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ dates }),
    };
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch calendar data' }),
    };
  }
};
