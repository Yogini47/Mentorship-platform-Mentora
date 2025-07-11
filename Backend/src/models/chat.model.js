// Chat Schema
import mongoose from "mongoose";
const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentor" }, { type: mongoose.Schema.Types.ObjectId, ref: "Mentee" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  createdAt: { type: Date, default: Date.now },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },
  typing: {
    type: Map,
    of: Boolean,
    default: {}
  },
  updatedAt: { type: Date, default: Date.now }
});
export const Chat = mongoose.model("Chat", ChatSchema);