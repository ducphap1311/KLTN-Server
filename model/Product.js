const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    images: {
        type: Array,
        required: [true, 'must provide images']
    },
    name: {
        type: String,
        required: [true, 'must provide name']
    },
    price: {
        type: Number,
        required: [true, 'must provide price']
    }, 
    totalAmount: {
        type: Number,
        default: 1
    },
    description: {
        type: String
    },
    category: {
        type: String,
        enum: {
            values: ['men', 'women', 'kids'],
            message: '{VALUE} is not supported',
        }
    },
    quality: {
        type: String,
    },
},
{ timestamps: true })

module.exports = mongoose.model('Product', productSchema)