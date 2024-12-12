const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ]
    },
    phonenumber: {
        type: Number,
        required: [true, 'Please provide phone number']
    },
    location: {
        type: String,
        required: [true, 'Please provide location']
    },
    message: {
        type: String,
        required: [true, 'Please provide message']
    },
    isReplied: {
        type: Boolean,
        default: false,
        required: [true, "Please provide isReplied"]
    }
    
}, 
  { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)