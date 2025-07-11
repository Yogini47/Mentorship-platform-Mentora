import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protected Routes
router.post("/send", verifyJWT, upload.single("file"), sendMessage);
router.get("/:userId1/:userId2", verifyJWT, getMessages);

export default router;
