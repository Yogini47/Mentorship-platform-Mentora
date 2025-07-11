import express from "express";
import {
    createSession,
    getSessionById,
    updateSessionStatus,
    addSessionFeedback
} from "../controllers/session.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, createSession);          // Create a new session
router.get("/:id", verifyJWT, getSessionById);             // Get session details
router.put("/:id/status", verifyJWT, updateSessionStatus); // Update session status
router.put("/:id/feedback", verifyJWT, addSessionFeedback); // Add feedback

export default router;
