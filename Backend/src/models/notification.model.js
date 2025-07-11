import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
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
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "session", "system","alert"], // Different notification types
      required: true,
    },
    link: {
      type: String, // URL for redirection (e.g., chat or session page)
      default: null,
      validate: {
        validator: function(v) {
          return v === null || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
        },
        message: props => `${props.value} is not a valid URL!`
      }
    },
    seen: {
      type: Boolean,
      default: false, // Unread status
      index: true
    },
  },
  { timestamps: true }
);
// Index for frequently used queries
NotificationSchema.index({ user: 1, seen: 1, createdAt: -1 });
export const Notification = mongoose.model("Notification", NotificationSchema);
