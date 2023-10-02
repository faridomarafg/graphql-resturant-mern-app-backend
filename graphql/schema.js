const { gql } = require('apollo-server');

const typeDefs = /* GraphQL */gql`
   type User{
    id:ID!
    name:String!
    email:String!
    password:String!
    createdAt:String!
    message:String
    token:String
    role:String!
   }

   type Verify{
     token:String!
     message:String!
   }

   type ForgotPasswordResponse {
      success: Boolean!
      message: String
   }

   type ResetPasswordResponse {
      success: Boolean!
      message: String
   }

   type Food{
      id:ID!
      name:String!
      description:String!
      category:String!
      price:Int!
      images:[String!]!
      ingredients:[String!]!
      isVege:Boolean!
      isSpicy:Boolean!
   }

   type CheckoutSession {
      id: ID!
      url: String!
   }

   type CarItem{
      id:ID!
      name:String!
      cartQuantity:Int!
      price:Int!
      images:[String!]!
   }

   type Order{
      id:ID!
      line_items:[CarItem!]!
      sessionId:String!
      userId:String!
      userName:String!
      email:String!
      city:String!
      postalCode:Int!
      phone:String!
      full_address:String!
      paid:String!
      deliveryStatus:String!
      subTotal:Int!
   }

   type Query{
      getUsers:[User]
      getUser(id:ID!):User

      getFoods:[Food]
      getFood(id:ID!):Food

      getOrders:[Order]
      getOrder(id:ID!):Order
   }

   type Mutation{
      registerUser(name:String!, email:String!, password:String!):User!
      loginUser(email:String!, password:String!):User! 
      deleteUser(id:ID!):Boolean!

      verifyUser(token:String!):Verify!

      forgotPassword(email:String!):ForgotPasswordResponse!
      resetPassword(resetToken: String!, newPassword: String!):ResetPasswordResponse!

      createFood(createFoodInput:CreeateFoodInput!):Food!
      editFood(id:ID!, editInput:EditFoodInput):Food!
      deleteFood(id:ID!):Boolean!

      createCheckoutSesstion(cartItems:[CheckoutInput!]!,userDetailsInput:UserDetailsInput!):CheckoutSession!

      # createOrder: no need for createOrder-mutation, its create directly in checkout-shema;
      editOrder(id:ID!,deliveryStatus:String ):Order
      deleteOrder(id:ID!):Boolean!

   }

   input CheckoutInput{
      id:ID!
      name:String!
      cartQuantity:Int!
      price:Int!
      images:[String!]!
   }

   input UserDetailsInput{
      userId:String!
      userName:String!
      email:String!
      city:String!
      postalCode:String!
      phone:String!
      full_address:String!
   } 

   input CreeateFoodInput{
      name:String!
      description:String!
      category:String!
      price:Int!
      images:[String!]!
      ingredients:[String!]!
      isVege:Boolean!
      isSpicy:Boolean!
   }

   input EditFoodInput{
      name:String
      description:String
      category:String
      price:Int
      images:[String]
      ingredients:[String!]
      isVege:Boolean
      isSpicy:Boolean
   }
`;


module.exports = typeDefs;