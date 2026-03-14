const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { amount, bookingCode, route, email } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: 'VIS Airlines - Rezerwacja ' + bookingCode,
                        description: route || 'Lot VIS Airlines',
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://visairlines.github.io/VISAIRLINES/rezerwacje.html?paid=' + bookingCode,
            cancel_url: 'https://visairlines.github.io/VISAIRLINES/booking.html?cancelled=true',
            customer_email: email || undefined,
        });
        res.status(200).json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
