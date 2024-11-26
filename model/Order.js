const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        name: {
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
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order',orderSchema)
