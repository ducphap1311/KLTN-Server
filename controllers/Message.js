const Message = require("../model/Message");

const createMessage = async (req, res) => {
    try {
    // Tạo document mới từ body
    const message = await Message.create(req.body);

    // Phản hồi thành công
    res.status(201).json({
      message: "Message created successfully",
      data: message,
    });
  } catch (error) {
    // Kiểm tra lỗi từ Mongoose
    console.log(error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({
        message: "Validation error",
        errors,
      });
    } else {
      console.error("Error creating message:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

const updateMessage = async (req, res) => {
  try {
    const { id } = req.params; // ID của message cần cập nhật
    const updateData = req.body; // Dữ liệu cần cập nhật từ client

    // Kiểm tra xem message có tồn tại không
    const existingMessage = await Message.findById(id);
    if (!existingMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Cập nhật message
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true } // `new: true` để trả về document đã cập nhật, `runValidators` để kiểm tra dữ liệu
    );

    res.status(200).json({ message: "Message updated successfully", data: updatedMessage });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Failed to update message", error: error.message });
  }
};


const getMessages = async (req, res) => {
    const message = await Message.find({});
    res.status(200).json({ message });
};

const deleteMessage = async(req, res) => {
    
    const message = await Message.findByIdAndDelete({_id: req.params.id})
    res.status(200).json({message: "delete successfully!"})
}

const deleteAll = async (req, res) => {
    const messages = await Message.deleteMany({})
    res.status(200).json({message: "Delete all"})
}

module.exports = { createMessage, getMessages, deleteMessage, deleteAll, updateMessage };
