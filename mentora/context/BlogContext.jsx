// context/BlogContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [blogs, setBlogs] = useState([]);
  const [likes, setLikes] = useState({}); // key: blogId, value: array of menteeIds

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v2/users/blogs");
      const blogData = res.data.data;
      setBlogs(blogData);

      const initialLikes = blogData.reduce((acc, blog) => {
        acc[blog._id] = blog.likes || [];
        return acc;
      }, {});
      setLikes(initialLikes);
    } catch (error) {
      console.error("Error fetching blogs from context:", error);
    }
  };

  const addBlog = (newBlog) => {
    setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
    setLikes((prevLikes) => ({
      ...prevLikes,
      [newBlog._id]: newBlog.likes || [],
    }));
  };

  const updateBlogComments = (blogId, newComment) => {
    setBlogs((prev) =>
      prev.map((blog) =>
        blog._id === blogId
          ? { ...blog, comments: [...blog.comments, newComment] }
          : blog
      )
    );
  };

  const toggleLike = (blogId, menteeId) => {
    setLikes((prevLikes) => {
      const existingLikes = prevLikes[blogId] || [];
      const hasLiked = existingLikes.includes(menteeId);

      const updatedLikes = hasLiked
        ? existingLikes.filter((id) => id !== menteeId)
        : [...existingLikes, menteeId];

      return {
        ...prevLikes,
        [blogId]: updatedLikes,
      };
    });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <BlogContext.Provider
      value={{
        blogs,
        setBlogs,
        likes,
        setLikes,
        toggleLike,
        addBlog,
        updateBlogComments,
        fetchBlogs, // Expose fetchBlogs
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => useContext(BlogContext);



// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";

// export const BlogContext = createContext();

// export const BlogProvider = ({ children }) => {
//   const [blogs, setBlogs] = useState([]);
//   const [likes, setLikes] = useState({}); // key: blogId, value: array of menteeIds

//   const addBlog = (newBlog) => {
//     setBlogs((prevBlogs) => [...prevBlogs, newBlog]);
//     setLikes((prevLikes) => ({
//       ...prevLikes,
//       [newBlog._id]: newBlog.likes || [],
//     }));
//   };

//   const updateBlogComments = (blogId, newComment) => {
//     setBlogs((prev) =>
//       prev.map((blog) =>
//         blog._id === blogId
//           ? { ...blog, comments: [...blog.comments, newComment] }
//           : blog
//       )
//     );
//   };

//   const toggleLike = (blogId, menteeId) => {
//     setLikes((prevLikes) => {
//       const existingLikes = prevLikes[blogId] || [];
//       const hasLiked = existingLikes.includes(menteeId);

//       const updatedLikes = hasLiked
//         ? existingLikes.filter((id) => id !== menteeId)
//         : [...existingLikes, menteeId];

//       return {
//         ...prevLikes,
//         [blogId]: updatedLikes,
//       };
//     });
//   };

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await axios.get("http://localhost:8000/api/v2/users/blogs");
//         const blogData = res.data.data;
//         setBlogs(blogData);

//         const initialLikes = blogData.reduce((acc, blog) => {
//           acc[blog._id] = blog.likes || [];
//           return acc;
//         }, {});
//         setLikes(initialLikes);
//       } catch (error) {
//         console.error("Error fetching blogs from context:", error);
//       }
//     };

//     fetchBlogs();
//   }, []);

//   return (
//     <BlogContext.Provider
//       value={{
//         blogs,
//         setBlogs,
//         likes,
//         setLikes,
//         toggleLike,
//         addBlog,
//         updateBlogComments,
//         fetchBlogs,
//       }}
//     >
//       {children}
//     </BlogContext.Provider>
//   );
// };

// export const useBlogContext = () => useContext(BlogContext);
