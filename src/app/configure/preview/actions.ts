"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order } from "@prisma/client";

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  // Get configuration
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  });

  if (!configuration) {
    throw new Error("No such configuration found");
  }

  //  Get user
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    throw new Error("You need to be logged in");
  }

  const { finish, material, model } = configuration;
  const modelLabel = model?.replace("iphone", "iPhone ");

  console.log(modelLabel);

  //  Calculate price ==> Never pass as prop from client component as user can manipulate it
  //  Hence, not passed from DesignPreview, but recalculated here on the server
  let price = BASE_PRICE;
  if (finish === "textured") price += PRODUCT_PRICES.finish.textured;
  if (material === "polycarbonate")
    price += PRODUCT_PRICES.material.polycarbonate;

  //  Create order or if it exists don't
  let order: Order | undefined = undefined;

  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id,
    },
  });

  if (existingOrder) {
    order = existingOrder;
  } else {
    order = await db.order.create({
      data: {
        amount: price,
        userId: user.id,
        configurationId: configuration.id,
      },
    });
  }

  // Create product or order for stripe
  const product = await stripe.products.create({
    name: `Your custom ${modelLabel} case by SnapCase`,
    images: [configuration.imageUrl],
    default_price_data: {
      currency: "INR",
      unit_amount: price * 100, // stripe requires amount in smallest unit i.e. paise
    },
  });

  // Create Stripe Checkout Session
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`, // Redirect url after successfull payment
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`, // Redirect url after cancel
    payment_method_types: ["card"],
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["IN"] }, // Allowed in countries
    metadata: {
      // For stripe webhook to get user and order
      userId: user.id,
      orderId: order.id,
    },
    // list of items customer is purchasing
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });

  return { url: stripeSession.url }; // URL to checkout session
};
