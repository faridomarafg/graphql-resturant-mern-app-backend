const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateResetToken = () => {
    // Generate a random token
    const token = crypto.randomBytes(20).toString('hex');
  
    return token;
  };

const generateToken = (payload)=>{
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:'1d'});
};


const verifyToken = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET)
};

module.exports = {
    generateToken,
    verifyToken,
    generateResetToken
}