// components/AddBlog.jsx
import React, { useState, useEffect, useContext } from "react";
import { BlogContext } from "../context/BlogContext";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import MentorNavbar from "./MentorNavbar";
import axios from "axios";

const AddBlog = () => {
  const { fetchBlogs } = useContext(BlogContext);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [blog, setBlog] = useState({
    title: "",
    content: "",
    coverImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v2/users/current-user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleChange = (e) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setBlog((prev) => ({ ...prev, coverImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("User information is still loading...");
      return;
    }

    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const blogPayload = {
      owner_id: currentUser._id,
      title: blog.title,
      description: blog.content.slice(0, 150),
      text: blog.content,
      tags: [],
      cover_image: blog.coverImage,
      mentorName: currentUser.fullName,
      mentorImage: currentUser.image,
      date: formattedDate,
    };

    console.log("Current user:", currentUser);
    console.log("Sending payload:", blogPayload);

    try {
      await axios.post(
        "http://localhost:8000/api/v2/users/blogs/create",
        blogPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchBlogs(); // REFRESH blogs with populated owner_id
      navigate("/BlogPage");
    } catch (error) {
      console.error("Error creating blog:", error.response?.data || error);
      alert("Failed to publish blog.");
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50">
      <MentorNavbar />
      <div className="max-w-5xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg border">
        <h2 className="text-2xl font-bold mb-4 text-center">Add New Blog</h2>

        <div className="relative w-full h-70 bg-gray-200 rounded-lg overflow-hidden">
          {previewImage ? (
            <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-gray-500 border">
              Cover Photo Preview
            </span>
          )}

          <label className="absolute bottom-2 right-2 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-800">
            <Pencil size={18} className="text-white" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            name="title"
            placeholder="Blog Title"
            value={blog.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <textarea
            name="content"
            placeholder="Write your blog here..."
            value={blog.content}
            onChange={handleChange}
            required
            rows="6"
            className="w-full p-2 border rounded"
          ></textarea>

          <button
            type="submit"
            className="w-full text-white py-2 rounded bg-[#1E3A8A] hover:bg-[#182e6e]"
          >
            Publish Blog
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;



// import React, { useState, useEffect, useContext } from "react";
// import { BlogContext } from "../context/BlogContext";
// import { useNavigate } from "react-router-dom";
// import { Pencil } from "lucide-react";
// import MentorNavbar from "./MentorNavbar";
// import axios from "axios";

// const AddBlog = () => {
//   const { addBlog } = useContext(BlogContext);
//   const navigate = useNavigate();
//   const { fetchBlogs } = useContext(BlogContext);

//   const [currentUser, setCurrentUser] = useState(null);
//   const [blog, setBlog] = useState({
//     title: "",
//     content: "",
//     coverImage: null
//   });
//   const [previewImage, setPreviewImage] = useState(null);

//   // Fetch current user
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const response = await axios.get("http://localhost:8000/api/v2/users/current-user", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//           }
//         });
//         setCurrentUser(response.data.user);
//       } catch (error) {
//         console.error("Failed to fetch current user:", error);
//       }
//     };

//     fetchCurrentUser();
//   }, []);

//   const handleChange = (e) => {
//     setBlog({ ...blog, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPreviewImage(URL.createObjectURL(file));

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBlog((prev) => ({ ...prev, coverImage: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!currentUser) {
//       alert("User information is still loading...");
//       return;
//     }

//     const formattedDate = new Date().toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "long",
//       year: "numeric"
//     });

//     const blogPayload = {
//       owner_id: currentUser._id, // ✅ Key part!
//       title: blog.title,
//       description: blog.content.slice(0, 150),
//       text: blog.content,
//       tags: [],
//       cover_image: blog.coverImage,
//       mentorName: currentUser.fullName,
//       mentorImage: currentUser.image,
//       date: formattedDate
//     };

//     console.log("Current user:", currentUser);
//     console.log("Sending payload:", blogPayload);

//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/v2/users/blogs/create",
//         blogPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//           }
//         }
//       );

//       addBlog(response.data.data);
//       navigate("/BlogPage");

//     } catch (error) {
//       console.error("Error creating blog:", error.response?.data || error);
//       alert("Failed to publish blog.");
//     }
//   };

//   return (
//     <div className="w-full h-screen bg-gray-50">
//       <MentorNavbar />
//       <div className="max-w-5xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-lg border">
//         <h2 className="text-2xl font-bold mb-4 text-center">Add New Blog</h2>

//         <div className="relative w-full h-70 bg-gray-200 rounded-lg overflow-hidden">
//           {previewImage ? (
//             <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
//           ) : (
//             <span className="flex items-center justify-center w-full h-full text-gray-500 border">
//               Cover Photo Preview
//             </span>
//           )}

//           <label className="absolute bottom-2 right-2 bg-gray-700 p-2 rounded-full cursor-pointer hover:bg-gray-800">
//             <Pencil size={18} className="text-white" />
//             <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//           </label>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4 mt-4">
//           <input
//             type="text"
//             name="title"
//             placeholder="Blog Title"
//             value={blog.title}
//             onChange={handleChange}
//             required
//             className="w-full p-2 border rounded"
//           />

//           <textarea
//             name="content"
//             placeholder="Write your blog here..."
//             value={blog.content}
//             onChange={handleChange}
//             required
//             rows="6"
//             className="w-full p-2 border rounded"
//           ></textarea>

//           <button
//             type="submit"
//             className="w-full text-white py-2 rounded bg-[#1E3A8A] hover:bg-[#182e6e]"
//           >
//             Publish Blog
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddBlog;

