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
        images: {
            type: [String],
            required: [true, 'Must provide images']
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
            type: [sizeSchema], // Mảng chứa kích thước và số lượng tương ứng
            required: [true, 'Must provide sizes']
        },
        description: {
            type: String
        },
        category: {
            type: String,
            enum: {
                values: ['men', 'women', 'kids'],
                message: '{VALUE} is not supported'
            }
        },
        quality: {
            type: String
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
