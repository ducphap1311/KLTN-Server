const express = require('express')
const router = express.Router()
const {getOrders, createOrder, getAllOrders, getSingleOrder} = require('../controllers/Order')
const authenticateUser = require('../middlewares/auth')

router.route('/orders').get(authenticateUser, getOrders)
router.route('/orders').post(authenticateUser, createOrder)
router.route('/allorders').get(getAllOrders)
router.route('/orders/:id').get(getSingleOrder)

module.exports = router