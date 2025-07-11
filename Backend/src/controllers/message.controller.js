import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


// Capitalize helper
function capitalizeFirstLetter(string) {
  return string?.charAt(0).toUpperCase() + string?.slice(1).toLowerCase();
}

// Send a new message with optional file
// export const sendMessage = async (req, res) => {
//   try {
//     let { content, sender, senderModel, receiver, receiverModel, chatId } = req.body;
//     const file = req.file;

//     if (!content && !file) {
//       return res.status(400).json({
//         success: false,
//         message: "Message content or file is required"
//       });
//     }

//     if (!sender || !senderModel || !receiver || !receiverModel || !chatId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields"
//       });
//     }

//     senderModel = capitalizeFirstLetter(senderModel);
//     receiverModel = capitalizeFirstLetter(receiverModel);

//     let fileData = {};
//     if (file) {
//       try {
//         const uploadResult = await uploadOnCloudinary(file.path);
//         if (uploadResult?.url) {
//           fileData = {
//             fileUrl: uploadResult.url,
//             fileName: file.originalname,
//             fileType: file.mimetype
//           };
//         } else {
//           return res.status(500).json({
//             success: false,
//             message: "Cloudinary upload failed"
//           });
//         }
//       } catch (uploadError) {
//         console.error("❌ File upload error:", uploadError);
//         return res.status(500).json({
//           success: false,
//           message: "File upload failed",
//           error: uploadError.message
//         });
//       }
//     }

//     const message = await Message.create({
//       content: content?.trim() || "", // optional if file exists
//       sender,
//       senderModel,
//       receiver,
//       receiverModel,
//       chatId,
//       ...fileData
//     });

//     // Add to Chat
//     await Chat.findByIdAndUpdate(chatId, {
//       $push: { messages: message._id },
//       lastMessage: message._id
//     });

//     await message.populate("sender", "name email profile_pic");

//     res.status(201).json({
//       success: true,
//       data: message
//     });

//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// };

export const sendMessage = async (req, res) => {
  try {
    const { sender, senderModel, chatId, receiver, receiverModel, content } = req.body;
    let fileUrl = null, fileName = null, fileType = null;

    if (req.file) {
      // In a real app, you'd upload this to cloud storage (e.g. Cloudinary, AWS S3)
      // For now, we'll simulate by using a base64 string or saving to disk
      const buffer = req.file.buffer;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileUrl = `data:${fileType};base64,${buffer.toString("base64")}`; // base64-encoded file
    }

    const message = new Message({
      sender,
      senderModel,
      chatId,
      receiver,
      receiverModel,
      content,
      fileUrl,
      fileName,
      fileType,
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




// Fetch all messages in a chat & mark them as read
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { receiverId } = req.query; // Receiver ID from frontend

    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate("sender", "name profile_pic");

    // Mark messages as read for the receiver
    await Message.updateMany({ chatId, sender: { $ne: receiverId }, isRead: false }, { isRead: true });

    res.status(200).json({ success: true, messages });

  } catch (error) {
    console.error("Error Fetching Messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Mark a specific message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({ success: true, message: "Message marked as read", data: message });

  } catch (error) {
    console.error("Error Marking Message as Read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: "Both user IDs are required"
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email profile_pic')
      .populate('receiver', 'name email profile_pic');

    console.log(`Found ${messages.length} messages between users ${userId1} and ${userId2}`);

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message
    });
  }
};




// import { Message } from "../models/message.model.js";
// import { Chat } from "../models/chat.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";

// export const sendMessage = async (req, res) => {
//   try {
//     let { content, sender, senderModel, receiver, receiverModel, chatId } = req.body;
//     const file = req.file;

//     if (!content || !sender || !senderModel || !receiver || !receiverModel || !chatId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields"
//       });
//     }
//     console.log("BODY:", req.body);
// console.log("FILE:", req.file);


//     // ✅ Capitalize model names to match enum ['Mentor', 'Mentee']
//     senderModel = capitalizeFirstLetter(senderModel);
//     receiverModel = capitalizeFirstLetter(receiverModel);

//     let fileData = {};
//     if (file) {
//       try {
//         const uploadResult = await uploadOnCloudinary(file.buffer);
//         if (uploadResult?.url) {
//           fileData = {
//             fileUrl: uploadResult.url,
//             fileName: file.originalname,
//             fileType: file.mimetype
//           };
//         }
//       } catch (uploadError) {
//         console.error("File upload error:", uploadError);
//       }
//     }

//     const message = await Message.create({
//       content: content.trim(),
//       sender,
//       senderModel,
//       receiver,
//       receiverModel,
//       chatId,
//       ...fileData
//     });

//     // ✅ Add message reference to Chat
//     await Chat.findByIdAndUpdate(chatId, {
//       $push: { messages: message._id },
//       lastMessage: message._id
//     });

//     await message.populate('sender', 'name email profile_pic');

//     console.log("✅ Message saved and added to chat:", message);

//     res.status(201).json({
//       success: true,
//       data: message
//     });

//   } catch (error) {
//     console.error("❌ Error sending message:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error sending message",
//       error: error.message
//     });
//   }
// };

// // Capitalize helper
// function capitalizeFirstLetter(string) {
//   return string?.charAt(0).toUpperCase() + string?.slice(1).toLowerCase();
// }

// // Fetch all messages in a chat & mark them as read
// export const getChatMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { receiverId } = req.query; // Receiver ID from frontend

//     if (!chatId) {
//       return res.status(400).json({ error: "Chat ID is required" });
//     }

//     const messages = await Message.find({ chatId })
//       .sort({ createdAt: 1 })
//       .populate("sender", "name profile_pic");

//     // Mark messages as read for the receiver
//     await Message.updateMany({ chatId, sender: { $ne: receiverId }, isRead: false }, { isRead: true });

//     res.status(200).json({ success: true, messages });

//   } catch (error) {
//     console.error("Error Fetching Messages:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Mark a specific message as read
// export const markMessageAsRead = async (req, res) => {
//   try {
//     const { messageId } = req.params;

//     const message = await Message.findById(messageId);
//     if (!message) {
//       return res.status(404).json({ error: "Message not found" });
//     }

//     message.isRead = true;
//     await message.save();

//     res.status(200).json({ success: true, message: "Message marked as read", data: message });

//   } catch (error) {
//     console.error("Error Marking Message as Read:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// export const getMessages = async (req, res) => {
//   try {
//     const { userId1, userId2 } = req.params;

//     if (!userId1 || !userId2) {
//       return res.status(400).json({
//         success: false,
//         message: "Both user IDs are required"
//       });
//     }

//     const messages = await Message.find({
//       $or: [
//         { sender: userId1, receiver: userId2 },
//         { sender: userId2, receiver: userId1 }
//       ]
//     })
//       .sort({ createdAt: 1 })
//       .populate('sender', 'name email profile_pic')
//       .populate('receiver', 'name email profile_pic');

//     console.log(`Found ${messages.length} messages between users ${userId1} and ${userId2}`);

//     res.status(200).json({
//       success: true,
//       data: messages
//     });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching messages",
//       error: error.message
//     });
//   }
// };
