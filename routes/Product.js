const express = require("express");
const router = express.Router();
const {
    getProducts,
    getSingleProduct,
    createProduct,
    deleteProduct,
    updateProduct,
} = require("../controllers/Product");

router.route("/products").get(getProducts)
router
    .route("/products/:id")
    .get(getSingleProduct)
    .post(createProduct)
    .delete(deleteProduct)
    .put(updateProduct);
module.exports = router;
