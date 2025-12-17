const { supabase } = require('./_shared/supabase');
const { verifyToken, getTokenFromHeaders } = require('./_shared/auth');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Verify authentication for all methods except GET
  if (event.httpMethod !== 'GET') {
    const token = getTokenFromHeaders(event.headers);
    const payload = verifyToken(token);

    if (!payload) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
  }

  if (!supabase) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Database not configured' }),
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        // Get all blocked dates
        const params = event.queryStringParameters || {};
        const { startDate, endDate, bounceHouseId } = params;

        let query = supabase
          .from('blocked_dates')
          .select('*')
          .order('date', { ascending: true });

        if (startDate) {
          query = query.gte('date', startDate);
        }

        if (endDate) {
          query = query.lte('date', endDate);
        }

        if (bounceHouseId) {
          query = query.or(`bounce_house_id.is.null,bounce_house_id.eq.${bounceHouseId}`);
        }

        const { data: blockedDates, error } = await query;

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ blockedDates: blockedDates || [] }),
        };
      }

      case 'POST': {
        // Add a blocked date
        const { date, reason, bounceHouseId } = JSON.parse(event.body);

        if (!date) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Date is required' }),
          };
        }

        const { data: blockedDate, error } = await supabase
          .from('blocked_dates')
          .insert({
            date,
            reason: reason || 'Blocked by admin',
            bounce_house_id: bounceHouseId || null,
          })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, blockedDate }),
        };
      }

      case 'DELETE': {
        // Remove a blocked date
        const { id, date } = JSON.parse(event.body);

        if (!id && !date) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID or date is required' }),
          };
        }

        let query = supabase.from('blocked_dates').delete();

        if (id) {
          query = query.eq('id', id);
        } else {
          query = query.eq('date', date);
        }

        const { error } = await query;

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error managing blocked dates:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to manage blocked dates' }),
    };
  }
};
