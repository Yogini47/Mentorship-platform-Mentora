import express from "express";
import {
  getAllMentees,
  getMenteeById,
  deleteMenteeAccount,
  sendConnectionRequest,
  getConnectedMentors
} from "../controllers/mentee.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Ensure authentication

const router = express.Router();

// Public Routes
router.get("/", getAllMentees);

// Protected Routes
router.get("/:id", verifyJWT, getMenteeById);
router.delete("/:id", verifyJWT, deleteMenteeAccount);
router.post("/connect", verifyJWT, sendConnectionRequest);
router.get("/:menteeId/connected-mentors", verifyJWT, getConnectedMentors);

export default router;

