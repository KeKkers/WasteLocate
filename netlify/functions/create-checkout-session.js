const stripe = require('stripe');

const handler = async (event, context) => {
  // Initialize Stripe
  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers, 
      body: '' 
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { priceId, userId, email, productType } = JSON.parse(event.body);

    console.log('Creating checkout session for:', { priceId, userId, email, productType });

    if (!email) {
      throw new Error('Email is required');
    }

    // Determine the correct URL
    const siteUrl = process.env.URL || 'https://polite-dolphin-64a8b4.netlify.app';

    // Create checkout session config
    const sessionConfig = {
      payment_method_types: ['card'],
      mode: productType === 'payg' ? 'payment' : 'subscription',
      customer_email: email, // Pre-fill email
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
      metadata: {
        userId,
        productType,
        userEmail: email, // Store in metadata too
      },
      // Collect customer details
      billing_address_collection: 'required',
      // For subscriptions, we can also set up customer creation
      ...(productType !== 'payg' && {
        customer_creation: 'always',
      }),
    };

    // Create Stripe checkout session
    const session = await stripeClient.checkout.sessions.create(sessionConfig);

    console.log('Checkout session created:', {
      id: session.id,
      url: session.url,
      customer_email: session.customer_email,
      customer_details: session.customer_details
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
        customer_email: email
      }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
    };
  }
};

module.exports = { handler };
