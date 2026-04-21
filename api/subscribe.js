import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

export default async function handler(req, res) {
  const { plan } = req.body;

  let priceId;

  if (plan === "starter") {
    priceId =
      process.env.STRIPE_STARTER_PRICE_ID;
  }

  if (plan === "pro") {
    priceId =
      process.env.STRIPE_PRO_PRICE_ID;
  }

  const session =
    await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],

      success_url:
        "https://ai-seo-app-self.vercel.app/success",

      cancel_url:
        "https://ai-seo-app-self.vercel.app/cancel"
    });

  return res.status(200).json({
    url: session.url
  });
}
