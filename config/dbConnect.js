const mongoose = require('mongoose');

const dbConnect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to mongoDB');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = {
    dbConnect
}