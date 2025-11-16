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

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      const session = stripeEvent.data.object;
      await handleCheckoutComplete(session);
      break;

    case 'invoice.payment_succeeded':
      const invoice = stripeEvent.data.object;
      console.log('Invoice paid:', invoice.id);
      break;

    case 'customer.subscription.deleted':
      const subscription = stripeEvent.data.object;
      await handleSubscriptionDeleted(subscription);
      break;

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

async function handleCheckoutComplete(session) {
  const userId = session.client_reference_id;
  const productType = session.metadata.productType;

  console.log('Processing payment for user:', userId, 'Product:', productType);

  try {
    if (productType === 'payg') {
      // Add 5 searches to user's account
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('search_count, search_limit')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          search_limit: (profile.search_limit || 0) + 5,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('Successfully added 5 searches to user:', userId);
      }

    } else if (productType.includes('pro')) {
      // Upgrade to pro
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'pro',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error upgrading to pro:', updateError);
      } else {
        console.log('Successfully upgraded user to pro:', userId);
      }
    }
  } catch (error) {
    console.error('Error updating user after payment:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    // Downgrade user when subscription is cancelled
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'free',
        stripe_subscription_id: null,
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error downgrading user:', error);
    } else {
      console.log('Subscription cancelled:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}