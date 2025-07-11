import { Notification } from "../models/notification.model.js";
import { Mentor } from "../models/mentor.model.js";
import { Mentee } from "../models/mentee.model.js";

// Create a Notification (For Both Mentor & Mentee)
export const createNotification = async (req, res) => {
  try {
    const { userId, role, message, type, link } = req.body;

    // Validate Role
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'mentor' or 'mentee'." });
    }

    // Check if user exists
    const user = role === "mentor" ? await Mentor.findById(userId) : await Mentee.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create Notification
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      link,
      seen: false,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Notifications for a User (Mentor or Mentee)
export const getNotifications = async (req, res) => {
  try {
    const { userId, role } = req.params;

    // Validate Role
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'mentor' or 'mentee'." });
    }

    // Check if user exists
    const user = role === "mentor" ? await Mentor.findById(userId) : await Mentee.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch Notifications
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Mark Notifications as Read (For Both Mentor & Mentee)
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { userId, role } = req.params;

    // Validate Role
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'mentor' or 'mentee'." });
    }

    // Check if user exists
    const user = role === "mentor" ? await Mentor.findById(userId) : await Mentee.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Mark Notifications as Read
    await Notification.updateMany({ user: userId, seen: false }, { $set: { seen: true } });

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
