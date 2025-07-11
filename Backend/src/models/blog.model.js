import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  cover_image: {
    type: String  // URL for the blog's cover image
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentee" // Track mentees who liked the blog
  }],
  comments: [
    {
      mentee: { type: mongoose.Schema.Types.ObjectId, ref: "Mentee" },
      comment: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export const Blog = mongoose.model("Blog", blogSchema);
