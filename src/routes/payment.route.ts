import express, { Router } from 'express';

import { prisma } from '..';
import Stripe from 'stripe';

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

paymentRouter.post('/create-subscription', async (req, res) => {
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
        cancel_url: `${req.headers.origin}/checkout`,
        client_reference_id: id as string,
        metadata: {
            quantity: Number(quantity),
        },

    });

    return res.json({ id: session.id });
});

paymentRouter.post("/stripe-webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {

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
                    }
                })

                const customer = await prisma.customer.findUnique({
                    where: {
                        id: subscription.client_reference_id,
                    },
                    select: {
                        quantity: true,
                        info: true,
                    },
                });


                const newQuantity = customer?.quantity ?? 0 + parseInt(subscription.metadata.quantity, 10);

                await prisma.customer.update({
                    where: {
                        id: subscription.client_reference_id,
                    },
                    data: {
                        quantity: Number(newQuantity),
                        info: {
                            ...(customer as any)?.info,
                            seats: Number(newQuantity),
                        }
                    },
                });

                break;

            case "charge.succeeded":
                const charge = stripeEvent.data.object as any;

                try {
                    // console.log(charge); =
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
                        }
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


                    const newQuantity = customer?.quantity ?? 0 - parseInt(subscription.metadata.quantity, 10);

                    await prisma.customer.update({
                        where: {
                            id: subscription.client_reference_id,
                        },
                        data: {
                            quantity: Number(newQuantity),
                            info: {
                                ...(customer as any)?.info,
                                seats: Number(newQuantity),
                            }
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
)

paymentRouter.post("/cancel-subscription", async (req, res) => {
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