import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { priceId } = req.body;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    if (!priceId) {
        return res.status(400).json({ error: 'Price not found.' });
    }

    const nextUrl = process.env.NEXT_URL;
    if (!nextUrl) {
        return res.status(500).json({ error: 'NEXT_URL is not defined.' });
    }

    const successUrl = `${nextUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${nextUrl}/`;

    // Log para depuração
    console.log('Price ID:', priceId);

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            mode: 'subscription',
            line_items: [
                {
                    price: priceId, // Aqui está o priceId corretamente utilizado
                    quantity: 1,
                },
            ],
        });

        return res.status(201).json({
            checkoutUrl: checkoutSession.url,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
