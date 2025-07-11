import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Paperclip } from "lucide-react";
import axios from "axios";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";
import moment from "moment";

const MenteeChat = () => {
  const {
    activeChat,
    setActiveChat,
    joinChat,
    sendMessage,
    getMessages,
    messages,
    setMessages,
    typingStatus,
    sendTyping,
    stopTyping,
  } = useChat();

  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const menteeId = localStorage.getItem("menteeId");
  const token = localStorage.getItem("token");
  const currentUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("menteeId") ||
    localStorage.getItem("mentorId");
  //const typingTimeout = useRef(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v2/users/mentees/${menteeId}/connected-mentors`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) setMentors(res.data.data);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };
    fetchMentors();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMentorSelect = async (mentor) => {
    setSelectedMentor(mentor);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v2/users/chat/create",
        {
          mentorId: mentor._id,
          menteeId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const chatId = res.data.data._id;
      setActiveChat(chatId);
      joinChat(chatId);

      const messagesRes = await axios.get(
        `http://localhost:8000/api/v2/users/chat/${chatId}/getMessages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (messagesRes.data.success) {
        setMessages((prev) => ({
          ...prev,
          [chatId]: messagesRes.data.data,
        }));
      }
    } catch (error) {
      console.error("Error creating or joining chat:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!activeChat || (!newMessage.trim() && !selectedFile)) return;

    try {
      let fileUrl = null;
      let fileType = null;
      let fileName=null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await axios.post(
          "http://localhost:8000/api/v2/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fileUrl = uploadRes.data.url;
        fileName = selectedFile.name;
        fileType = selectedFile.type;
      }

      sendMessage(activeChat, newMessage, fileUrl, fileType,fileName);
      setNewMessage("");
      setSelectedFile(null);
      fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const groupMessagesByDate = (messages = []) => {
    const groups = {};

    messages.forEach((msg) => {
      const date = moment(msg.createdAt).startOf("day");
      if (!date.isValid()) return;

      let label;
      const today = moment().startOf("day");
      const yesterday = moment().subtract(1, "day").startOf("day");

      if (date.isSame(today)) label = "Today";
      else if (date.isSame(yesterday)) label = "Yesterday";
      else label = date.format("DD MMM YYYY");

      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });

    // Sort each group internally
    Object.keys(groups).forEach((label) => {
      groups[label].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    return groups;
  };
  // const groupedMessages = groupMessagesByDate(
  //   (getMessages(activeChat) || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  // );
  const groupedMessages = groupMessagesByDate(getMessages(activeChat) || []);

  // Sort group labels in chronological order
  const sortedGroupedMessages = Object.entries(groupedMessages).sort(
    ([a], [b]) => {
      const parseLabel = (label) => {
        if (label === "Today") return moment().startOf("day");
        if (label === "Yesterday")
          return moment().subtract(1, "day").startOf("day");
        return moment(label, "DD MMM YYYY");
      };
      return parseLabel(a).diff(parseLabel(b));
    }
  );

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket && activeChat) {
      socket.emit("typing", {
        chatId: activeChat,
        userId: localStorage.getItem("userId"),
      });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-[#1E3A8A] text-white border border-black p-4">
        <h2 className="text-xl font-bold mb-4">Your Mentors</h2>
        <div className="space-y-2 overflow-y-auto">
          {mentors.map((mentor) => (
            <div
              key={mentor._id}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedMentor?._id === mentor._id
                  ? "bg-[#2446A3]"
                  : "hover:bg-[#2548A8]"
              }`}
              onClick={() => handleMentorSelect(mentor)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={mentor.profile_pic || "/default-avatar.png"}
                  alt={mentor.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{mentor.fullName}</div>
                  <div className="text-sm text-gray-300">{mentor.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedMentor ? (
          <>
            {/* Header */}
            <div className="bg-[#1E3A8A] p-4 border-t border-b border-r flex items-center">
              <button
                onClick={() => {
                  setSelectedMentor(null);
                  setActiveChat(null);
                }}
                className="mr-2"
              >
                <ChevronLeft color="white" />
              </button>
              <img
                src={selectedMentor.profile_pic}
                alt={selectedMentor.fullName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-semibold text-white">
                  {selectedMentor.fullName}
                </div>
                <div className="text-sm text-gray-300">
                  {selectedMentor.email}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {sortedGroupedMessages.map(([date, msgs]) => (
                <div key={date}>
                  <div className="text-center text-gray-500 my-2 text-sm">
                    {date}
                  </div>
                  {msgs.map((msg) => (
                    <MessageBubble key={msg._id} message={msg} />
                  ))}
                </div>
              ))}
              {typingStatus[activeChat] &&
                typingStatus[activeChat] !== currentUserId && (
                  <div className="text-sm italic text-gray-500 mb-2">
                    Typing...
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}

<form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
  <div className="flex gap-2 items-center">
    <input
      type="file"
      ref={fileInputRef}
      onChange={(e) => setSelectedFile(e.target.files[0])}
      className="hidden"
    />
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      className="p-2 rounded"
    >
      <Paperclip className="w-5 h-5 text-gray-700 hover:text-gray-900" />
    </button>

    <input
      type="text"
      value={newMessage}
      onChange={(e) => {
        setNewMessage(e.target.value);
        sendTyping(activeChat);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => stopTyping(activeChat), 3000);
      }}
      placeholder="Type your message..."
      className="flex-1 border rounded px-4 py-2"
    />
    <button
      type="submit"
      className="bg-[#1E3A8A] text-white px-6 py-2 rounded hover:bg-blue-600"
    >
      Send
    </button>
  </div>

  {selectedFile && (
    <div className="text-sm text-gray-600 mt-1">
      Selected: {selectedFile.name}
    </div>
  )}
</form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a mentor to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeChat;














// import React, { useState, useEffect, useRef } from "react";
// import { ChevronLeft, Paperclip } from "lucide-react";
// import axios from "axios";
// import { useChat } from "../context/ChatContext";
// import MessageBubble from "./MessageBubble";
// import moment from "moment";

// const MenteeChat = () => {
//   const {
//     activeChat,
//     setActiveChat,
//     joinChat,
//     sendMessage,
//     getMessages,
//     messages,
//     setMessages,
//   } = useChat();

//   const [mentors, setMentors] = useState([]);
//   const [selectedMentor, setSelectedMentor] = useState(null);
//   const [newMessage, setNewMessage] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   const menteeId = localStorage.getItem("menteeId");
//   const token = localStorage.getItem("token");

//   useEffect(() => {
//     const fetchMentors = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:8000/api/v2/users/mentees/${menteeId}/connected-mentors`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         if (res.data.success) setMentors(res.data.data);
//       } catch (error) {
//         console.error("Error fetching mentors:", error);
//       }
//     };
//     fetchMentors();
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleMentorSelect = async (mentor) => {
//     setSelectedMentor(mentor);
//     try {
//       const res = await axios.post(
//         "http://localhost:8000/api/v2/users/chat/create",
//         {
//           mentorId: mentor._id,
//           menteeId,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const chatId = res.data.data._id;
//       setActiveChat(chatId);
//       joinChat(chatId);

//       const messagesRes = await axios.get(
//         `http://localhost:8000/api/v2/users/chat/${chatId}/getMessages`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (messagesRes.data.success) {
//         setMessages((prev) => ({
//           ...prev,
//           [chatId]: messagesRes.data.data,
//         }));
//       }
//     } catch (error) {
//       console.error("Error creating or joining chat:", error);
//     }
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!activeChat || (!newMessage.trim() && !selectedFile)) return;

//     try {
//       let fileUrl = null;
//       let fileType = null;

//       if (selectedFile) {
//         const formData = new FormData();
//         formData.append("file", selectedFile);
//         const uploadRes = await axios.post(
//           "http://localhost:8000/api/v2/upload",
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//         fileUrl = uploadRes.data.url;
//         fileType = selectedFile.type;
//       }

//       sendMessage(activeChat, newMessage, fileUrl, fileType);
//       setNewMessage("");
//       setSelectedFile(null);
//       fileInputRef.current.value = "";
//     } catch (err) {
//       console.error("Error sending message:", err);
//     }
//   };

//   const groupMessagesByDate = (messages = []) => {
//     const groups = {};

//     messages.forEach((msg) => {
//       const date = moment(msg.createdAt).startOf("day");
//       if (!date.isValid()) return;

//       let label;
//       const today = moment().startOf("day");
//       const yesterday = moment().subtract(1, "day").startOf("day");

//       if (date.isSame(today)) label = "Today";
//       else if (date.isSame(yesterday)) label = "Yesterday";
//       else label = date.format("DD MMM YYYY");

//       if (!groups[label]) groups[label] = [];
//       groups[label].push(msg);
//     });

//     // Sort each group internally
//     Object.keys(groups).forEach((label) => {
//       groups[label].sort(
//         (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//       );
//     });

//     return groups;
//   };
//   // const groupedMessages = groupMessagesByDate(
//   //   (getMessages(activeChat) || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
//   // );
//   const groupedMessages = groupMessagesByDate(getMessages(activeChat) || []);

//   // Sort group labels in chronological order
//   const sortedGroupedMessages = Object.entries(groupedMessages).sort(
//     ([a], [b]) => {
//       const parseLabel = (label) => {
//         if (label === "Today") return moment().startOf("day");
//         if (label === "Yesterday")
//           return moment().subtract(1, "day").startOf("day");
//         return moment(label, "DD MMM YYYY");
//       };
//       return parseLabel(a).diff(parseLabel(b));
//     }
//   );

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div className="w-1/5 bg-[#1E3A8A] text-white border border-black p-4">
//         <h2 className="text-xl font-bold mb-4">Your Mentors</h2>
//         <div className="space-y-2 overflow-y-auto">
//           {mentors.map((mentor) => (
//             <div
//               key={mentor._id}
//               className={`p-3 rounded-lg cursor-pointer ${
//                 selectedMentor?._id === mentor._id
//                   ? "bg-[#2446A3]"
//                   : "hover:bg-[#2548A8]"
//               }`}
//               onClick={() => handleMentorSelect(mentor)}
//             >
//               <div className="flex items-center gap-2">
//                 <img
//                   src={mentor.profile_pic || "/default-avatar.png"}
//                   alt={mentor.fullName}
//                   className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div>
//                   <div className="font-semibold">{mentor.fullName}</div>
//                   <div className="text-sm text-gray-300">{mentor.email}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Chat area */}
//       <div className="flex-1 bg-gray-50 flex flex-col">
//         {selectedMentor ? (
//           <>
//             {/* Header */}
//             <div className="bg-[#1E3A8A] p-4 border-t border-b border-r flex items-center">
//               <button
//                 onClick={() => {
//                   setSelectedMentor(null);
//                   setActiveChat(null);
//                 }}
//                 className="mr-2"
//               >
//                 <ChevronLeft color="white" />
//               </button>
//               <img
//                 src={selectedMentor.profile_pic}
//                 alt={selectedMentor.fullName}
//                 className="w-10 h-10 rounded-full mr-3"
//               />
//               <div>
//                 <div className="font-semibold text-white">
//                   {selectedMentor.fullName}
//                 </div>
//                 <div className="text-sm text-gray-300">
//                   {selectedMentor.email}
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//               {sortedGroupedMessages.map(([date, msgs]) => (
//                 <div key={date}>
//                   <div className="text-center text-gray-500 my-2 text-sm">
//                     {date}
//                   </div>
//                   {msgs.map((msg) => (
//                     <MessageBubble key={msg._id} message={msg} />
//                   ))}
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Message input */}
//             <form
//               onSubmit={handleSendMessage}
//               className="p-4 border-t bg-white"
//             >
//               <div className="flex gap-2 items-center">
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={(e) => setSelectedFile(e.target.files[0])}
//                   className="hidden"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => fileInputRef.current?.click()}
//                   className="px-3 py-2 rounded cursor-pointer flex items-center justify-center"
//                 >
//                   <Paperclip className="w-5 h-5" />
//                 </button>

//                 <input
//                   type="text"
//                   value={newMessage}
//                   onChange={(e) => setNewMessage(e.target.value)}
//                   placeholder="Type your message..."
//                   className="flex-1 border rounded px-4 py-2"
//                 />

//                 <button
//                   type="submit"
//                   className="bg-[#1E3A8A] text-white px-6 py-2 rounded hover:bg-[#284FB8]"
//                 >
//                   Send
//                 </button>
//               </div>
//               {selectedFile && (
//                 <div className="text-sm text-gray-600 mt-1">
//                   Selected: {selectedFile.name}
//                 </div>
//               )}
//             </form>
//           </>
//         ) : (
//           <div className="h-full flex items-center justify-center text-gray-500">
//             Select a mentor to start chatting
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MenteeChat;
