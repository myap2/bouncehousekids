const { supabase } = require('./_shared/supabase');

// Hardcoded fallback add-ons for when DB is not configured
const FALLBACK_ADD_ONS = [
  { id: 'table-6ft', name: 'Folding Table (6ft)', description: 'Standard 6-foot rectangular folding table', category: 'party_supplies', price_per_unit: 10.00, max_quantity: 10 },
  { id: 'chair', name: 'Folding Chair', description: 'White folding chair', category: 'party_supplies', price_per_unit: 2.00, max_quantity: 50 },
  { id: 'canopy-10x10', name: 'Pop-up Canopy (10x10)', description: '10x10 foot white pop-up canopy tent', category: 'party_supplies', price_per_unit: 35.00, max_quantity: 4 },
  { id: 'tent-20x20', name: 'Party Tent (20x20)', description: 'Large 20x20 foot party tent', category: 'party_supplies', price_per_unit: 75.00, max_quantity: 2 },
];

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
    const category = params.category || 'party_supplies';

    if (!supabase) {
      // Return fallback data if DB not configured
      const filtered = FALLBACK_ADD_ONS.filter(a => a.category === category);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ addOns: filtered }),
      };
    }

    // Fetch add-ons from database
    const { data: addOns, error } = await supabase
      .from('add_ons')
      .select('id, name, description, category, price_per_unit, max_quantity')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ addOns: addOns || [] }),
    };
  } catch (error) {
    console.error('Error fetching add-ons:', error);

    // Return fallback on error
    const params = event.queryStringParameters || {};
    const category = params.category || 'party_supplies';
    const filtered = FALLBACK_ADD_ONS.filter(a => a.category === category);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ addOns: filtered }),
    };
  }
};
