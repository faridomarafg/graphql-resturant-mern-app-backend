const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const checkAuth = require('../../middleware/authMiddleware');
const Order = require('../../models/orderModel');

module.exports = {

  Query:{
    //GET-ORDERS
    async getOrders(){
      const orders = await Order.find();
      return orders;
    },

    //GET ORDER-BY-ID
    async getOrder(_,{id}){
      const order = await Order.findById(id);
      return order;
    }
  }, 

    Mutation:{

        createCheckoutSesstion: async (_, { cartItems,userDetailsInput}) => {
          console.log({cartItems});
            
            const lineItems = cartItems.map((item) => {
              return {
                price_data: {
                  currency: 'inr',
                  product_data: {
                    name: item.name,
                    images: item.images,
                  },
                  unit_amount: item.price,
                },
                quantity: item.cartQuantity,
              }
            });
          
            const session = await stripe.checkout.sessions.create({
              phone_number_collection: {
                enabled: true,
              },
              payment_method_types: ['card'],
              line_items: lineItems,
              mode: 'payment',
              success_url: `${process.env.BASE_URL}/success-payment`,
              cancel_url: `${process.env.BASE_URL}`,
            });

            // create order here
            try {
                const newOrder = new Order({
                    line_items:cartItems,
                    sessionId: session.id,
                    userId: userDetailsInput.userId,
                    userName:userDetailsInput.userName,
                    email:userDetailsInput.email,
                    city:userDetailsInput.city,
                    postalCode:userDetailsInput.postalCode,
                    phone:userDetailsInput.phone,
                    full_address:userDetailsInput.full_address,
                    
                });
                await newOrder.save();
                //console.log({newOrder});
            } catch (error) {
                console.log(error);
                throw new Error(error)
            }   
          
            return {
              id: session.id,
              url: session.url,
            };
        },
 
        // EDIT-ORDER
        async editOrder(_,{id, deliveryStatus},context){
          const user = checkAuth(context);
          try {
           const order = await Order.findById(id);
           if(!order) throw new Error(`No order found with this ID: ${id}`);

           //check for admin to update the order status,
           if(user.role === 'admin'){
            order.deliveryStatus = deliveryStatus;
            const updatedOrder = await order.save();
            return updatedOrder;
           }else{
            throw new Error({message:'Unauthorized!, you are not an admin!'}); 
           }

          } catch (error) {
            throw new Error(error)
          }           
        },

        //DELETE-ORDER
        async deleteOrder(_,{id},context){
          const user = checkAuth(context);
          try {
            const order = await Order.findById(id);
            if(!order) throw new Error(`No order found with this ID: ${id}`);

            if(user.role === 'admin' || order.userId === user.id){
               await order.deleteOne();
               return true;
            }
            throw new Error('unauthorized, only admin and owner of order can delete order!');
          } catch (error) {
            throw new Error(error)
          }
        }
    }
}

