// Session Schema
import mongoose from "mongoose";
const SessionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentee",
    required: true
  },
  date:
  {
    type: Date,
    required: true
  },
  status:
  {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending"
  },
  notes: {
    type: String
  },
  feedback: {
    rating: Number,
    comment: String
  },
  price: {
    type: Number,
    required: true
  },
});
export const Session = mongoose.model("Session", SessionSchema);