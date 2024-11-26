const Message = require("../model/Message");

const createMessage = async (req, res) => {
    const message = await Message.create(req.body);
    res.status(201).json({ message });
};

const getMessages = async (req, res) => {
    const message = await Message.find({});
    res.status(200).json({ message });
};

module.exports = { createMessage, getMessages };
