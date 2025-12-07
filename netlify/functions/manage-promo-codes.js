const { supabase } = require('./_shared/supabase');
const { verifyToken, getTokenFromHeaders } = require('./_shared/auth');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // All promo code management requires authentication
  const token = getTokenFromHeaders(event.headers);
  const payload = verifyToken(token);

  if (!payload) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
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
        // Get all promo codes
        const { data: promoCodes, error } = await supabase
          .from('promo_codes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ promoCodes: promoCodes || [] }),
        };
      }

      case 'POST': {
        // Create new promo code
        const {
          code,
          description,
          discountType,
          discountValue,
          minOrderAmount,
          maxUses,
          validFrom,
          validUntil,
        } = JSON.parse(event.body);

        if (!code || !discountValue) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Code and discount value are required' }),
          };
        }

        const { data: promoCode, error } = await supabase
          .from('promo_codes')
          .insert({
            code: code.trim().toUpperCase(),
            description,
            discount_type: discountType || 'percentage',
            discount_value: discountValue,
            min_order_amount: minOrderAmount || 0,
            max_uses: maxUses || null,
            valid_from: validFrom || null,
            valid_until: validUntil || null,
            is_active: true,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'A promo code with this name already exists' }),
            };
          }
          throw error;
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, promoCode }),
        };
      }

      case 'PUT': {
        // Update promo code
        const { id, ...updates } = JSON.parse(event.body);

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Promo code ID is required' }),
          };
        }

        // Map camelCase to snake_case
        const dbUpdates = {};
        if (updates.code !== undefined) dbUpdates.code = updates.code.trim().toUpperCase();
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.discountType !== undefined) dbUpdates.discount_type = updates.discountType;
        if (updates.discountValue !== undefined) dbUpdates.discount_value = updates.discountValue;
        if (updates.minOrderAmount !== undefined) dbUpdates.min_order_amount = updates.minOrderAmount;
        if (updates.maxUses !== undefined) dbUpdates.max_uses = updates.maxUses;
        if (updates.validFrom !== undefined) dbUpdates.valid_from = updates.validFrom;
        if (updates.validUntil !== undefined) dbUpdates.valid_until = updates.validUntil;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        const { data: promoCode, error } = await supabase
          .from('promo_codes')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, promoCode }),
        };
      }

      case 'DELETE': {
        // Delete promo code
        const { id } = JSON.parse(event.body);

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Promo code ID is required' }),
          };
        }

        const { error } = await supabase
          .from('promo_codes')
          .delete()
          .eq('id', id);

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
    console.error('Error managing promo codes:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to manage promo codes' }),
    };
  }
};
