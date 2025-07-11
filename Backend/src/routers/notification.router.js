import express from "express";
import {
  createNotification,
  getNotifications,
  markNotificationsAsRead
} from "../controllers/notification.controller.js";

const router = express.Router();

// Route to create a new notification
router.post("/", createNotification);

// Route to get notifications for a user (mentor or mentee)
router.get("/:userId/:role", getNotifications);

// Route to mark notifications as read
router.put("/:userId/:role/read", markNotificationsAsRead);

export default router;
