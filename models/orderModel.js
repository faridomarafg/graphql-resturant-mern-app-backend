const mongoose = require('mongoose');


const orderSchema = mongoose.Schema({
    line_items: Object,
    userId:{
        type : String
    },
    sessionId:{
        type : String
    },
    userName:{
        type: String
    },
    email:{
        type: String
    },
    city:{
        type: String
    },
    postalCode:{
        type: Number
    },
    phone:{
        type: String
    },
    full_address:{
        type: String
    },
    subTotal:{
        type: Number,
        default: null
    },
    paid:{
        type: String,
        default: 'unPaid'
    },
    deliveryStatus:{
        type: String,
        default: 'Pending'
    }
},{
    timestamps: true
});


module.exports = mongoose.model('Order', orderSchema);