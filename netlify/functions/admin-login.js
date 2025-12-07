const { validateCredentials, generateToken } = require('./_shared/auth');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and password are required' }),
      };
    }

    // Validate credentials
    if (!validateCredentials(email, password)) {
      // Add delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    // Generate token
    const token = generateToken(email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        email,
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Login failed' }),
    };
  }
};
