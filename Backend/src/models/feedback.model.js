import mongoose from "mongoose";
const feedbackSchema = new mongoose.Schema({
  given_by_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentee"
  },
  given_to_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor"
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true })
export const Feedback = mongoose.model("Feedback", feedbackSchema)