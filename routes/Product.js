// routes/Product.js

const express = require("express");
const router = express.Router();
const {
    getProducts,
    getSingleProduct,
    createProduct,
    deleteProduct,
    updateProduct,
} = require("../controllers/Product");
const authenticateUser = require("../middlewares/auth");

// Các route cho sản phẩm
router.route("/products").get(getProducts).post(authenticateUser, createProduct);
router
    .route("/products/:id")
    .get(getSingleProduct)
    .delete(authenticateUser, deleteProduct)
    .patch(authenticateUser, updateProduct);
    

module.exports = router;
