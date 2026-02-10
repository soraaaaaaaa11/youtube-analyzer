import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Webhook event received:", event.type);

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;
      console.log("checkout.session.completed - userId:", userId, "plan:", plan);

      if (userId && plan) {
        // まず plan と stripe_customer_id のみ更新（stripe_subscription_id カラムが未作成でも動くように）
        const { error } = await admin
          .from("users")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update user plan:", error);
        } else {
          console.log("User plan updated successfully:", userId, "->", plan);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      const plan = subscription.metadata?.plan;
      console.log("subscription.updated - userId:", userId, "plan:", plan);

      if (userId && plan) {
        const { error } = await admin
          .from("users")
          .update({ plan })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update subscription:", error);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      console.log("subscription.deleted - userId:", userId);

      if (userId) {
        const { error } = await admin
          .from("users")
          .update({ plan: "free" })
          .eq("id", userId);

        if (error) {
          console.error("Failed to reset plan:", error);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
