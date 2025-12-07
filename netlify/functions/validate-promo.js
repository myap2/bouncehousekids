const { supabase } = require('./_shared/supabase');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

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
    const { code, orderAmount } = JSON.parse(event.body);

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ valid: false, error: 'Promo code is required' }),
      };
    }

    // Normalize code
    const normalizedCode = code.trim().toUpperCase();

    if (!supabase) {
      // Fallback: hardcoded promo codes if no database
      const fallbackCodes = {
        'WELCOME10': { discount_type: 'percentage', discount_value: 10, description: '10% off' },
        'SUMMER25': { discount_type: 'fixed', discount_value: 25, description: '$25 off' },
      };

      const promo = fallbackCodes[normalizedCode];
      if (promo) {
        const discount = promo.discount_type === 'percentage'
          ? (orderAmount || 0) * (promo.discount_value / 100)
          : promo.discount_value;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            valid: true,
            code: normalizedCode,
            discountType: promo.discount_type,
            discountValue: promo.discount_value,
            discountAmount: Math.min(discount, orderAmount || discount),
            description: promo.description,
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, error: 'Invalid promo code' }),
      };
    }

    // Look up promo code in database
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, error: 'Invalid promo code' }),
      };
    }

    // Check validity dates
    const today = new Date().toISOString().split('T')[0];

    if (promo.valid_from && today < promo.valid_from) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, error: 'This promo code is not yet active' }),
      };
    }

    if (promo.valid_until && today > promo.valid_until) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, error: 'This promo code has expired' }),
      };
    }

    // Check usage limit
    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: false, error: 'This promo code has reached its usage limit' }),
      };
    }

    // Check minimum order amount
    if (promo.min_order_amount && orderAmount < promo.min_order_amount) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          valid: false,
          error: `Minimum order of $${promo.min_order_amount} required for this code`,
        }),
      };
    }

    // Calculate discount
    let discountAmount;
    if (promo.discount_type === 'percentage') {
      discountAmount = (orderAmount || 0) * (promo.discount_value / 100);
    } else {
      discountAmount = promo.discount_value;
    }

    // Don't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount || discountAmount);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        code: promo.code,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        discountAmount: Math.round(discountAmount * 100) / 100,
        description: promo.description,
      }),
    };
  } catch (error) {
    console.error('Error validating promo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ valid: false, error: 'Failed to validate promo code' }),
    };
  }
};
