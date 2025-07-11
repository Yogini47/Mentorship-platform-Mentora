
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

export const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [typingStatus, setTypingStatus] = useState({});
  const token = localStorage.getItem('token');
  const typingTimers = {}; // Keeps separate timers for each chat

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:8000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected!');
      setIsSocketConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.warn('⚡ Socket disconnected');
      setIsSocketConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    newSocket.on('receiveMessage', (newMessage) => {
      setMessages((prev) => {
        const prevMsgs = prev[newMessage.chatId] || [];
        const updated = prevMsgs.map((msg) =>
          msg.isTemp && msg.content === newMessage.content && msg.sender === newMessage.sender
            ? newMessage
            : msg
        );

        const isReplaced = updated.some((msg) => msg._id === newMessage._id);
        return {
          ...prev,
          [newMessage.chatId]: isReplaced ? updated : [...prevMsgs, newMessage],
        };
      });
    });

    newSocket.on('readReceipt', ({ chatId, readerId }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        if (updated[chatId]) {
          updated[chatId] = updated[chatId].map((msg) =>
            msg.receiver === readerId ? { ...msg, isRead: true } : msg
          );
        }
        return updated;
      });
    });

    newSocket.on('typing', ({ chatId, senderId }) => {
      console.log('📝 Typing event received:', { chatId, senderId });
      setTypingStatus((prev) => ({
        ...prev,
        [chatId]: senderId,
      }));
 // Clear old timer for this chat
 if (typingTimers[chatId]) clearTimeout(typingTimers[chatId]);
      // Clear after 3 seconds
     typingTimers[chatId] = setTimeout(() => {
        setTypingStatus((prev) => {
          const updated = { ...prev };
         // if (updated[chatId] === senderId) {
            delete updated[chatId];
         // }
          return updated;
        });
      }, 3000);
    });

    newSocket.on('stopTyping', ({ chatId }) => {
      setTypingStatus((prev) => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });
    });

    newSocket.on('newMessageNotification', ({ sender, chatId, message }) => {
      console.log(`🔔 Notification: Message from ${sender} in chat ${chatId}`);
    });

    return () => newSocket.disconnect();
  }, [token]);

  const fetchConnectedMentees = async (mentorId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/v2/users/mentors/${mentorId}/connected-mentees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data.data);
    } catch (err) {
      console.error('❌ Failed to fetch connected mentees:', err.message);
    }
  };

  const joinChat = async (chatId) => {
    if (!socket || !isSocketConnected) return;
    setActiveChat(chatId);
    socket.emit('joinChat', { chatId });

    await loadMessagesForChat(chatId);

    const userId =
      localStorage.getItem('userId') ||
      localStorage.getItem('menteeId') ||
      localStorage.getItem('mentorId');

    socket.emit('markAsRead', { chatId, userId });
  };

  const sendMessage = (chatId, content, fileUrl = null, fileType = null) => {
    if (!socket || !isSocketConnected) return;

    const senderId =
      localStorage.getItem('userId') ||
      localStorage.getItem('menteeId') ||
      localStorage.getItem('mentorId');

    const tempId = `temp_${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      chatId,
      content: content.trim(),
      sender: senderId,
      createdAt: new Date().toISOString(),
      fileUrl,
      fileType,
      isTemp: true,
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), tempMessage],
    }));

    socket.emit('sendMessage', { chatId, content, fileUrl, fileType });
  };

  const sendTyping = (chatId) => {
    if (socket && isSocketConnected) {
      const senderId =
        localStorage.getItem('userId') ||
        localStorage.getItem('menteeId') ||
        localStorage.getItem('mentorId');
      socket.emit('typing', { chatId, senderId });
    }
  };

  const stopTyping = (chatId) => {
    if (socket && isSocketConnected) {
      socket.emit('stopTyping', { chatId });
    }
  };

  const getMessages = (chatId) => messages[chatId] || [];

  const loadMessagesForChat = async (chatId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v2/users/chat/${chatId}/getMessages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const oldMessages = res.data.data;
      setMessages((prev) => ({
        ...prev,
        [chatId]: oldMessages,
      }));
    } catch (err) {
      console.error('❌ Failed to load messages:', err.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeChat,
        setActiveChat,
        joinChat,
        sendMessage,
        sendTyping,
        stopTyping,
        getMessages,
        loadMessagesForChat,
        fetchConnectedMentees,
        isSocketConnected,
        chats,
        typingStatus,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};



// import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import axios from "axios";

// export const ChatContext = createContext();
// export const useChat = () => useContext(ChatContext);

// export const ChatProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isSocketConnected, setIsSocketConnected] = useState(false);
//   const [chats, setChats] = useState([]);
//   const [messages, setMessages] = useState({});
//   const [activeChat, setActiveChat] = useState(null);

//   const token = localStorage.getItem("token"); // ✅ Fetch latest token

//   useEffect(() => {
//     if (!token) {
//       console.warn("No token found yet. Waiting for login...");
//       return;
//     }

//     const newSocket = io("http://localhost:8000", {
//       auth: { token },
//       transports: ["websocket", "polling"],
//       withCredentials: true,
//     });

//     setSocket(newSocket);

//     newSocket.on("connect", () => {
//       console.log("✅ Socket connected!");
//       setIsSocketConnected(true);
//     });

//     newSocket.on("disconnect", () => {
//       console.warn("⚡ Socket disconnected");
//       setIsSocketConnected(false);
//     });

//     newSocket.on("connect_error", (err) => {
//       console.error("❌ Socket error:", err.message);
//     });

//     newSocket.on("receiveMessage", (newMessage) => {
//       setMessages((prev) => {
//         const prevMsgs = prev[newMessage.chatId] || [];

//         // ✅ Replace temp message if exists
//         const updated = prevMsgs.map((msg) =>
//           msg.isTemp &&
//           msg.content === newMessage.content &&
//           msg.sender === newMessage.sender
//             ? newMessage
//             : msg
//         );

//         // ✅ If not replaced, append it
//         const isReplaced = updated.some((msg) => msg._id === newMessage._id);
//         return {
//           ...prev,
//           [newMessage.chatId]: isReplaced ? updated : [...prevMsgs, newMessage],
//         };
//       });
//     });

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [token]); // ✅ Very Important: Depend on token!!

//   const fetchConnectedMentees = async (mentorId) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:8000/api/v2/users/mentors/${mentorId}/connected-mentees`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setChats(res.data.data);
//     } catch (err) {
//       console.error("❌ Failed to fetch connected mentees:", err.message);
//     }
//   };

//   const joinChat = async (chatId) => {
//     if (!socket || !isSocketConnected) {
//       console.error("Cannot join chat: socket not connected");
//       return;
//     }
//     setActiveChat(chatId);
//     socket.emit("joinChat", { chatId });

//     await loadMessagesForChat(chatId);
//     // ✅ Fetch old messages after joining

//     console.log("✅ Old messages loaded for chat:", chatId);
//   };

//   const sendMessage = (chatId, content, fileUrl = null, fileType = null) => {
//     if (!socket || !isSocketConnected) {
//       console.error("Cannot send message: socket not connected");
//       return;
//     }
//     const tempId = `temp_${Date.now()}`;
//     const tempMessage = {
//       _id: tempId,
//       chatId,
//       content: content.trim(),
//       sender: localStorage.getItem("userId"),
//       createdAt: new Date().toISOString(),
//       isTemp: true,
//     };

//     setMessages((prev) => ({
//       ...prev,
//       [chatId]: [...(prev[chatId] || []), tempMessage],
//     }));
//     console.log("Sending message with:", { chatId, content, fileUrl, fileType });
//     socket.emit("sendMessage", { chatId, content, fileUrl, fileType });
//   };

//   const getMessages = (chatId) => messages[chatId] || [];

//   const loadMessagesForChat = async (chatId) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:8000/api/v2/users/chat/${chatId}/getMessages`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       const oldMessages = res.data.data;
//       console.log("📩 Messages loaded:", oldMessages);
//       setMessages((prev) => ({
//         ...prev,
//         [chatId]: oldMessages,
//       }));
//     } catch (err) {
//       console.error("❌ Failed to load messages:", err.message);
//     }
//   };

//   return (
//     <ChatContext.Provider
//       value={{
//         activeChat,
//         setActiveChat,
//         joinChat,
//         sendMessage,
//         getMessages,
//         loadMessagesForChat,
//         fetchConnectedMentees,
//         isSocketConnected,
//         chats,
//         messages,
//         setMessages,
//       }}
//     >
//       {children}
//     </ChatContext.Provider>
//   );
// };
