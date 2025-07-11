import { Blog } from "../models/blog.model.js";

// Create a new blog post
export const createBlog = async (req, res) => {
    const { owner_id, title, description, text, tags, cover_image } = req.body;

    try {
        const blog = await Blog.create({
            owner_id,
            title,
            description,
            text,
            tags,
            cover_image
        });

        
        
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// Get all blogs with filtering and pagination
export const getAllBlogs = async (req, res) => {
    const { tag } = req.query;
    const filter = tag ? { tags: tag } : {};

    try {
        const blogs = await Blog.find(filter)
        .populate("owner_id", "fullName profile_pic")
        .populate("comments.mentee", "name profile_pic");

        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Like a blog post

// ✅ Corrected likeBlog controller
export const likeBlog = async (req, res) => {
    const { blogId, menteeId } = req.body;

    console.log("🔄 likeBlog called with:", { blogId, menteeId });

    try {
        let blog = await Blog.findById(blogId); // use let instead of const

        if (!blog) {
            return res.status(404).json({ success: false, error: "Blog not found." });
        }

        if (!blog.likes.includes(menteeId)) {
            blog.likes.push(menteeId);
        } else {
            blog.likes = blog.likes.filter(id => id.toString() !== menteeId);
        }

        await blog.save();

        // Repopulate necessary fields before sending back
        blog = await Blog.findById(blogId)
            .populate("owner_id", "fullName profile_pic")
            .populate("comments.mentee", "name profile_pic");

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        console.error("❌ Error in likeBlog:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// Add a comment to a blog post
export const addComment = async (req, res) => {
    const { blogId, menteeId, comment } = req.body;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, error: "Blog not found." });

        blog.comments.push({ mentee: menteeId, comment });
        await blog.save();

        // Re-fetch blog with populated mentee and owner fields
    const updatedBlog = await Blog.findById(blogId)
    .populate("owner_id", "name profile_pic")
    .populate("comments.mentee", "name profile_pic");

        // res.status(200).json({ success: true, data: blog });
        res.status(200).json({ success: true, data: updatedBlog });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all blogs created by a specific mentor
export const getBlogsByMentor = async (req, res) => {
    const { mentorId } = req.params;

    try {
        const blogs = await Blog.find({ owner_id: mentorId })
            .populate("owner_id", "fullName profile_pic")
            .populate("comments.mentee", "name profile_pic");

        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

