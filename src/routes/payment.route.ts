import express, { Router } from "express";

import { prisma } from "..";
import Stripe from "stripe";

const paymentRouter = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
  appInfo: {
    name: "Breathing Ai",
    url: "https://",
    version: "0.0.2",
  },
  typescript: true,
});

paymentRouter.post("/create-subscription", async (req, res) => {
  /**
   * @swagger
   * /payment/create-subscription:
   *   post:
   *     summary: Create Subscription
   *     description: Create a new subscription using Stripe.
   *     tags:
   *       - Payment
   *     requestBody:
   *       description: Request body containing subscription details.
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 description: The quantity of the subscription to be created.
   *               id:
   *                 type: string
   *                 description: The client reference ID.
   *     responses:
   *       200:
   *         description: Successfully created a new subscription session.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: The ID of the subscription session created in Stripe.
   *       500:
   *         description: Internal Server Error. An error occurred while processing the request.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates whether the request was successful (false in this case).
   *                 message:
   *                   type: string
   *                   description: A message describing the error that occurred.
   */

  const { quantity, id } = req.query;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "us_bank_account"],
    line_items: [
      {
        price: process.env.STRIPE_PLAN_ID,
        quantity: Number(quantity),
      },
    ],
    mode: "subscription",
    success_url: `${req.headers.origin}/success`,
    cancel_url: `${req.headers.origin}/app/signup`,
    client_reference_id: id as string,
    metadata: {
      quantity: Number(quantity),
    },
  });

  return res.json({ id: session.id });
});

paymentRouter.post(
  "/update-subscription",
  express.json(),
  express.urlencoded({ extended: false }),
  async (req, res) => {
    /**
     * @swagger
     * /payment/update-subscription:
     *   post:
     *     summary: Update Subscription
     *     description: Update the quantity of an existing subscription.
     *     tags:
     *       - Payment
     *     requestBody:
     *       description: Request body containing subscription update details.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: The ID of the subscription to be updated.
     *               quantity:
     *                 type: string
     *                 description: The new quantity for the subscription.
     *     responses:
     *       200:
     *         description: Successfully updated the subscription.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   description: Indicates whether the request was successful (true in this case).
     *                 message:
     *                   type: string
     *                   description: A message confirming the successful update.
     *       404:
     *         description: Subscription Not Found. The specified subscription ID does not exist.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   description: Indicates whether the request was successful (false in this case).
     *                 message:
     *                   type: string
     *                   description: Error message indicating that the subscription was not found.
     *       500:
     *         description: Internal Server Error. An error occurred while processing the request.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   description: An error message indicating that an internal error occurred.
     */

    const {
      id,
      quantity,
    }: {
      id: string;
      quantity: string;
    } = req.body;

    try {
      // const existingSubscription = await stripe.subscriptions.retrieve(id);

      // if (!existingSubscription) return res.status(404).json({ success: false, message: 'Subscription not found' })

      // await stripe.subscriptions.update(
      //     id,
      //     {
      //         items: [
      //             {
      //                 id: existingSubscription.items.data[0].id,
      //                 quantity: Number(quantity),
      //             },
      //         ],
      //     }
      // );

      const existingSubscription = await stripe.subscriptions.retrieve(id);

      if (!existingSubscription)
        return res
          .status(404)
          .json({ success: false, message: "Subscription not found" });

      let finalQuantity =
        (existingSubscription.items.data[0]?.quantity ?? 0) + Number(quantity);

      await stripe.subscriptionItems.update(
        existingSubscription.items.data[0].id,
        {
          quantity: Number(finalQuantity),
        }
      );

      await prisma.subscription.updateMany({
        where: {
          subscriptionId: id,
        },
        data: {
          quantity: Number(finalQuantity),
        },
      });

      const customer = await prisma.customer.findMany({
        where: {
          subscriptionId: id,
        },
        select: {
          quantity: true,
          info: true,
        },
      });

      await prisma.customer.updateMany({
        where: {
          subscriptionId: id,
        },
        data: {
          info: {
            ...(customer as any)?.info,
            seats: Number(finalQuantity),
          },
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error updating subscription quantity:", error);
      return res.status(500).json({
        error: "An error occurred while updating subscription quantity",
      });
    }
  }
);

paymentRouter.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    /**
     * @swagger
     * /payment/stripe-webhook:
     *   post:
     *     summary: Handle Stripe Webhook Events
     *     description: Handle incoming Stripe webhook events for various subscription-related events.
     *     tags:
     *       - Payment
     *     requestBody:
     *       description: The raw Stripe webhook event data.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: Successfully handled the Stripe webhook event.
     *       500:
     *         description: Internal Server Error. An error occurred while processing the webhook event.
     */

    const stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"]!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (stripeEvent.type) {
      case "checkout.session.completed":
        //   case "customer.subscription.updated":
        //   case "customer.subscription.created":
        const subscription = stripeEvent.data.object as any;

        await prisma.subscription.create({
          data: {
            customerId: subscription.client_reference_id,
            stripeCustomerId: subscription.customer,
            subscriptionId: subscription.subscription,
            quantity: Number(subscription.metadata.quantity),
          },
        });

        const customer = await prisma.customer.findUnique({
          where: {
            id: subscription.client_reference_id,
          },
          select: {
            quantity: true,
            info: true,
          },
        });

        const newQuantity =
          customer?.quantity ??
          0 + parseInt(subscription.metadata.quantity, 10);

        await prisma.customer.update({
          where: {
            id: subscription.client_reference_id,
          },
          data: {
            quantity: Number(newQuantity),
            info: {
              ...(customer as any)?.info,
              seats: Number(newQuantity),
            },
            stripeCustomer: subscription.customer,
            subscriptionId: subscription.subscription,
          },
        });

        break;

      case "charge.succeeded":
        const charge = stripeEvent.data.object as any;

        try {
        } catch (error) {
          console.log(error);
        }

        break;

      case "customer.subscription.deleted":
        const cancelledSubscription = stripeEvent.data.object as any;

        try {
          await prisma.subscription.deleteMany({
            where: {
              subscriptionId: cancelledSubscription.id,
            },
          });

          const customer = await prisma.customer.findUnique({
            where: {
              id: subscription.client_reference_id,
            },
            select: {
              quantity: true,
              info: true,
            },
          });

          const newQuantity =
            customer?.quantity ??
            0 - parseInt(subscription.metadata.quantity, 10);

          await prisma.customer.update({
            where: {
              id: subscription.client_reference_id,
            },
            data: {
              quantity: Number(newQuantity),
              info: {
                ...(customer as any)?.info,
                seats: Number(newQuantity),
              },
            },
          });
        } catch (error) {
          console.log(error);
        }

        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    res.sendStatus(200);
  }
);

paymentRouter.post("/cancel-subscription", async (req, res) => {
  /**
   * @swagger
   * /payment/cancel-subscription:
   *   post:
   *     summary: Cancel Subscription
   *     description: Cancel one or more subscriptions associated with a customer.
   *     tags:
   *       - Payment
   *     parameters:
   *       - in: query
   *         name: customerId
   *         description: The ID of the customer whose subscriptions need to be canceled.
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully canceled the subscriptions.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates whether the request was successful (true in this case).
   *                 message:
   *                   type: string
   *                   description: A message confirming the successful cancellation.
   *       500:
   *         description: Internal Server Error. An error occurred while processing the request.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   description: Indicates whether the request was successful (false in this case).
   *                 message:
   *                   type: string
   *                   description: An error message indicating that something went wrong.
   */

  const { customerId } = req.query;

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        id: customerId as string,
      },
    });

    subscriptions.forEach(async (subscription) => {
      await stripe.subscriptions.del(subscription.subscriptionId);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export default paymentRouter;
