import jwt from "jsonwebtoken";
import { Mentor } from "../models/mentor.model.js";
import { Mentee } from "../models/mentee.model.js";
import { Notification } from "../models/notification.model.js";
import { Chat } from "../models/chat.model.js";

export const notificationSocketHandler = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;

      // Check if user is a Mentor or Mentee
      const mentor = await Mentor.findById(socket.user.id);
      const mentee = await Mentee.findById(socket.user.id);

      socket.user.role = mentor ? "Mentor" : "Mentee"; // Assign role dynamically

      next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`🔔 User connected: ${socket.user.id} (${socket.user.role})`);
    socket.join(socket.user.id);

    // ✅ Handle user online status update (Mentor/Mentee)
    socket.on("userOnline", async () => {
      try {
        if (socket.user.role === "Mentor") {
          await Mentor.findByIdAndUpdate(socket.user.id, { lastSeen: new Date(), isOnline: true });
        } else {
          await Mentee.findByIdAndUpdate(socket.user.id, { lastSeen: new Date(), isOnline: true });
        }
        io.emit("updateOnlineStatus", { userId: socket.user.id, isOnline: true });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    });

    // ✅ Handle user disconnect (Mentor/Mentee)
    socket.on("disconnect", async () => {
      try {
        if (socket.user.role === "Mentor") {
          await Mentor.findByIdAndUpdate(socket.user.id, { lastSeen: new Date(), isOnline: false });
        } else {
          await Mentee.findByIdAndUpdate(socket.user.id, { lastSeen: new Date(), isOnline: false });
        }
        io.emit("updateOnlineStatus", { userId: socket.user.id, isOnline: false });
        console.log(`🔕 User disconnected: ${socket.user.id} (${socket.user.role})`);
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    });

    // ✅ Handle marking notifications as read
    socket.on("markNotificationsRead", async ({ userId }) => {
      try {
        await Notification.updateMany({ user: userId, seen: false }, { $set: { seen: true } });
        io.to(userId).emit("notificationsRead");
      } catch (error) {
        console.error("Error marking notifications as read:", error);
      }
    });

    // ✅ Handle general notifications (session reminders, updates)
    socket.on("sendGeneralNotification", async ({ userId, message, link }) => {
      try {
        const notification = await Notification.create({
          user: userId,
          message,
          type: "system",
          link,
          seen: false,
        });

        io.to(userId).emit("receiveNotification", notification);
      } catch (error) {
        console.error(" Error sending general notification:", error);
      }
    });
  });
};
