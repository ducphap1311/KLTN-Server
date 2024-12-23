// models/Product.js

const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        required: [true, 'Size is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        default: 0
    }
});

const productSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: [true, 'Must provide image']
        },
        name: {
            type: String,
            required: [true, 'Must provide name']
        },
        price: {
            type: Number,
            required: [true, 'Must provide price']
        },
        sizes: {
            type: [sizeSchema],
            required: [true, 'Must provide sizes']
        },
        description: {
            type: String
        },
        brand: {
            type: String,
            enum: {
                values: ['MLB', 'Adidas', 'Crocs'],
                message: '{VALUE} is not supported'
            }
        },
        quality: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
