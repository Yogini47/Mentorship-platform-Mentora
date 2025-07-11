import express from "express";
import { 
    createBlog, 
    getAllBlogs, 
    likeBlog, 
    addComment,
    getBlogsByMentor
} from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Blog Routes
router.post("/create", verifyJWT, createBlog);       // Create a new blog (Mentor only)
router.get("/", getAllBlogs);                        // Get all blogs
router.put("/like", verifyJWT, likeBlog);        // Like a blog
router.post("/comment", verifyJWT, addComment);  // Add comment to a blog
router.get("/mentor/:mentorId", getBlogsByMentor); // Get all blogs by a specific mentor


export default router;