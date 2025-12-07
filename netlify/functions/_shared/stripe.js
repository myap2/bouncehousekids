const Stripe = require('stripe');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('Stripe secret key not configured');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

module.exports = { stripe };
