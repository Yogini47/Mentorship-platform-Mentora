import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { mentorId, menteeId } = req.body;

    let chat = await Chat.findOne({
      participants: { $all: [mentorId, menteeId] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [mentorId, menteeId] });
    }

    res.status(200).json(new ApiResponse(200, chat, "Chat created successfully"));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).populate("sender", "name profilePic");
    if (!messages) {
      return res.status(404).json({ success: false, message: "No messages found" });
    }

    res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessageWithFile = async (req, res) => {
  try {
    const { chatId, senderId, content } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const message = await Message.create({
      sender: senderId,
      chatId,
      content: content || "",
      fileUrl,
      fileType: req.file ? req.file.mimetype : null,
    });

    res.status(200).json(new ApiResponse(200, message, "Message sent successfully"));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
