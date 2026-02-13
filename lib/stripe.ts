import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

// プラン別価格設定（JPY）
export const PLAN_PRICES: Record<string, { name: string; priceYen: number }> = {
  pro: { name: "Pro プラン", priceYen: 300 },
};
