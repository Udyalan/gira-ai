import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json({ error: "Missing price ID" }, { status: 500 });
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      metadata: {
        user_id: session.user.id,
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=1`,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to create session" }, { status: 500 });
  }
}