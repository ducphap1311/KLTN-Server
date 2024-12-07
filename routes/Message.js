const express = require('express')
const { createMessage, getMessages, deleteMessage, deleteAll, updateMessage } = require('../controllers/Message')
const router = express.Router()

router.route('/messages').post(createMessage).get(getMessages).delete(deleteAll)
router.route("/messages/:id").delete(deleteMessage).patch(updateMessage)

module.exports = router