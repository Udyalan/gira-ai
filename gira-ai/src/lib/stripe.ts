import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY env var");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Use default apiVersion from library typings
  appInfo: {
    name: "gira.ai",
    version: "1.0.0",
  },
});