// Mentee Schema
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const MenteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  goals: {
    type: String
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor"
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session"
    }],
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    }],
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
  //   location: {
  //     // country: { type: String, trim: true },
  //     state: { type: String, trim: true },
  //     city: { type: String, trim: true }
  //   },
  location:{
    type:String,
    required: true},

  refreshToken: {
    type: String
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"]
  },
  profile_pic: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  education: {
    college_name: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    course_name: {
      type: String,
      required: true
    }


  },

  role: {
    type: String,
    default: "mentee",
  },

  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentor" }],
  acceptedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentor" }]
});


MenteeSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    role: this.role
  },
    process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
  )
}
MenteeSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email,
  },
    process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
  )
}
export const Mentee = mongoose.model("Mentee", MenteeSchema);