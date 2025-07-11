import React, { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import MentorNavbar from "./MentorNavbar";
import Navbar from "./Navbar"; // Assuming this is your mentee navbar component
import { useNavigate } from "react-router-dom";
import { useBlogContext } from "../context/BlogContext";

const BlogPage = () => {
  const { blogs, likes, toggleLike } = useBlogContext();
  const navigate = useNavigate();
  const menteeId = localStorage.getItem("menteeId");

  // State to track the user type
  const [userType, setUserType] = useState(null);

  // Check the user type on component mount
  useEffect(() => {
    const type = localStorage.getItem("userType") || "mentee"; // Default to "mentee" if userType is not set
    setUserType(type);
    console.log("User Type from localStorage:", type); // Loag the user type
  }, []);

  // Conditionally render MentorNavbar or Navbar based on userType
  if (userType === null) {
    return <div>Loading...</div>; // or a spinner if preferred
  }

  const NavbarComponent = userType === "mentor" ? MentorNavbar : Navbar;

   // Sort blogs by newest first
   const sortedBlogs = [...blogs].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
      <NavbarComponent /> {/* Render the appropriate navbar */}
      </div>

      <div className="max-w-7xl mx-auto p-6 mt-17">
        <h2 className="text-3xl font-bold mb-6">Mentor Blogs</h2>

        {sortedBlogs.length === 0 ? (
          <p>No blogs available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBlogs.map((blog) => {
             const likeArray = blog.likes || [];
             const liked = likeArray.includes(menteeId);
             const likeCount = likeArray.length;
             

              return (
                <div
                  key={blog._id}
                  className="bg-white shadow-xl rounded-lg p-4 flex flex-col border border-gray-400 transform transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate(`/blogs/${blog._id}`)}
                >
                  <img
                    src={blog.cover_image}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-md"
                  />

                  <h3 className="text-xl font-bold mt-2 truncate w-full whitespace-nowrap overflow-hidden">
                    {blog.title}
                  </h3>

                  <div className="flex items-center space-x-2 mt-2">
                    {blog.owner_id ? (
                      <>
                        <img
                          src={blog.owner_id.profile_pic || "/default-profile.jpg"}
                          alt="Mentor"
                          className="w-10 h-10 rounded-full"
                        />
                        <p className="font-semibold">
                          {blog.owner_id.fullName || "Unknown Mentor"}
                        </p>
                      </>
                    ) : (
                      <p>Loading mentor...</p>
                    )}
                  </div>

                  <p className="mt-2 text-gray-700 line-clamp-3">
                    {blog.description || blog.text}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-gray-500 text-sm">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(blog._id, menteeId);
                        }}
                      >
                        <Heart
                          className={`w-6 h-6 transition ${
                            liked ? "fill-red-500 text-red-500" : "text-gray-600"
                          }`}
                          strokeWidth={liked ? 0 : 2}
                        />
                        <span className="text-sm">{likeCount}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-blue-600">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{blog.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

