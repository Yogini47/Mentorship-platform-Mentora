// Mentor Schema
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const MentorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
  },
  profile_pic: {
    type: String,
    required: true,
  },
  job_profile: {
    type: String,
  },

  experience: {
    type: Number,
    // required: true
  },

  linkedinURL: {
    type: String,
  },

  role: {
    type: String,
    default: "mentor",
  },

  refreshToken: {
    type: String,
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Other"],
  },
  specialization: [String], // Array of skills
  pricing: {
    type: Number,
    // required: true
  }, // Hourly rate
  availability: [
    {
      day: String,
      timeSlots: [String],
    },
  ], // Available days & times
  mentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentee",
    },
  ],
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
  ],
  earnings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Earnings",
  },
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },

  // New: Designation (Job Title)
  designation: {
    type: String,
    trim: true,
  },

  // New: Contact (Phone or Alternate Email)
  contact: {
    type: String,
    trim: true,
  },

  location: {
    type: String,
    required: true,
  },

  // mentor review
  reviews: [
    {
      mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentee",
      },
      menteeName: {
        type: String,
      },
      menteeProfilePic: {
        // ✅ Add this line
        type: String,
        default: "/default-profile.png",
      },
      comment: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  averageRating: {
    type: Number,
    default: 0,
  },

  // connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentee" }],
  connectionRequests: [
    {
      mentee: { type: mongoose.Schema.Types.ObjectId, ref: "Mentee" },
      name: String,
      email: String,
      profile_pic: String
    }
  ],
  connectedMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentee" }],
});
MentorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
MentorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const Mentor = mongoose.model("Mentor", MentorSchema);
