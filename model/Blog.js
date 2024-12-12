const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, default: "General" }, // Danh mục
  tags: { type: [String], default: [] },          // Tags
  image: { type: String, default: "" },           // Ảnh
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Blog", BlogSchema);
