const jwt = require('jsonwebtoken');

const checkAuth = (context)=>{
  //context ={...headers}
   const authHeader = context.req.headers.authorization;

   if(authHeader){
    //create Bearrer token
    const token = authHeader.split('Bearer ')[1];
    if(token){
        try {
            //get usr from token
            const user = jwt.verify(token, process.env.JWT_SECRET);
            return user;
        } catch (error) {
            throw new Error('Invalid or expired token!');
        }
    }
    throw new Error('Authentication token must be a [Bearer ] token!');
   }
   throw new Error('Authorization must be Provided!')
};

module.exports = checkAuth