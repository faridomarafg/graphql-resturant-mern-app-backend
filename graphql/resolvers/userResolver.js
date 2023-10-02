const User = require('../../models/UserModel');
const checkAuth = require('../../middleware/authMiddleware');
const bcrypt = require('bcrypt');
const {generateToken, verifyToken,generateResetToken} = require('../../utils/token');
const sendEmail = require('../../utils/sendEmail');
const BASE_URL = process.env.BASE_URL;

module.exports = {
    Query:{
       //Get all users
        async getUsers(){
          const users = await User.find();
          return users;
       },
       
       //Get user by id
       async getUser(_,{id}){
          const user = await User.findById(id);
          return user;
       }
    },


    Mutation:{
        //REGISTER USER
        async registerUser(_, { name, email, password }) {
            try {
                // Check if a user with the same email already exists
                const existingUser = await User.findOne({ email });
        
                if (existingUser) {
                    if (existingUser.verified) {
                        throw new Error('Email is already registered and verified!');
                    } else {
                        // If the user exists but is not verified, update their information
                        // and send a new verification email
                        const token = generateToken({
                            name: existingUser.name,
                            email: existingUser.email,
                            id: existingUser.id,
                            password: existingUser.password,
                        });
        
                        // Send email to verify account with a new verification token
                        await sendEmail({
                            to: existingUser.email,
                            url: `/${BASE_URL}/verify-email/${token}`,
                            text: 'VERIFY ACCOUNT',
                        });
        
                        return {
                            success: true,
                            message: 'A new verification email has been sent. Please check your inbox.',
                        };
                    }
                }
        
                // If the user does not exist, create a new user in the database
                const hashedPwd = await bcrypt.hash(password, 10);
        
                const newUser = new User({
                    name,
                    email,
                    password: hashedPwd,
                });
        
                await newUser.save(); // Save the new user to the database
                
                //create token for nuexisted-user
                const token = generateToken({name:newUser.name, email:newUser.email, id:newUser.id, verified:newUser.verified, role:newUser.role});
        
                // Send email to verify account
                await sendEmail({
                    to: newUser.email,
                    url: `/${BASE_URL}/verify-email/${token}`,
                    text: 'VERIFY ACCOUNT',
                });
        
                return {
                    success: true,
                    message: 'Verify your email to complete registration!',
                };
            } catch (error) {
                console.error(error);
                throw new Error(error.message);
            }
        },
        

        //VERIFY USER TO COMPELETE REGISTERATION
        async verifyUser(_, { token }) {
            try {
                // Get user information from the token
                const { email, name, password } = verifyToken(token);
        
                // Check if a user with the same email already exists
                const existingUser = await User.findOne({ email });
        
                if (existingUser) {
                    // If the user already exists, check if they are already verified
                    if (existingUser.verified) {
                        throw new Error('Email is already verified!');
                    } else {
                        // Update the existing user's information to mark them as verified
                        existingUser.verified = true;
                        await existingUser.save();
        
                        return {
                            success: true,
                            message: 'Verification is successful!',
                        };
                    }
                }
        
                //Create a new user in the database if the user does not exist
                await User.create({
                    name,
                    email,
                    password,
                    verified: true,
                    createdAt: new Date().toISOString(),
                });
        
                return {
                    success: true,
                    message: 'Verification is successful!',
                };
            } catch (error) {
                console.error(error);
                throw new Error(error.message);
            }
        }
        ,

        //Login user
        async loginUser(_,{email, password}){
            //find user to login
            const user = await User.findOne({email});
            
            if(!user) throw new Error('This Email is not exist!');

            //check for validPassword
            const validPassword = await bcrypt.compare(password, user.password);
            if(!validPassword) throw new Error('Invalid password!');

            //create token
            const token = generateToken({name:user.name, email:user.email, id:user.id, verified:user.verified, role:user.role});

            return{
                ...user._doc,
                id:user._id,
                token
            }
        },

        async deleteUser(_,{id}, context){
           const user = checkAuth(context); 
           
           try {
            const targetUser = await User.findById(id);
            if(!targetUser) throw new Error(`User not exist with this ID: ${id}`);
            if(user.role === 'admin' || user.id === targetUser.id){
                await targetUser.deleteOne();
                return true
            }
            throw new Error('Unauthorized, only admin and owner of this account can delete the account!')
           } catch (error) {
             console.log(error);
             throw new Error(error);
           }
        },

        //FORGOT PASSWORD 
        async forgotPassword(_,{email}){
            //find user by email,
            const user = await User.findOne({email});
            if(!user) throw new Error('Email not exist!');
            
            //Generate and save reset token
            const resetToken = generateResetToken();
            user.resetToken = resetToken;
            user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
            await user.save();


            // Send the reset token to the user via email 
            await sendEmail({
                to: user.email,
                url: `/${BASE_URL}/reset-password/${resetToken}`, 
                text: 'RESET PASSWORD',
            });
    
            return {
            success: true,
            message: 'Reset token sent to your email.',
            };
        },


        //RESET PASSWORD
        async resetPassword(_,{resetToken, newPassword}){

            //find user by reset token,
            const user = await User.findOne({
                resetToken,
                resetTokenExpiry: { $gt: Date.now() }, // Ensure the token is not expired
            });
            if(!user) throw new Error('Invalid or expired token!');

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password and clear the reset token
            user.password = hashedPassword;
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await user.save();

            return {
                success: true,
                message: 'Password reset successfully.',
            };
        },
    }
}