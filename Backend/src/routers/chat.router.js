import express from "express";
import { createChat, getMessages, sendMessageWithFile } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, createChat);
router.post("/sendMessage", verifyJWT, sendMessageWithFile);
router.get("/:chatId/getMessages", verifyJWT, getMessages)

export default router;

