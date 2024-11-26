require('dotenv').config()
const express = require('express')
const app = express()
const connectDB = require('./db/connect')
const Product = require('./model/Product')
const ProductsList = require('./ProductsList.json')

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI)
        await Product.deleteMany()
        await Product.create(ProductsList)
        app.listen(3000, () => console.log('Server is listening on port 3000'))
    } catch (error) {
        console.log(error);
    }
}

start()