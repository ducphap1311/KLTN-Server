const express = require("express");
const Blog = require("../model/Blog");

const router = express.Router();

// 1. Lấy danh sách bài viết (có phân trang, tìm kiếm, và lọc)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category } = req.query;
    const filter = {};

    // Lọc theo danh mục (nếu có)
    if (category) {
      filter.category = category;
    }

    // Tìm kiếm theo tiêu đề hoặc nội dung
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await Blog.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalBlogs = await Blog.countDocuments(filter);

    res.status(200).json({
      data: blogs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalBlogs / limit),
      totalBlogs,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs", error: err.message });
  }
});

// 2. Lấy chi tiết một bài viết
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog", error: err.message });
  }
});

// 3. Tạo bài viết mới
router.post("/", async (req, res) => {
  try {
    const { title, content, author, category, tags, image } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: "Title, content, and author are required" });
    }

    const newBlog = new Blog({ title, content, author, category, tags, image });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    res.status(500).json({ message: "Error creating blog", error: err.message });
  }
});

// 4. Cập nhật bài viết
router.put("/:id", async (req, res) => {
  try {
    const { title, content, author, category, tags, image } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, author, category, tags, image },
      { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json(updatedBlog);
  } catch (err) {
    res.status(500).json({ message: "Error updating blog", error: err.message });
  }
});

// 5. Xóa bài viết
router.delete("/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting blog", error: err.message });
  }
});


module.exports = router;
