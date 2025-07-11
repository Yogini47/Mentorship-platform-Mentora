import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";

export const messageSocketHandler = (io) => {
  io.use(async (socket, next) => {
    try {
      const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("Authentication error");

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;

      // Important fix
      const role = socket.user.role || decoded.role;  // Take from JWT or decoded
      if (!role) {
        throw new Error("User role missing");
      }
      const modelName = socket.user.role === "mentor" ? "Mentor" : "Mentee";
      const user = await mongoose.model(modelName).findById(socket.user._id);

      if (!user) throw new Error("User not found");

      next();
    } catch (error) {
      next(new Error(error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`💬 Socket connected: ${socket.user._id}`);

    // ✅ Join personal room
    socket.join(socket.user._id);

    // Join a chat
    socket.on("joinChat", async ({ chatId }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        socket.emit("error", { type: "joinChat", message: "Chat not found" });
        return;
      }
      socket.join(chatId);
      console.log(`User ${socket.user._id} joined chat ${chatId}`);
    });
    // message.socket.js or inside message handler
    socket.on("markAsRead", async ({ chatId, userId }) => {
      await Message.updateMany({ chatId, isRead: false, receiver: userId }, { isRead: true });
      io.to(chatId).emit("readReceipt", { chatId, readerId: userId });
    });
    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("typing", { chatId, senderId:socket.user._id });
    });
    socket.on("stopTyping", ({ chatId }) => {
      socket.to(chatId).emit("stopTyping", { chatId });
    });

    socket.on("sendMessage", async (data) => {
      try {
        let { chatId, content, fileUrl, fileType,fileName } = data;

        if (!chatId || (!content?.trim() && !fileUrl)) {
          throw new Error("Invalid message");
        }

        // Fetch the chat to determine receiver
        const chat = await Chat.findById(chatId);
        if (!chat) throw new Error("Chat not found");


        const senderId = socket.user._id;
        const receiverId = chat.participants.find(id => id.toString() !== senderId.toString());

        const senderModel = capitalize(socket.user.role); // "Mentor" or "Mentee"
        const receiverModel = senderModel === "Mentor" ? "Mentee" : "Mentor";

        const newMessage = await Message.create({
          sender: senderId,
          senderModel,
          receiver: receiverId,
          receiverModel,
          chatId,
          content: content?.trim(),
          fileUrl:fileUrl||null,
          fileType:fileType||null,
          fileName:fileName||null,
        });

        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: newMessage._id },
          lastMessage: newMessage._id,
          updatedAt: new Date()
        });

        io.to(chatId).emit("receiveMessage", newMessage);

      } catch (error) {
        console.error("Send message error:", error.message);
        socket.emit("error", { type: "sendMessage", message: error.message });
      }
    });

    function capitalize(str) {
      return str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }


    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user._id}`);
    });
  });
};


// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
// import { Chat } from "../models/chat.model.js";
// import { Message } from "../models/message.model.js";
// import { Notification } from "../models/notification.model.js";

// export const messageSocketHandler = (io) => {
//   io.use(async (socket, next) => {
//     try {
//       const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

//       const token = socket.handshake.auth?.token;
//       if (!token) throw new Error("Authentication error");

//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       socket.user = decoded;

//       // Important fix
//       const role = socket.user.role || decoded.role;  // Take from JWT or decoded
//       if (!role) {
//         throw new Error("User role missing");
//       }
//       const modelName = socket.user.role === "mentor" ? "Mentor" : "Mentee";
//       const user = await mongoose.model(modelName).findById(socket.user._id);

//       if (!user) throw new Error("User not found");

//       next();
//     } catch (error) {
//       next(new Error(error.message));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log(`💬 Socket connected: ${socket.user._id}`);

//     // ✅ Join personal room
//     socket.join(socket.user._id);

//     // Join a chat
//     socket.on("joinChat", async ({ chatId }) => {
//       const chat = await Chat.findById(chatId);
//       if (!chat) {
//         socket.emit("error", { type: "joinChat", message: "Chat not found" });
//         return;
//       }
//       socket.join(chatId);
//       console.log(`User ${socket.user._id} joined chat ${chatId}`);
//     });

//     socket.on("sendMessage", async (data) => {
//       try {
//         let { chatId, content, fileUrl, fileType } = data;

//         if (!chatId || (!content?.trim() && !fileUrl)) {
//           throw new Error("Invalid message");
//         }

//         // Fetch the chat to determine receiver
//         const chat = await Chat.findById(chatId);
//         if (!chat) throw new Error("Chat not found");
        

//         const senderId = socket.user._id;
//         const receiverId = chat.participants.find(id => id.toString() !== senderId.toString());

//         const senderModel = capitalize(socket.user.role); // "Mentor" or "Mentee"
//         const receiverModel = senderModel === "Mentor" ? "Mentee" : "Mentor";

//         const newMessage = await Message.create({
//           sender: senderId,
//           senderModel,
//           receiver: receiverId,
//           receiverModel,
//           chatId,
//           content: content?.trim(),
//           fileUrl,
//           fileType,
//         });

//         await Chat.findByIdAndUpdate(chatId, {
//           $push: { messages: newMessage._id },
//           lastMessage: newMessage._id,
//           updatedAt: new Date()
//         });

//         io.to(chatId).emit("receiveMessage", newMessage);

//       } catch (error) {
//         console.error("Send message error:", error.message);
//         socket.emit("error", { type: "sendMessage", message: error.message });
//       }
//     });

//     function capitalize(str) {
//       return str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//     }


//     socket.on("disconnect", () => {
//       console.log(`Socket disconnected: ${socket.user._id}`);
//     });
//   });
// };

