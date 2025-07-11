import { useParams } from "react-router-dom";
import { useBlogContext } from "../context/BlogContext";
import MentorNavbar from "./MentorNavbar";
import Navbar from "./Navbar";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const Blog = () => {
  const { blogs, setBlogs } = useBlogContext();
  const { blogId } = useParams();
  const [newComment, setNewComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [userType, setUserType] = useState(null);

  const menteeId = localStorage.getItem("menteeId");
  const token = localStorage.getItem("token");

  const commentSectionRef = useRef(null);

  useEffect(() => {
    const type = localStorage.getItem("userType") || "mentee";
    setUserType(type);
  }, []);

  const NavbarComponent = userType === "mentor" ? MentorNavbar : Navbar;

  useEffect(() => {
    const blog = blogs.find((b) => b._id === blogId);
    if (blog) {
      setLikeCount(blog.likes?.length || 0);
      setHasLiked(blog.likes?.includes(menteeId));
    }
  }, [blogs, blogId, menteeId]);

  const blog = blogs.find((b) => b._id === blogId);

  if (!blog) {
    return <div className="text-center text-xl mt-10">Blog not found.</div>;
  }

  const mentorName = blog.owner_id?.fullName || "Unknown Mentor";
  const mentorImage = blog.owner_id?.profile_pic || "https://via.placeholder.com/150";
  const date = new Date(blog.createdAt).toLocaleDateString();
  const content = blog.text || blog.description || "No content available";

  const handleLike = async () => {
    if (!menteeId || !token) {
      alert("You must be logged in to like this post.");
      return;
    }

    try {
      const res = await axios.put(
        "http://localhost:8000/api/v2/users/blogs/like",
        { blogId, menteeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedBlog = res.data.data;

      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => (b._id === blogId ? updatedBlog : b))
      );

      setHasLiked(updatedBlog.likes.includes(menteeId));
      setLikeCount(updatedBlog.likes.length);
    } catch (err) {
      console.error("❌ Error liking blog:", err.response?.data || err.message);
      alert("Failed to update like.");
    }
  };

  const scrollToCommentSection = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    if (!token || !menteeId) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v2/users/blogs/comment",
        {
          blogId,
          menteeId,
          comment: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedBlog = res.data.data;

      setBlogs((prevBlogs) =>
        prevBlogs.map((b) => (b._id === blogId ? updatedBlog : b))
      );
      setNewComment("");
    } catch (err) {
      console.error("❌ Error posting comment:", err.response?.data || err.message);
      alert("Failed to post comment.");
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-10">
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <NavbarComponent />
      </div>

      <div className="h-24" /> {/* Gray-50 background spacer */}

      <div className="max-w-6xl mx-auto bg-white shadow-xl border rounded-lg p-6">
        {blog.cover_image && (
          <img
            src={blog.cover_image}
            alt="Blog Cover"
            className="w-full rounded-md max-h-[600px]"
          />
        )}

        <h1 className="text-3xl font-bold mt-4">{blog.title}</h1>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <img
              src={mentorImage}
              alt="Mentor"
              className="w-14 h-14 rounded-full"
            />
            <div>
              <p className="text-lg font-semibold">{mentorName}</p>
              <p className="text-gray-500 text-sm">{date}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-gray-600">
            <div
              className="flex items-center space-x-1 cursor-pointer"
              onClick={handleLike}
            >
              <Heart
                className={`w-7 h-7 transition ${
                  hasLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
                strokeWidth={hasLiked ? 0 : 2}
              />
              <span className="text-sm">{likeCount}</span>
            </div>
            <div
              onClick={scrollToCommentSection}
              className="flex items-center cursor-pointer space-x-1 text-blue-500"
            >
              <MessageCircle className="w-7 h-7" />
              <span className="text-md">{blog.comments?.length || 0}</span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
          {content}
        </p>

        <div ref={commentSectionRef} className="mt-16 pt-6 border-t border-gray-300">
          <h2 className="text-xl font-semibold mb-4">Comments</h2>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {(blog.comments || []).map((c, index) => (
              <div key={index} className="p-3 mb-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={c.mentee?.profile_pic || "https://via.placeholder.com/40"}
                    alt="profile"
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium">
                    {c.mentee?._id === menteeId ? "You" : c.mentee?.name || "Anonymous"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{c.comment}</p>
                <p className="text-xs text-gray-500">
                  {new Date(c.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center mt-4 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
              <Send
                className={`w-5 h-5 ${
                  newComment.trim() ? "text-blue-600 hover:text-blue-800" : "text-gray-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;


// import { useParams } from "react-router-dom";
// import { useBlogContext } from "../context/BlogContext";
// import MentorNavbar from "./MentorNavbar";
// import Navbar from "./Navbar";
// import { Heart, MessageCircle, Send } from "lucide-react";
// import { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const Blog = () => {
//   const { blogs, setBlogs } = useBlogContext();
//   const { blogId } = useParams();
//   const [newComment, setNewComment] = useState("");
//   const [hasLiked, setHasLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);
//   const [userType, setUserType] = useState(null);

//   const menteeId = localStorage.getItem("menteeId");
//   const token = localStorage.getItem("token");

//   const commentSectionRef = useRef(null);

//   // Check the user type on component mount
//   useEffect(() => {
//     const type = localStorage.getItem("userType") || "mentee"; // Default to "mentee" if userType is not set
//     setUserType(type);
//   }, []);

//   // Ensure hooks are always called in the same order
//   const NavbarComponent = userType === "mentor" ? MentorNavbar : Navbar;

//   // Set the like state when blogs or blogId changes
//   useEffect(() => {
//     const blog = blogs.find((b) => b._id === blogId);
//     if (blog) {
//       setLikeCount(blog.likes?.length || 0);
//       setHasLiked(blog.likes?.includes(menteeId));
//     }
//   }, [blogs, blogId, menteeId]);

//   // Check if blog exists in blogs array
//   const blog = blogs.find((b) => b._id === blogId);

//   if (!blog) {
//     return <div className="text-center text-xl mt-10">Blog not found.</div>;
//   }

//   const mentorName = blog.owner_id?.fullName || "Unknown Mentor";
//   const mentorImage = blog.owner_id?.profile_pic || "https://via.placeholder.com/150";
//   const date = new Date(blog.createdAt).toLocaleDateString();
//   const content = blog.text || blog.description || "No content available";

//   // Handle like functionality
//   const handleLike = async () => {
//     if (!menteeId || !token) {
//       alert("You must be logged in to like this post.");
//       return;
//     }

//     try {
//       const res = await axios.put(
//         "http://localhost:8000/api/v2/users/blogs/like",
//         { blogId, menteeId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const updatedBlog = res.data.data;

//       setBlogs((prevBlogs) =>
//         prevBlogs.map((b) => (b._id === blogId ? updatedBlog : b))
//       );

//       setHasLiked(updatedBlog.likes.includes(menteeId));
//       setLikeCount(updatedBlog.likes.length);
//     } catch (err) {
//       console.error("❌ Error liking blog:", err.response?.data || err.message);
//       alert("Failed to update like.");
//     }
//   };

//   // Function to scroll to the comment section
//   const scrollToCommentSection = () => {
//     if (commentSectionRef.current) {
//       commentSectionRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }
//   };

//   // Handle comment submission
//   const handleCommentSubmit = async () => {
//     if (!newComment.trim()) return;

//     if (!token || !menteeId) {
//       alert("You must be logged in to comment.");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:8000/api/v2/users/blogs/comment",
//         {
//           blogId,
//           menteeId,
//           comment: newComment,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const updatedBlog = res.data.data;

//       setBlogs((prevBlogs) =>
//         prevBlogs.map((b) => (b._id === blogId ? updatedBlog : b))
//       );
//       setNewComment("");
//     } catch (err) {
//       console.error("❌ Error posting comment:", err.response?.data || err.message);
//       alert("Failed to post comment.");
//     }
//   };

//   return (
//     <div className="w-full bg-gray-50 min-h-screen pb-10">
//      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
//       <NavbarComponent /> {/* Render the appropriate navbar */}
//       </div>
//       <div className="max-w-6xl mx-auto bg-white shadow-xl border rounded-lg mt-25 p-6">
//         {blog.cover_image && (
//           <img
//             src={blog.cover_image}
//             alt="Blog Cover"
//             className="w-full rounded-md max-h-[600px]"
//           />
//         )}

//         <h1 className="text-3xl font-bold mt-4">{blog.title}</h1>

//         <div className="flex items-center justify-between mt-4">
//           <div className="flex items-center space-x-4">
//             <img
//               src={mentorImage}
//               alt="Mentor"
//               className="w-14 h-14 rounded-full"
//             />
//             <div>
//               <p className="text-lg font-semibold">{mentorName}</p>
//               <p className="text-gray-500 text-sm">{date}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4 text-gray-600">
//             <div
//               className="flex items-center space-x-1 cursor-pointer"
//               onClick={handleLike}
//             >
//               <Heart
//                 className={`w-7 h-7 transition ${
//                   hasLiked ? "fill-red-500 text-red-500" : "text-gray-600"
//                 }`}
//                 strokeWidth={hasLiked ? 0 : 2}
//               />
//               <span className="text-sm">{likeCount}</span>
//             </div>
//             <div onClick={scrollToCommentSection} className="flex items-center cursor-pointer space-x-1 text-blue-500">
//               <MessageCircle className="w-7 h-7" />
//               <span className="text-md">{blog.comments?.length || 0}</span>
//             </div>
//           </div>
//         </div>

//         <p className="mt-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
//           {content}
//         </p>

//         {/* Comment section */}
//         <div ref={commentSectionRef} className="mt-16 pt-6 border-t border-gray-300">
//           <h2 className="text-xl font-semibold mb-4">Comments</h2>

//           <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
//             {(blog.comments || []).map((c, index) => (
//               <div key={index} className="p-3 mb-3 bg-gray-100 rounded-lg">
//                 <div className="flex items-center gap-2 mb-1">
//                   <img
//                     src={c.mentee?.profile_pic || "https://via.placeholder.com/40"}
//                     alt="profile"
//                     className="w-6 h-6 rounded-full"
//                   />
//                   <span className="text-sm font-medium">
//                     {c.mentee?._id === menteeId ? "You" : c.mentee?.name || "Anonymous"}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-700">{c.comment}</p>
//                 <p className="text-xs text-gray-500">
//                   {new Date(c.timestamp).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>

//           <div className="flex items-center mt-4 bg-gray-100 rounded-full px-4 py-2">
//             <input
//               type="text"
//               className="flex-1 bg-transparent outline-none text-sm"
//               placeholder="Add a comment..."
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//             />
//             <button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
//               <Send
//                 className={`w-5 h-5 ${
//                   newComment.trim() ? "text-blue-600 hover:text-blue-800" : "text-gray-400"
//                 }`}
//               />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Blog;

