const { NotFoundError } = require("../errors");
const Product = require("../model/Product");

const getProducts = async (req, res) => {
    try {
        const queryObject = {};
        const { name, category, quality, sort } = req.query;

        if (name) {
            queryObject.name = { $regex: name, $options: "i" };
        }
        if (category) {
            queryObject.category = category;
        }
        if (quality) {
            queryObject.quality = quality;
        }
        let products = Product.find(queryObject);
        if (sort) {
            const sortList = sort.split(",").join(" ");
            products = products.sort(sortList);
        }

        products = await products;
        res.status(200).json({ products, nbits: products.length });
    } catch (error) {
        console.log(error);
    }
};

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
        throw new NotFoundError(`No product with id ${productId}`);
    }
    res.status(200).json({ product });
};

const createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
};

const deleteProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findOneAndDelete({ _id: productId });
    if (!product) {
        throw new NotFoundError(`No product with id ${productId}`);
    }
    res.status(201).json({ product });
};

const updateProduct = async (req, res) => {
    const { id: productId } = req.params;
    const product = await Product.findByIdAndUpdate(
        { _id: productId },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );
    if (!product) {
        throw new NotFoundError(`No product with id ${productId}`);
    }
    res.status(201).json({ product });
};

module.exports = {
    getSingleProduct,
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct,
};
