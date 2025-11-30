// webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  console.log('Webhook received:', stripeEvent.type);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(stripeEvent.data.object);
        break;

      case 'invoice.payment_succeeded':
        console.log('Invoice paid:', stripeEvent.data.object.id);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
  } catch (err) {
    console.error('Error handling webhook event:', err);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

async function handleCheckoutComplete(session) {
  const userId = session.metadata.userId;
  const productType = session.metadata.productType;

  console.log('Processing payment for user:', userId, 'Product:', productType);

  // Insert into purchases table
  const { error: purchaseErr } = await supabase.from('purchases').insert({
    user_id: userId,
    stripe_session_id: session.id,
    amount: session.amount_total / 100, // Stripe amounts in cents
    product_type: productType,
    searches_added: productType === 'payg' ? 5 : null
  });
  
  if (purchaseErr) console.error('Error inserting purchase:', purchaseErr);
  else console.log('Purchase recorded for user', userId);

  // Update user profile
  if (productType === 'payg') {
    // Add searches to user's account
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('search_count, search_limit')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ search_limit: (profile.search_limit || 0) + 5 })
        .eq('id', userId);

      if (updateError) console.error('Error updating profile:', updateError);
      else console.log('Successfully added 5 searches to user:', userId);
    }

  } else if (productType.includes('pro')) {
    // Upgrade to Pro
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'pro',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      })
      .eq('id', userId);

    if (updateError) console.error('Error upgrading to pro:', updateError);
    else console.log('Successfully upgraded user to pro:', userId);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'free',
        stripe_subscription_id: null,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) console.error('Error downgrading user:', error);
    else console.log('Subscription cancelled:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}
