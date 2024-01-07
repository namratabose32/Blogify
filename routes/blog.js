const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/blog');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.get('/add-new', (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});

router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        return res.render("blog", {
            user: req.user,
            blog,
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return res.status(500).send('Internal Server Error');
    }
});

router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, body } = req.body;
    try {
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL: `/uploads/${req.file.filename}`
        });
        return res.redirect(`/blog/${blog._id}`); // Ensure backticks for correct interpolation
    } catch (error) {
        console.error('Error creating blog:', error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
