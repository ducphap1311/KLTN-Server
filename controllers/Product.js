// controllers/Product.js

const { NotFoundError, BadRequestError } = require("../errors");
const Product = require("../model/Product");

// Lấy tất cả sản phẩm với phân trang, tìm kiếm và lọc
const getProducts = async (req, res) => {
    try {
        const queryObject = {};
        const { name, category, quality, sort, page, limit } = req.query;

        if (name) {
            queryObject.name = { $regex: name, $options: "i" };
        }
        if (category) {
            queryObject.category = category;
        }
        if (quality) {
            queryObject.quality = quality;
        }

        let result = Product.find(queryObject);

        // Sort
        if (sort) {
            const sortList = sort.split(",").join(" ");
            result = result.sort(sortList);
        } else {
            result = result.sort("-createdAt");
        }

        // Pagination
        // const pageNumber = Number(page) || 1;
        // const limitNumber = Number(limit) || 10;
        // const skip = (pageNumber - 1) * limitNumber;
        // result = result.skip(skip).limit(limitNumber);

        const products = await result;
        const total = await Product.countDocuments(queryObject);

        res.status(200).json({ products, total });
    } catch (error) {
        console.log(error);
        throw new BadRequestError("Error fetching products");
    }
};

// Lấy một sản phẩm cụ thể
const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        throw new NotFoundError(`No product with id ${productId}`);
    }
    res.status(200).json({ product });
};

// Tạo một sản phẩm mới
const createProduct = async (req, res) => {
    const { sizes } = req.body;
    if (!sizes || !Array.isArray(sizes)) {
        throw new BadRequestError('Sizes must be provided as an array');
    }

    const product = await Product.create(req.body);
    res.status(201).json({ product });
};

// Xóa một sản phẩm
const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
        throw new NotFoundError(`No product with id ${productId}`);
    }
    res.status(200).json({ msg: "Product deleted successfully" });
};

// Cập nhật một sản phẩm
const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    // const { sizes } = req.body;
    
    // if (sizes && !Array.isArray(sizes)) {
    //     throw new BadRequestError('Sizes must be provided as an array');
    // }

    const product = await Product.findByIdAndUpdate(
        productId,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    if (!product) {
        throw new NotFoundError(`No product with id ${productId}`);
    }

    res.status(200).json({ product });
};

const updateProductSizes = async (req, res) => {
    const { productId, sizes } = req.body; // sizes = [{ size: "40", quantity: 2 }, ...]
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        sizes.forEach(({ size, quantity }) => {
            const sizeData = product.sizes.find((s) => s.size === size);
            if (sizeData) {
                sizeData.quantity -= quantity;
            }
        });

        await product.save();
        res.status(200).json({ message: "Product sizes updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error updating product sizes", error });
    }
};


module.exports = {
    getProducts,
    getSingleProduct,
    createProduct,
    deleteProduct,
    updateProduct,
    updateProductSizes
};
