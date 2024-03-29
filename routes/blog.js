const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const User = require("../models/user");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", async (req, res) => {
  const name = await User.findById(req.user._id);
  return res.render("addBlog", {
    user: req.user,
    fullName: name.fullName,
  });
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    );
    const user = await User.findById(req.params.id);
    const name = await User.findById(req.user._id);
    // console.log(comments);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    return res.render("blog", {
      user: req.user,
      fullName: name.fullName,
      blog,
      comments,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.post("/comment/:blogId", async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  try {
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`); // Ensure backticks for correct interpolation
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
