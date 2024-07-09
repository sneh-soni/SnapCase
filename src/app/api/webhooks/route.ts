import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import OrderReceivedEmail from "@/components/email/OrderReceivedEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Extract body as string that's what .constructEvent expects
    const body = await req.text();
    // Signature header sent by Stripe to make sure request came from Stripe
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    // Construct event using body, signature and webhook secret
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      // Make sure payment is completed
      // event.data.object contains API resource relevant to the event.
      // Throw error if user email is missing
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email");
      }

      // Name event.data.object as session of type Stripe.Checkout.Session
      // (sure because it's the only event we are listening to)
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract {userId, orderId} from metadata set in design preview actions
      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || !orderId) {
        throw new Error("Invalid request metadata");
      }

      // Extract user's billing address and shipping address
      const billingAddress = session.customer_details!.address;
      const shippingAddress = session.shipping_details!.address;

      //  Update Order with payment details
      const updatedOrder = await db.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          shippingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAddress!.city!,
              country: shippingAddress!.country!,
              postalCode: shippingAddress!.postal_code!,
              street: shippingAddress!.line1!,
              state: shippingAddress!.state,
            },
          },
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAddress!.city!,
              country: billingAddress!.country!,
              postalCode: billingAddress!.postal_code!,
              street: billingAddress!.line1!,
              state: billingAddress!.state,
            },
          },
        },
      });

      // Send Order confirmed and thank you email to user
      await resend.emails.send({
        from: "snapcase <ssneh20062003@gmail.com>",
        to: [event.data.object.customer_details.email],
        subject: "Thank you for your Order!",
        // react: receives react-email component
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          // @ts-ignore
          shippingAddress: {
            name: session.customer_details!.name!,
            city: shippingAddress!.city!,
            country: shippingAddress!.country!,
            postalCode: shippingAddress!.postal_code!,
            street: shippingAddress!.line1!,
            state: shippingAddress!.state,
          },
        }),
      });
    }

    // Return success response
    return NextResponse.json({ result: event, success: true });
  } catch (err) {
    // To debug in production
    console.error(err);
    // Can also use services like sentry(for enterprise)

    return NextResponse.json(
      { message: "Something went wrong", success: false },
      { status: 500 }
    );
  }
}
