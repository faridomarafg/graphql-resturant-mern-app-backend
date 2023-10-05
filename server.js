require('dotenv').config();
const {ApolloServer} = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { dbConnect } = require('./config/dbConnect');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const Order = require('./models/orderModel');
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;


const PORT = 3500;

//Connection to DB
dbConnect();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", 'https://graphql-resturant-mern-app-frontend.onrender.com'],
    credentials: true,
  })
);


app.use(
  express.json({
    limit: '10mb',
    type: 'application/json',
  })
);


function verifyWebhookSignature(req, res, next) {
    const sig = req.headers['stripe-signature'];
  
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
      req.stripeEvent = event;
      next();
    } catch (err) {
      console.error(`Error verifying webhook signature: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  app.post('/stripe-webhook', express.raw({ type: 'application/json' }), verifyWebhookSignature, async (req, res) => {
    const event = req.stripeEvent;


    switch (event.type) {
      case 'checkout.session.completed':
        const paymentIntent = event.data.object;
        console.log({paymentIntent});
       //create or update order here
        try {
            const order = await Order.findOne({sessionId: paymentIntent.id});
            console.log('order.id :', order.id);
            order.paid = paymentIntent.payment_status;
            //order.subTotal = paymentIntent.amount_subtotal
            order.subTotal = 3000
            order.save();
        } catch (error) {
            console.log(error);
            throw new Error(error.message)
        }

        break;
  
      case 'invoice.payment_failed':
        const invoice = event.data.object;
        console.log(`Payment failed for Invoice ID: ${invoice.id}`);
        break;
  
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
  
    res.json({ received: true });
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });
  
  async function startApolloServer() {
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });
  
    app.listen(PORT, () => {
      console.log(`App is running on Port ${PORT}`);
    });
  }
  
  startApolloServer();
  