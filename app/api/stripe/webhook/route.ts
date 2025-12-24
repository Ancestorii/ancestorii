import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ✅ Stripe init (same key as before)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ✅ Supabase server client (service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ Webhook endpoint secret (we’ll add this soon)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
   if (!sig) {
  return NextResponse.json(
    { error: 'Missing Stripe signature' },
    { status: 400 }
  );
}

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: unknown) {
  const message =
    err instanceof Error ? err.message : 'Invalid signature';

  console.error('⚠️ Webhook signature verification failed.', message);

  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
}


  try {
    switch (event.type) {
      case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;

       await supabase
       .from('subscriptions')
       .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      status: 'trialing',
      plan_name: plan,
      started_at: new Date().toISOString(),
    });

  console.log(`✅ Subscription created for ${userId} (${plan})`);
  break;
}


      case 'customer.subscription.updated': {
     const subscription = event.data.object as Stripe.Subscription & {
     current_period_end: number;
      };
      const status = subscription.status;
      const customerId = subscription.customer as string;

        await supabase
          .from('subscriptions')
          .update({
            status,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        console.log(`🔄 Subscription updated: ${customerId} → ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId);

        console.log(`❌ Subscription canceled for ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: unknown) {
  console.error('Error processing webhook:', err);
  return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
}
}
