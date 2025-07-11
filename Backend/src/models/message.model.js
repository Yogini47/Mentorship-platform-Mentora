import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel'
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['Mentor', 'Mentee']
    },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel'
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['Mentor', 'Mentee']
    },
    content: {
      type: String,
      required: true
    },
   fileUrl: { type: String, default: null },
   fileType: { type: String, default: null },
   fileName: { type: String, default: null },
    // timestamp: {
    //   type: Date,
    //   default: Date.now
    // },
    isRead: {
      type: Boolean,
      default: false
    },

  },
  {
    timestamps: true
  }
);

export const Message = mongoose.model("Message", messageSchema);
