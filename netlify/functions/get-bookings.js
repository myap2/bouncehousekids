const { supabase } = require('./_shared/supabase');
const { verifyToken, getTokenFromHeaders } = require('./_shared/auth');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const params = event.queryStringParameters || {};
    const {
      status,
      startDate,
      endDate,
      page = '1',
      limit = '50',
      sort = 'event_date',
      order = 'asc',
    } = params;

    if (!supabase) {
      // Return mock data if Supabase not configured
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          bookings: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          message: 'Database not configured',
        }),
      };
    }

    // Build query
    let query = supabase
      .from('bookings')
      .select('*, bounce_houses(name, theme)', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('event_date', startDate);
    }

    if (endDate) {
      query = query.lte('event_date', endDate);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === 'asc' });

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        bookings: bookings || [],
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum),
      }),
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch bookings' }),
    };
  }
};
