import { useEffect, useState, useRef } from "react";
import { useChat } from "../context/ChatContext";
import axios from "axios";
import moment from "moment";
import MessageBubble from "./MessageBubble";
import { Bell, Paperclip, ChevronLeft } from "lucide-react";

export default function MentorChat() {
  const {
    joinChat,
    sendMessage,
    getMessages,
    activeChat,
    fetchConnectedMentees,
    chats,
    typingStatus,
    sendTyping,
    stopTyping,
  } = useChat();
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const currentUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("menteeId") ||
    localStorage.getItem("mentorId");

  useEffect(() => {
    const mentorId = localStorage.getItem("mentorId");
    if (mentorId) fetchConnectedMentees(mentorId);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getMessages(activeChat)]);

  const handleMenteeSelect = async (mentee) => {
    setSelectedMentee(mentee);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:8000/api/v2/users/chat/create",
        {
          mentorId: localStorage.getItem("mentorId"),
          menteeId: mentee._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      joinChat(data.data._id);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;

    try {
      let fileUrl = null;
      let fileType = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const token = localStorage.getItem("token");

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
        fileType = selectedFile.type;
      }

      sendMessage(activeChat, messageInput, fileUrl, fileType);
      setMessageInput("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const groupMessagesByDate = (messages = []) => {
    const groups = {};

    messages.forEach((msg) => {
      const created = moment(msg.createdAt).startOf("day");
      if (!created.isValid()) return;

      let label;
      const today = moment().startOf("day");
      const yesterday = moment().subtract(1, "day").startOf("day");

      if (created.isSame(today)) label = "Today";
      else if (created.isSame(yesterday)) label = "Yesterday";
      else label = created.format("DD MMM YYYY");

      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });

    Object.keys(groups).forEach((label) => {
      groups[label].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(getMessages(activeChat) || []);

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
  let typingTimeout = useRef(null);

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    if (socket && activeChat) {
      socket.emit("typing", {
        chatId: activeChat,
        userId: localStorage.getItem("userId"),
      });
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <div className="w-1/5 bg-[#1E3A8A] text-white border border-black p-4">
        <h2 className="text-xl font-bold mb-4">Your Mentees</h2>
        <div className="space-y-2 overflow-y-auto">
          {chats.map((mentee) => (
            <div
              key={mentee._id}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedMentee?._id === mentee._id
                  ? "bg-[#2446A3]"
                  : "hover:bg-[#2548A8]"
              }`}
              onClick={() => handleMenteeSelect(mentee)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={mentee.profile_pic || "/default-avatar.png"}
                  alt={mentee.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{mentee.name}</div>
                  <div className="text-sm text-gray-300">{mentee.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-4/5 flex flex-col">
        {selectedMentee ? (
          <>
            {/* Mentee Header
            <div className="flex items-center p-4 bg-[#1E3A8A] text-white">
              <img
                src={selectedMentee.profile_pic || "/default-avatar.png"}
                alt={selectedMentee.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <div className="font-semibold">{selectedMentee.name}</div>
                <div className="text-sm">{selectedMentee.email}</div>
              </div>
            </div> */}

<div className="bg-[#1E3A8A] p-4 border-t border-b border-r flex items-center">
              <button
                onClick={() => {
                  setSelectedMentee(null);
                }}
                className="mr-2"
              >
                <ChevronLeft color="white" />
              </button>
              <img
                src={selectedMentee.profile_pic}
                alt={selectedMentee.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="font-semibold text-white">
                  {selectedMentee.name}
                </div>
                <div className="text-sm text-gray-300">
                  {selectedMentee.email}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex flex-col flex-grow overflow-y-auto p-4 bg-gray-50">
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

            {/* Message Input */}
            <div className="flex items-center p-4 border-t bg-white gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-600 p-2 hover:text-black"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  sendTyping(activeChat);
                  setTimeout(() => stopTyping(activeChat), 2000);
                }}
                placeholder="Type your message..."
                className="flex-1 border px-4 py-2 rounded"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#1E3A8A] text-white px-6 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center flex-grow text-gray-500">
            Select a mentee to start chatting
          </div>
        )}
      </div>
    </div>
  );
}


// import { useEffect, useState, useRef } from "react";
// import { useChat } from "../context/ChatContext";
// import axios from "axios";
// import MessageBubble from "./MessageBubble";
// import moment from "moment";
// import { Paperclip, ChevronLeft } from "lucide-react";

// export default function MentorChat() {
//   const {
//     joinChat,
//     sendMessage,
//     getMessages,
//     activeChat,
//     fetchConnectedMentees,
//     chats,
//     typingStatus,
//     sendTyping,
//     stopTyping
//   } = useChat();
//   const [selectedMentee, setSelectedMentee] = useState(null);
//   const [messageInput, setMessageInput] = useState("");
//   const [selectedFile, setSelectedFile] = useState(null);
//   const fileInputRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const currentUserId = localStorage.getItem("userId") || localStorage.getItem("menteeId") || localStorage.getItem("mentorId");

//   useEffect(() => {
//     const mentorId = localStorage.getItem('mentorId');
//     if (mentorId) fetchConnectedMentees(mentorId);
//   }, []);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [getMessages(activeChat)]);

//   const handleMenteeSelect = async (mentee) => {
//     setSelectedMentee(mentee);
//     try {
//       const token = localStorage.getItem("token");
//       const { data } = await axios.post(
//         "http://localhost:8000/api/v2/users/chat/create",
//         {
//           mentorId: localStorage.getItem("mentorId"),
//           menteeId: mentee._id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           withCredentials: true,
//         }
//       );
//       joinChat(data.data._id);
//     } catch (err) {
//       console.error("Error creating chat:", err);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!messageInput.trim() && !selectedFile) return;

//     let fileUrl = null;
//     let fileType = null;

//     try {
//       if (selectedFile) {
//         const formData = new FormData();
//         formData.append("file", selectedFile);
//         const token = localStorage.getItem("token");

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

//       sendMessage(activeChat, messageInput, fileUrl, fileType);
//       setMessageInput("");
//       setSelectedFile(null);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (err) {
//       console.error("Error sending message:", err);
//     }
//   };

//   const groupMessagesByDate = (messages = []) => {
//     const groups = {};

//     messages.forEach((msg) => {
//       // const date = moment(msg.createdAt).startOf("day");
//       // if (!date.isValid()) return;
//       const created = moment(msg.createdAt).startOf("day");
//       if (!created.isValid()) return;

//       let label;
//       const today = moment().startOf("day");
//       const yesterday = moment().subtract(1, "day").startOf("day");

//       // if (date.isSame(today)) label = "Today";
//       // else if (date.isSame(yesterday)) label = "Yesterday";
//       // else label = date.format("DD MMM YYYY");
//       if (created.isSame(today)) label = "Today";
//       else if (created.isSame(yesterday)) label = "Yesterday";
//       else label = created.format("DD MMM YYYY");

//       if (!groups[label]) groups[label] = [];
//       groups[label].push(msg);
//     });

//     // Sort each group internally
//     // Object.keys(groups).forEach((label) => {
//     //   groups[label].sort(
//     //     (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//     //   );
//     // });
//     Object.keys(groups).forEach((label) => {
//       groups[label].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
//     });

//     return groups;
//   };

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
//   let typingTimeout = useRef(null);

//   const handleTyping = (e) => {
//     setMessageInput(e.target.value);
//     if (socket && activeChat) {
//       socket.emit("typing", {
//         chatId: activeChat,
//         userId: localStorage.getItem("userId"),

//       });
//     }
//   };

//   return (
//     <div className="flex w-full h-screen">
//       {/* Sidebar */}
//       {/* <div className="w-1/5 border border-black bg-blue-900 text-white p-4 overflow-y-auto">
//         <h2 className="font-bold text-xl mb-4">Your Mentees</h2>
//         {chats.map((mentee) => (
//           <div
//             key={mentee._id}
//             onClick={() => handleMenteeSelect(mentee)}
//             className="cursor-pointer mb-4 flex items-center gap-4"
//           >
//             <img
//               src={mentee.profile_pic}
//               className="w-12 h-12 rounded-full"
//               alt="profile"
//             />
//             <div>
//               <div>{mentee.name}</div>
//               <div className="text-xs">{mentee.email}</div>
//             </div>
//           </div>
//         ))}
//       </div> */}

//       <div className="w-1/5 bg-[#1E3A8A] text-white border border-black p-4">
//         <h2 className="text-xl font-bold mb-4">Your Mentees</h2>
//         <div className="space-y-2 overflow-y-auto">
//           {chats.map((mentee) => (
//             <div
//               key={mentee._id}
//               onClick={() => handleMenteeSelect(mentee)}
//               className={`p-3 rounded-lg cursor-pointer ${
//                 selectedMentee?._id === mentee._id
//                   ? "bg-[#2446A3]"
//                   : "hover:bg-[#2548A8]"
//               }`}
//             >
//               <div className="flex items-center gap-2">
//                 <img
//                   src={mentee.profile_pic || "/default-avatar.png"}
//                   alt={mentee.name}
//                   className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div>
//                   <div className="font-semibold">{mentee.name}</div>
//                   <div className="text-sm text-gray-300">{mentee.email}</div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Chat Window */}

//       <div className="flex-1 bg-gray-50 flex flex-col">
//         {selectedMentee ? (
//           <>
//             {/* Header */}
//             <div className="bg-[#1E3A8A] p-4 border-t border-b border-r flex items-center">
//               <button
//                 onClick={() => {
//                   setSelectedMentee(null);
//                 }}
//                 className="mr-2"
//               >
//                 <ChevronLeft color="white" />
//               </button>
//               <img
//                 src={selectedMentee.profile_pic}
//                 alt={selectedMentee.name}
//                 className="w-10 h-10 rounded-full mr-3"
//               />
//               <div>
//                 <div className="font-semibold text-white">
//                   {selectedMentee.name}
//                 </div>
//                 <div className="text-sm text-gray-300">
//                   {selectedMentee.email}
//                 </div>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className="flex flex-col  flex-grow overflow-y-auto p-4 bg-gray-50">
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
//               {typingStatus[activeChat] && typingStatus[activeChat] !== currentUserId && (
//   <div className="text-sm italic text-gray-500 mb-2">Typing...</div>
// )}
// <div ref={messagesEndRef} />
//             </div>
//           </>
//         ) : (
//           <div className="flex justify-center items-center flex-grow text-gray-500">
//             Select a mentee
//           </div>
//         )}

//         {/* Message input remains unchanged */}
//         {activeChat && (
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSendMessage();
//             }}
//             className="p-4 border-t bg-white"
//           >
//             <div className="flex gap-2 items-center">
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={(e) => setSelectedFile(e.target.files[0])}
//                 className="hidden"
//               />
//               <button
//                 type="button"
//                 onClick={() => fileInputRef.current?.click()}
//                 className="px-3 py-2 rounded cursor-pointer flex items-center justify-center"
//               >
//                 <Paperclip className="w-5 h-5" />
//               </button>

//               <input
//                 type="text"
//                 value={messageInput}
//                 onChange={(e) => setMessageInput(e.target.value)}
//                 placeholder="Type your message..."
//                 className="flex-1 border rounded px-4 py-2"
//               />

//               <button
//                 type="submit"
//                 className="bg-[#1E3A8A] text-white px-6 py-2 rounded hover:bg-[#284FB8]"
//               >
//                 Send
//               </button>
//             </div>

//             {selectedFile && (
//               <div className="text-sm text-gray-600 mt-1">
//                 Selected: {selectedFile.name}
//               </div>
//             )}
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }
