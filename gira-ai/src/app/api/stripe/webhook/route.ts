import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabaseClient";
import Stripe from "stripe";

export const config = {
  runtime: "edge",
};

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body, "utf8"),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
      const subscriptionId = invoice.subscription ?? null;
      if (subscriptionId) {
        const subs = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subs.metadata?.user_id;
        if (userId) {
          await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);
        }
      }
      break;
    }
    default:
      break;
  }

  return new NextResponse("ok");
}