const stripe = require('stripe');

const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { priceId, userId, email, productType } = JSON.parse(event.body);

    if (!email || !userId || !priceId || !productType) {
      throw new Error('Missing required parameters');
    }

    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.URL || 'https://your-site.netlify.app';

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: productType === 'payg' ? 'payment' : 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
      metadata: { userId, productType, userEmail: email },
      client_reference_id: userId, // optional
      billing_address_collection: 'required',
      ...(productType !== 'payg' && { customer_creation: 'always' }),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};

module.exports = { handler };
