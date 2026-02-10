import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_PRICES } from "@/lib/stripe";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  // 認証チェック
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // プラン取得
  const { plan } = await req.json();
  const planPrice = PLAN_PRICES[plan];
  if (!planPrice) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Stripe Customer 取得 or 作成
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Checkout Session 作成
  const origin = req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: { name: planPrice.name },
          unit_amount: planPrice.priceYen,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/account?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    metadata: {
      supabase_user_id: user.id,
      plan,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
