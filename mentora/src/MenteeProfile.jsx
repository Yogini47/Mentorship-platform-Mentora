import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import axios from "axios";

const GEOAPIFY_API_KEY = "af06f0cac97c48bcb3636602fbe7d235";

const MenteeProfile = () => {
  const { menteeId } = useParams();
  const [mentee, setMentee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile_pic: "",
    bio: "",
    // contact: "",
    education: {
      college_name: "",
      year: "",
      course_name: "",
    },
    location: "",
    goals: "", // Added Goal field
  });

  const [locationInput, setLocationInput] = useState("");
const [locationSuggestions, setLocationSuggestions] = useState([]);


  useEffect(() => {
    const fetchMentee = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v2/users/current-user",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMentee(response.data.user);
        setFormData({
          profile_pic: response.data.user.profile_pic || "",
          bio: response.data.user.bio || "",
          // contact: response.data.user.contact || "",
          education: response.data.user.education || {
            college_name: "",
            year: "",
            course_name: "",
          },
          location: response.data.user.location || "",
          goals: response.data.user.goals || "", // Initialize goal
        });

        setLocationInput(response.data.user.location || "");


      } catch (error) {
        console.error("Error fetching mentee profile:", error);
      }
    };
    fetchMentee();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setLocationInput(query);
    setFormData({ ...formData, location: "" });
  
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
  
    try {
      const res = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
        params: {
          text: query,
          apiKey: GEOAPIFY_API_KEY,
          limit: 5,
          lang: "en",
        },
      });
  
      const results = res.data.features.map((feature) => {
        const props = feature.properties;
        return `${props.city || props.name}, ${props.state}, ${props.country}`;
      });
  
      setLocationSuggestions(results);
    } catch (err) {
      console.error("Error fetching location:", err);
    }
  };
  
  const handleSelectLocation = (loc) => {
    setFormData({ ...formData, location: loc });
    setLocationInput(loc);
    setLocationSuggestions([]);
  };
  

  const handleSave = async () => {
    try {
      await axios.patch(
        "http://localhost:8000/api/v2/users/update-Mentee",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMentee((prevMentee) => ({ ...prevMentee, ...formData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating mentee profile:", error);
    }
  };

  if (!mentee) {
    return <div>Loading...</div>;
  }

//   return (
//     <div className="bg-[#B0C4DE] min-h-screen">
//       <Navbar />
//       <div className="w-screen flex justify-center mt-10">
//         <div className="w-7xl bg-gray-100 p-6 shadow-md rounded-lg border border-gray-300">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>
//           <div className="flex items-start mb-6">
//             <img
//               src={mentee.profile_pic || "https://via.placeholder.com/150"}
//               alt="Profile"
//               className="w-32 h-32 rounded-full mr-6 object-cover aspect-square"
//             />
//             <div>
//               <h3 className="text-xl font-semibold text-gray-800">
//                 {mentee.name || "No name available"}
//               </h3>
//               <span className="text-lg">{mentee.email || "N/A"}</span>
//               <div className="mt-2">
//                 <span className="text-lg font-semibold">Goals:</span>
//                 {isEditing ? (
//                   <input
//                     type="text"
//                     name="goals"
//                     value={formData.goals}
//                     onChange={handleChange}
//                     className="border border-gray-300 p-2 rounded-md"
//                   />
//                 ) : (
//                   <span className="text-lg">
//                     {" "}
//                     {mentee.goals || "Not specified"}{" "}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-end mb-4">
//             {isEditing ? (
//               <button
//                 onClick={handleSave}
//                 className="bg-green-500 text-white px-2 py-1 rounded-lg shadow-md hover:bg-green-600 transition"
//               >
//                 Save
//               </button>
//             ) : (
//               <button
//                 onClick={handleEditClick}
//                 className="bg-blue-500 text-white px-2 py-1 rounded-lg shadow-md hover:bg-blue-600 transition"
//               >
//                 Edit Profile
//               </button>
//             )}
//           </div>

//           <hr className="border-t-2 border-gray-400 my-4" />
//           <div className="grid grid-cols-2 gap-x-10 gap-y-4">
//             <div className="flex flex-col">
//               <span className="text-lg font-semibold">Email:</span>
//               <span className="text-lg">{mentee.email || "N/A"}</span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-lg font-semibold">Gender:</span>
//               <span className="text-lg">
//                 {mentee.gender || "Not specified"}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-lg font-semibold">College Name:</span>
//               <span className="text-lg">
//                 {mentee.education?.college_name || "N/A"}
//               </span>
//             </div>

//             {/* Editable Year Field */}
//             <div className="flex flex-col">
//               <span className="text-lg font-semibold">Year of Completion:</span>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name="year"
//                   value={formData.education.year}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       education: {
//                         ...formData.education,
//                         year: e.target.value,
//                       },
//                     })
//                   }
//                   className="border border-gray-300 p-2 rounded-md"
//                 />
//               ) : (
//                 <span className="text-lg">
//                   {mentee.education?.year || "N/A"}
//                 </span>
//               )}
//             </div>

//             {/* Editable Course Name Field */}
//             <div className="flex flex-col">
//               <span className="text-lg font-semibold">Course Name:</span>
//               {isEditing ? (
//                 <input
//                   type="text"
//                   name="course_name"
//                   value={formData.education.course_name}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       education: {
//                         ...formData.education,
//                         course_name: e.target.value,
//                       },
//                     })
//                   }
//                   className="border border-gray-300 p-2 rounded-md"
//                 />
//               ) : (
//                 <span className="text-lg">
//                   {mentee.education?.course_name || "N/A"}
//                 </span>
//               )}
//             </div>

//             {/* <div className="flex flex-col">
//               <span className="text-lg font-semibold">Location:</span>
//               <span className="text-lg">{mentee.location || "N/A"}</span>
//             </div> */}

// <div className="flex flex-col">
//   <span className="text-lg font-semibold">Location:</span>
//   {isEditing ? (
//     <div className="relative">
//       <input
//         type="text"
//         name="location"
//         value={locationInput}
//         onChange={handleLocationChange}
//         className="border rounded-md px-2 py-1 w-full"
//         placeholder="Start typing your location..."
//       />
//       {locationSuggestions.length > 0 && (
//         <ul className="absolute bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10 w-full">
//           {locationSuggestions.map((loc, index) => (
//             <li
//               key={index}
//               onClick={() => handleSelectLocation(loc)}
//               className="p-2 hover:bg-gray-100 cursor-pointer"
//             >
//               {loc}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   ) : (
//     <span className="text-lg">{mentee.location || "N/A"}</span>
//   )}
// </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MenteeProfile;




return (
  <div className="bg-[#B0C4DE] min-h-screen">
    <Navbar />
    <div className="w-screen flex justify-center mt-10">
      <div className="w-7xl bg-gray-100 p-6 shadow-md rounded-lg border border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>

        <div className="flex items-start mb-6">
          <img
            src={mentee.profile_pic || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-32 h-32 rounded-full mr-6 object-cover aspect-square"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {mentee.name || "No name available"}
            </h3>
            <p className="text-lg text-gray-700">{mentee.email || "N/A"}</p>
            <div className="mt-2">
              <span className="text-lg font-semibold">Goals:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="goals"
                  value={formData.goals}
                  onChange={handleChange}
                  className="text-md border rounded-md px-2 py-1 mt-1 w-full"
                />
              ) : (
                <p className="text-md text-gray-700">{mentee.goals || "Not specified"}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleEditClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        <hr className="border-t-2 border-gray-400 my-4" />

        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Gender:</span>
            <span className="text-lg">{mentee.gender || "Not specified"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-semibold">College Name:</span>
            <span className="text-lg">{mentee.education?.college_name || "N/A"}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-semibold">Year of Completion:</span>
            {isEditing ? (
              <input
                type="text"
                name="year"
                value={formData.education.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    education: { ...formData.education, year: e.target.value },
                  })
                }
                className="border rounded-md px-2 py-1"
              />
            ) : (
              <span className="text-lg">{mentee.education?.year || "N/A"}</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-semibold">Course Name:</span>
            {isEditing ? (
              <input
                type="text"
                name="course_name"
                value={formData.education.course_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    education: { ...formData.education, course_name: e.target.value },
                  })
                }
                className="border rounded-md px-2 py-1"
              />
            ) : (
              <span className="text-lg">{mentee.education?.course_name || "N/A"}</span>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-lg font-semibold">Location:</span>
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={locationInput}
                  onChange={handleLocationChange}
                  className="border rounded-md px-2 py-1 w-full"
                  placeholder="Start typing your location..."
                />
                {locationSuggestions.length > 0 && (
                  <ul className="absolute bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10 w-full">
                    {locationSuggestions.map((loc, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelectLocation(loc)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <span className="text-lg">{mentee.location || "N/A"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default MenteeProfile;