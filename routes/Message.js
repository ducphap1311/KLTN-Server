const express = require('express')
const { createMessage, getMessages } = require('../controllers/Message')
const router = express.Router()

router.route('/messages').post(createMessage).get(getMessages)

module.exports = router