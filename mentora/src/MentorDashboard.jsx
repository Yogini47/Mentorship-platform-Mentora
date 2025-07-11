import React, { useState, useEffect } from "react";
import {
  Users,
  ChevronDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import ChatBox from "./ChatBox";
import axios from "axios";
import MentorNavbar from "./MentorNavbar";
import { useMentee } from "../context/MenteeContext";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

const MentorDashboard = ({ mentees: initialMentees }) => {
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [showMentees, setShowMentees] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [mentorBlogs, setMentorBlogs] = useState([]);
  const [blogPage, setBlogPage] = useState(0);
  const blogsPerPage = 3;
  const { mentees, addMentee } = useMentee();
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");

  const paginatedBlogs = mentorBlogs.slice(
    blogPage * blogsPerPage,
    blogPage * blogsPerPage + blogsPerPage
  );

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Get current mentor
        const {
          data: { user: mentorData },
        } = await axios.get("http://localhost:8000/api/v2/users/current-user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMentor(mentorData);

        // 2️⃣ Fetch connected mentees with auth header
        const {
          data: { data: connected },
        } = await axios.get(
          `http://localhost:8000/api/v2/users/mentors/${mentorData._id}/connected-mentees`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

     

        connected
          .filter((mentee) => !mentees.some((m) => m._id === mentee._id))
          .forEach(addMentee);

        // 3️⃣ Fetch blogs at the correct singular path (with auth if needed)
        const {
          data: { data: blogs },
        } = await axios.get(
          `http://localhost:8000/api/v2/users/blogs/mentor/${mentorData._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMentorBlogs(blogs || []);
      } catch (error) {
        console.error("Error fetching mentor data or blogs:", error);
      }
    };

    fetchMentor();
  }, []); // Dependencies adjusted to ensure state updates are captured

  // Ensure unique mentees (filter out duplicates)
  const uniqueMentees = [
    ...new Map(mentees.map((mentee) => [mentee._id, mentee])).values(),
  ];

  const sendMessage = () => {
    if (newMessage.trim() === "" || !selectedMentee) return;

    setMessages((prevMessages) => ({
      ...prevMessages,
      [selectedMentee._id]: [
        ...(prevMessages[selectedMentee._id] || []),
        { sender: "mentor", text: newMessage },
      ],
    }));

    setNewMessage("");
  };

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <aside className="w-1/5 h-full bg-opacity-10 backdrop-blur-xl bg-[#d9f0ff] border-r shadow-xl">
        {/* Mentor Profile */}
        <div className="flex flex-col items-center text-center space-y-4 p-4 w-full">
          <h2 className="text-2xl py-1 font-bold text-center">Dashboard</h2>

          {mentor?.profile_pic && (
            <img
              src={mentor.profile_pic}
              alt="Mentor"
              className="w-30 h-30 rounded-full"
            />
          )}
          <h3 className="font-semibold text-2xl">
            {mentor?.fullName || "Mentor Name"}
          </h3>
          <p className="text-md font-semibold text-[#1E3A8A]">
            {mentor?.designation || "Mentor"}
          </p>
        </div>

        <hr className="opacity-10 mx-4" />

        {/* Sidebar Actions */}
        <div className="space-y-4 p-4 w-full">
          {/* Messages Button */}
          <button
            onClick={() => navigate("/MentorChat")}
            className="w-full flex items-center space-x-2 p-2 rounded-lg cursor-pointer"
          >
            <IoChatbubbleEllipsesOutline size={20} />
            <span>Messages </span>
          </button>

          {/* Mentees Section */}
          <div>
            <button
              onClick={() => setShowMentees(!showMentees)}
              className="w-full flex justify-between cursor-pointer items-center p-2 rounded-lg"
            >
              <span className="flex items-center space-x-2">
                <Users size={20} />{" "}
                <span>Mentees ({uniqueMentees.length})</span>
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  showMentees ? "rotate-180" : ""
                }`}
              />
            </button>

            {showMentees && (
              <div className="mt-2 bg-white bg-opacity-20 border rounded-lg p-2">
                {uniqueMentees.filter(
                  (mentee) => mentee && mentee.name && mentee.email
                ).length === 0 ? (
                  <p className="text-sm">No mentees yet</p>
                ) : (
                  <ul>
                    {uniqueMentees
                      .filter((mentee) => mentee && mentee.name && mentee.email)
                      .map(
                        (
                          mentee,
                          index,
                          filteredArray // <- added filteredArray here
                        ) => (
                          <React.Fragment key={mentee._id || index}>
                            <li className="flex items-center gap-3 text-sm bg-white bg-opacity-30 p-2 rounded-lg">
                              <img
                                src={
                                  mentee.profile_pic || "/default-avatar.png"
                                }
                                alt={mentee.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-semibold">{mentee.name}</p>
                                <p className="text-xs">{mentee.email}</p>
                              </div>
                            </li>
                            {index !== filteredArray.length - 1 && ( // <- use filteredArray.length
                              <hr className="my-2 border-gray-200 border-opacity-40" />
                            )}
                          </React.Fragment>
                        )
                      )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <main className="w-4/5 h-full bg-gray-50 flex flex-col overflow-y-auto">
        <MentorNavbar />

        {selectedMentee ? (
          // Chat Interface
          <div className="flex h-full">
            {/* Chat Sidebar */}
            <div className="w-1/4 bg-[#182e6e] text-white p-4">
              <h2 className="text-lg font-bold mb-4">Messages</h2>
              <div className="space-y-2">
                {uniqueMentees.map((mentee) => (
                  <div
                    key={mentee._id}
                    className={`p-3 rounded-lg flex gap-2 cursor-pointer ${
                      selectedMentee._id === mentee._id
                        ? "bg-[#1E3A8A]"
                        : "hover:bg-[#1E3A8A]"
                    }`}
                    onClick={() => setSelectedMentee(mentee)}
                  >
                    <img
                      src={mentee.profile_pic || "/default-avatar.png"}
                      alt={mentee.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{mentee.name}</p>
                      <p className="text-xs text-gray-300">{mentee.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Header */}
              <div className="flex items-center p-4 bg-[#1E3A8A] text-white">
                <img
                  src={selectedMentee.profile_pic || "/default-avatar.png"}
                  alt={selectedMentee.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-semibold">{selectedMentee.name}</h3>
                  <p className="text-xs text-gray-300">
                    {selectedMentee.email}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages[selectedMentee._id]?.length > 0 ? (
                  messages[selectedMentee._id].map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender === "mentor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg max-w-xs ${
                          msg.sender === "mentor"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Regular Dashboard Content
          <>
            <div className="bg-[#d9f0ff] m-6 p-6 rounded-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 flex flex-col pt-8 md:h-60 max-h-60">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Welcome,{" "}
                    <span className="text-[#1E3A8A]">
                      {mentor?.fullName || "Mentor"}
                    </span>
                  </h2>

                  <p className="text-gray-700 my-3 mr-1 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-[#1E3A8A] scrollbar-track-[#d9f0ff] scrollbar-rounded-lg">
                    {mentor?.bio || "Bio not provided"}
                  </p>

                  <div className="mt-auto pt-4">
                    <p className="text-[#1E3A8A]">
                      Total Mentees: {uniqueMentees.length}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <img
                    src="/woman2.png"
                    alt="Mentor Profile"
                    className="h-60 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Mentor Blogs */}
            <div className="mx-6 mb-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Blogs</h2>
                <button
                  onClick={() => navigate("/AddBlog")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
                >
                  <IoMdAdd size={20} />
                  Add Blog
                </button>
              </div>

              {mentorBlogs.length === 0 ? (
                <p className="text-gray-500">
                  You haven't written any blogs yet.
                </p>
              ) : (
                <div>
                  <div className="relative">
                    {/* Left Arrow */}
                    <button
                      disabled={blogPage === 0}
                      onClick={() => setBlogPage(blogPage - 1)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black disabled:opacity-30 transition-all duration-200 z-10 focus:outline-none focus:ring-0"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow */}
                    <button
                      disabled={
                        (blogPage + 1) * blogsPerPage >= mentorBlogs.length
                      }
                      onClick={() => setBlogPage(blogPage + 1)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black disabled:opacity-30 transition-all duration-200 z-10 focus:outline-none focus:ring-0"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Blog Grid */}
                    <ul className="mx-10 grid gap-6 md:grid-cols-3">
                      {paginatedBlogs.map((blog) => (
                        <li
                          key={blog._id}
                          className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/blogs/${blog._id}`)}
                        >
                          <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="text-lg font-semibold truncate">
                              {blog.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <img
                                src={blog.owner_id?.profile_pic}
                                alt={blog.owner_id?.fullName}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <p className="text-sm font-semibold text-gray-700">
                                {blog.owner_id?.fullName}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                              {blog.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                              <span>
                                {new Date(blog.createdAt).toLocaleDateString(
                                  "en-GB"
                                )}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />{" "}
                                  {blog.likes.length}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />{" "}
                                  {blog.comments.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MentorDashboard;
