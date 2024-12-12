const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please provide name"],
        },
        email: {
            type: String,
            required: [true, "please provide name"],
        },
        address: {
            type: String,
            required: [true, "please provide address"],
        },
        amount: {
            type: Number,
            required: [true, 'please provide amount products']
        },
        orderTotal: {
            type: Number,
            requried: [true, "please provide price"],
        },
        cartItems: {
            type: Array,
            required: [true, "please provide cart items"],
        },
        createdBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'please provide user']
        },
        phone: {
            type: String,
            required: [true, "Please provide phone number"],
            match: [/^(\+84|0)\d{9,10}$/, "Phone number is not valid"], 
        },
        isPaid: {
            type: Boolean,
            default: false, 
            required: true, 
        },
        status: {
            type: String,
            enum: ["Pending", "Shipping", "Delivered", "Cancelled"], 
            default: "Pending",
            required: true,
        },
        trackingCode: {
            type: String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order',orderSchema)
