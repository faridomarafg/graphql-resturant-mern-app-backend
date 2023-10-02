const checkAuth = require('../../middleware/authMiddleware');
const Food = require('../../models/FoodModel');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid'); 

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImages(images) {
   const imageUrls = [];

   for (const image of images) {
       // Generate a unique filename using UUID
       const filename = uuidv4();

       // Upload the image to Cloudinary
       const result = await cloudinary.uploader.upload(image, {
           public_id: `graphql_resturant_app/${filename}`, // Set the folder and filename
       });

       // Add the public URL of the uploaded image to the list
       imageUrls.push(result.secure_url);
   }

   return imageUrls;
};


module.exports = {

    Query:{
       //Get all foods 
        async  getFoods(){
         const foods = await Food.find()
         return foods 
       },

       //Get single Food
       async getFood(_,{id}){
          const food = await Food.findById(id);
          if(!food) throw new Error(`Food not found with this ID :${id}`);

          return food;
       }
    },


    Mutation:{
        
      // CREATE FOOD
      async  createFood(_, { createFoodInput: { name, description, category, images, price, ingredients, isVege, isSpicy } }, context) {
         try {
             // Get user from token to create Food object
             const user = checkAuth(context);
             console.log({ user });
     
             if (user) {
                 if (user.role === 'admin') {
                     // Upload the images to Cloudinary and get the public URLs
                     const imageUrls = await uploadImages(images);
     
                     // Create a new Food object with the image URLs
                     const newFoodObject = await Food.create({
                         name,
                         description,
                         category,
                         images: imageUrls, // Store image URLs in the 'images' field
                         price,
                         ingredients,
                         isVege,
                         isSpicy,
                     });
     
                     return newFoodObject;
                 }
                 throw new Error('Unauthorized, You are not an admin!');
             }
             throw new Error('Login to continue the process!');
         } catch (error) {
             console.log(error);
             throw new Error(error);
         }
     },

     async deleteFood(_,{id},context){
        const user = checkAuth(context);
       try {
            if(user && user.role === 'admin'){
                const food = await Food.findById(id);
                if(!food) throw new Error(`Food object not found with this ID: ${id}`);
                await food.deleteOne()
                return true
            }
            throw new Error('unauthorized, your are not an admin!');
       } catch (error) {
         console.log(error);
         throw new Error(error)
       }
     },

     async editFood(_,{id,editInput},context){
        const user = checkAuth(context);
        try {
            if(user && user.role === 'admin'){
               const updatedFood = await Food.findByIdAndUpdate(id, {...editInput},{new: true});
               const result = await updatedFood.save();
               return result;
            }
            throw new Error('unauthorized!, you are not an admin!');
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
     }
       
    }
}
