const Order = require('../model/Order')
const {NotFoundError} = require('../errors')
const getOrders = async (req, res) => {
    const createdBy = req.user.id;
    const orders = await Order.find({createdBy})
    res.status(200).json({ orders });
};

const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(200).json({orders})
}

const createOrder = async (req, res) => {
    req.body.createdBy = req.user.id;
    const order = await Order.create(req.body)
    res.status(200).json({order});
};

const getSingleOrder = async (req, res) => {
    const id = req.params.id
    const order = await Order.findOne({_id: id})
    if(!order){
        throw new NotFoundError(`No order with id ${id}`)
    }
    res.status(200).json({order})
}

const deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ error: "Failed to delete order" });
  }
}


const updateOrder = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // Expecting the updated fields in the request body

  try {
    // Check if the order exists
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure the data respects schema validation
    });

    return res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ error: "Failed to update order" });
  }
}

module.exports = { getOrders, getAllOrders, createOrder, getSingleOrder, deleteOrder, updateOrder };
