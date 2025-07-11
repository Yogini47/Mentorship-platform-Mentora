import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { CgProfile } from "react-icons/cg";
import { MdOutlinePerson, MdLogout } from "react-icons/md";
import { GrArticle } from "react-icons/gr";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoNotifications } from "react-icons/io5";
import { SlLock } from "react-icons/sl";
import { useMentee } from "../context/MenteeContext";
import { useNavigate } from "react-router-dom";

function MentorNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [mentor, setMentor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { addMentee } = useMentee();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    setShowLogoutPopup(false);
    localStorage.removeItem("token"); // Clear token on logout
    navigate("/");
  };

  const handleAccept = async (notif) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/users/mentors/connect/accept",
        { mentorId: mentor._id, menteeId: notif.mentee },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from notifications correctly
      setNotifications((prev) => prev.filter((n) => n.mentee !== notif.mentee));

      // Refresh connected mentees cleanly
      const refreshedMentor = await axios.get(
        `http://localhost:8000/api/v2/users/mentors/${mentor._id}/connected-mentees`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      refreshedMentor.data.data.forEach(addMentee);

      alert("Mentee request accepted successfully");
    } catch (error) {
      console.error("Error accepting mentee:", error);
      alert(error.response?.data?.message || "Failed to accept mentee request");
    }
  };


// const fetchNotifications = async () => {
//   try {
//     const response = await axios.get(
//       "http://localhost:8000/api/v2/users/mentors/notifications",
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     setNotifications(response.data.notifications);
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     console.error("Error response:", error.response);  // Log the full error response for debugging
//     alert("Failed to load notifications.");
//   }
// };


const fetchNotifications = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/v2/users/current-user",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifications(response.data.user.connectionRequests || []);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    console.error("Error response:", error.response);
    alert("Failed to load notifications.");
  }
};


  

  // const handleDismiss = async (notif) => {
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:8000/api/v2/users/mentors/connect/dismiss",
  //       { mentorId: mentor._id, menteeId: notif.mentee },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     // ✅ Refresh notifications cleanly
  //     await fetchNotifications();

  //     alert("Mentee request dismissed successfully");
  //   } catch (error) {
  //     console.error("Error dismissing request:", error);
  //     alert(
  //       error.response?.data?.message || "Failed to dismiss mentee request"
  //     );
  //   }
  // };

const handleDismiss = async (notif) => {
  try {
    // Optimistically remove notification
    setNotifications((prev) => prev.filter((n) => n.mentee !== notif.mentee));
    
    // Dismiss the mentee request
    await axios.post(
      "http://localhost:8000/api/v2/users/mentors/connect/dismiss",
      { mentorId: mentor._id, menteeId: notif.mentee },  // ✅ fixed here
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // After dismissal, fetch notifications again (or update UI)
    await fetchNotifications();

    alert("Mentee request dismissed successfully");
  } catch (error) {
    console.error("Error dismissing request:", error);
    alert(
      error.response?.data?.message || "Failed to dismiss mentee request"
    );
  }
};


  

  useEffect(() => {
    const fetchMentorAndNotifications = async () => {
      try {
        const mentorRes = await axios.get(
          "http://localhost:8000/api/v2/users/current-user",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMentor(mentorRes.data.user);
        setNotifications(mentorRes.data.user.connectionRequests || []);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    fetchMentorAndNotifications();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  return (
    <div className="w-full px-5 py-3 flex justify-between items-center bg-[#1E3A8A] relative">
      <h3 className="text-2xl text-white font-bold">Mentora</h3>

      <div className="flex gap-10 items-center relative">
        {/* Blog Icon */}
        <h4
          onClick={() => navigate("/BlogPage")}
          className="text-xl font-semibold cursor-pointer text-white flex items-center justify-center"
        >
          <GrArticle size="2rem" />
        </h4>

        {/* Notification Bell */}
        <div className="relative flex items-center justify-center" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center cursor-pointer justify-center text-white"
          >
            <IoNotifications size="2rem" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white rounded-full px-1">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-8 w-110 bg-white rounded-lg shadow-lg z-20 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Notifications</h2>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No new notifications</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.map((notif) => (
                    <li
                      key={notif._id}
                      className="flex items-center justify-between bg-[#f0f4ff] p-3 rounded-md border border-[#d1d5db]"
                    >
                      <p className="text-gray-800 text-sm w-[70%]">
                        <span className="font-medium">{notif.name}</span>{" "}
                        requested mentorship.
                      </p>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleAccept(notif)}
                          className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDismiss(notif)}
                          className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Dismiss
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div
          className="relative flex items-center justify-center"
          ref={dropdownRef}
        >
          {mentor?.profile_pic ? (
            <img
              src={mentor.profile_pic}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
          ) : (
            <CgProfile
              color="white"
              size="2rem"
              className="cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
          )}

          {dropdownOpen && (
            <div className="absolute -right-3 top-12 w-45 bg-white shadow-xl overflow-hidden z-10 rounded-lg">
              <ul className="text-black text-md">
                <li
                  onClick={() => navigate("/MentorProfile")}
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                  <MdOutlinePerson size="1.2rem" /> Profile
                </li>
                <li
                  onClick={() => navigate("/ResetPasswordModal")}
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                  <SlLock size="1.2rem" /> Reset Password
                </li>
                <li
                  onClick={() => navigate("/AboutUs")}
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                  <IoIosInformationCircleOutline size="1.2rem" /> About Us
                </li>
                <li
                  onClick={() => setShowLogoutPopup(true)}
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                >
                  <MdLogout size="1.2rem" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-xs bg-white/30">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to log out?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorNavbar;



// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";
// import { CgProfile } from "react-icons/cg";
// import { MdOutlinePerson, MdLogout } from "react-icons/md";
// import { GrArticle } from "react-icons/gr";
// import { IoIosInformationCircleOutline } from "react-icons/io";
// import { IoNotifications } from "react-icons/io5";
// import { SlLock } from "react-icons/sl";
// import { useMentee } from "../context/MenteeContext";
// import { useNavigate } from "react-router-dom";

// function MentorNavbar() {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [showLogoutPopup, setShowLogoutPopup] = useState(false);
//   const [mentor, setMentor] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);

//   const { addMentee } = useMentee();
//   const navigate = useNavigate();
//   const dropdownRef = useRef(null);
//   const notificationRef = useRef(null);

//   const token = localStorage.getItem("token");

//   const handleLogout = () => {
//     setShowLogoutPopup(false);
//     localStorage.removeItem("token"); // Clear token on logout
//     navigate("/");
//   };

//   // const handleAccept = async (notif) => {
//   //   try {
//   //     const response = await axios.post(
//   //       "http://localhost:8000/api/v2/users/mentors/connect/accept",
//   //       { mentorId: mentor._id, menteeId: notif.mentee },
//   //       { headers: { Authorization: `Bearer ${token}` } }
//   //     );

//   //     const updatedMentee = response.data.data.mentee;
//   //     addMentee(updatedMentee);
//   //     setNotifications((prev) => prev.filter((n) => n._id !== notif._id));

//   //     alert("Mentee request accepted successfully");
//   //   } catch (error) {
//   //     console.error("Error accepting mentee:", error);
//   //     alert(error.response?.data?.message || "Failed to accept mentee request");
//   //   }
//   // };

//   const handleAccept = async (notif) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/v2/users/mentors/connect/accept",
//         { mentorId: mentor._id, menteeId: notif.mentee },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Remove from notifications correctly
//       setNotifications((prev) => prev.filter((n) => n.mentee !== notif.mentee));

//       // Refresh connected mentees cleanly
//       const refreshedMentor = await axios.get(
//         `http://localhost:8000/api/v2/users/mentors/${mentor._id}/connected-mentees`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       refreshedMentor.data.data.forEach(addMentee);

//       alert("Mentee request accepted successfully");
//     } catch (error) {
//       console.error("Error accepting mentee:", error);
//       alert(error.response?.data?.message || "Failed to accept mentee request");
//     }
//   };

//   // const handleDismiss = async (mentee) => {
//   //   try {
//   //     const response = await axios.post(
//   //       "http://localhost:8000/api/v2/users/mentors/connect/dismiss",
//   //       { mentorId: mentor._id, menteeId: notif.mentee },
//   //       { headers: { Authorization: `Bearer ${token}` } }
//   //     );
//   //     // setNotifications((prev) => prev.filter((n) => n._id !== mentee._id));
//   //     setNotifications((prev) => prev.filter((n) => n.mentee !== notif.mentee));

//   //     alert("Mentee request dismissed successfully");
//   //   } catch (error) {
//   //     console.error("Error dismissing request:", error);
//   //     alert(
//   //       error.response?.data?.message || "Failed to dismiss mentee request"
//   //     );
//   //   }
//   // };

//   const handleDismiss = async (notif) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/v2/users/mentors/connect/dismiss",
//         { mentorId: mentor._id, menteeId: notif.mentee },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
  
//       // ✅ Refresh notifications cleanly
//       await fetchNotifications();
  
//       alert("Mentee request dismissed successfully");
//     } catch (error) {
//       console.error("Error dismissing request:", error);
//       alert(
//         error.response?.data?.message || "Failed to dismiss mentee request"
//       );
//     }
//   };
  

//   useEffect(() => {
//     const fetchMentorAndNotifications = async () => {
//       try {
//         const mentorRes = await axios.get(
//           "http://localhost:8000/api/v2/users/current-user",
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setMentor(mentorRes.data.user);
//         setNotifications(mentorRes.data.user.connectionRequests || []);
//       } catch (error) {
//         console.error("Error loading notifications:", error);
//       }
//     };

//     fetchMentorAndNotifications();

//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//       if (
//         notificationRef.current &&
//         !notificationRef.current.contains(e.target)
//       ) {
//         setShowNotifications(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [token]);

//   return (
//     <div className="w-full px-5 py-3 flex justify-between items-center bg-[#1E3A8A] relative">
//       <h3 className="text-2xl text-white font-bold">Mentora</h3>

//       <div className="flex gap-10 items-center relative">
//         {/* Blog Icon */}
//         <h4
//           onClick={() => navigate("/BlogPage")}
//           className="text-xl font-semibold cursor-pointer text-white flex items-center justify-center"
//         >
//           <GrArticle size="2rem" />
//         </h4>

//         {/* Notification Bell */}
//         <div
//           className="relative flex items-center justify-center"
//           ref={notificationRef}
//         >
//           <button
//             onClick={() => setShowNotifications(!showNotifications)}
//             className="relative flex items-center cursor-pointer justify-center text-white"
//           >
//             <IoNotifications size="2rem" />
//             {notifications.length > 0 && (
//               <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white rounded-full px-1">
//                 {notifications.length}
//               </span>
//             )}
//           </button>

//           {showNotifications && (
//             <div className="absolute right-0 top-8 w-110 bg-white rounded-lg shadow-lg z-20 p-4">
//               <h2 className="text-lg font-semibold text-gray-800 mb-3">
//                 Notifications
//               </h2>
//               {notifications.length === 0 ? (
//                 <p className="text-gray-500 text-sm">No new notifications</p>
//               ) : (
//                 <ul className="space-y-2">
//                   {notifications.map((notif) => (
//                     <li
//                       key={notif._id}
//                       className="flex items-center justify-between bg-[#f0f4ff] p-3 rounded-md border border-[#d1d5db]"
//                     >
//                       <p className="text-gray-800 text-sm w-[70%]">
//                         <span className="font-medium">{notif.name}</span>{" "}
//                         requested mentorship.
//                       </p>
//                       <div className="flex gap-2 ml-2">
//                         <button
//                           onClick={() => handleAccept(notif)}
//                           className="px-2 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
//                         >
//                           Accept
//                         </button>
//                         <button
//                           onClick={() => handleDismiss(notif)}
//                           className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
//                         >
//                           Dismiss
//                         </button>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Profile Dropdown */}
//         <div
//           className="relative flex items-center justify-center"
//           ref={dropdownRef}
//         >
//           {mentor?.profile_pic ? (
//             <img
//               src={mentor.profile_pic}
//               alt="Profile"
//               className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
//               onClick={() => setDropdownOpen(!dropdownOpen)}
//             />
//           ) : (
//             <CgProfile
//               color="white"
//               size="2rem"
//               className="cursor-pointer"
//               onClick={() => setDropdownOpen(!dropdownOpen)}
//             />
//           )}

//           {dropdownOpen && (
//             <div className="absolute -right-3 top-12 w-45 bg-white shadow-xl overflow-hidden z-10 rounded-lg">
//               <ul className="text-black text-md">
//                 <li
//                   onClick={() => navigate("/MentorProfile")}
//                   className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
//                 >
//                   <MdOutlinePerson size="1.2rem" /> Profile
//                 </li>
//                 <li
//                   onClick={() => navigate("/ResetPasswordModal")}
//                   className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
//                 >
//                   <SlLock size="1.2rem" /> Reset Password
//                 </li>
//                 <li
//                   onClick={() => navigate("/AboutUs")}
//                   className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
//                 >
//                   <IoIosInformationCircleOutline size="1.2rem" /> About Us
//                 </li>
//                 <li
//                   onClick={() => setShowLogoutPopup(true)}
//                   className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
//                 >
//                   <MdLogout size="1.2rem" /> Logout
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Logout Confirmation */}
//       {showLogoutPopup && (
//         <div className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-xs bg-white/30">
//           <div className="bg-white p-6 rounded-lg shadow-lg text-center">
//             <h3 className="text-lg font-semibold mb-4">
//               Are you sure you want to log out?
//             </h3>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={handleLogout}
//                 className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
//               >
//                 Logout
//               </button>
//               <button
//                 onClick={() => setShowLogoutPopup(false)}
//                 className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MentorNavbar;
