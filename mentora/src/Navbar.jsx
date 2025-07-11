import React, { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { MdOutlinePerson, MdLogout } from "react-icons/md";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { GrArticle } from "react-icons/gr";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { SlLock } from "react-icons/sl";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [mentor, setMentor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allMentors, setAllMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Logout successful:", response.data); // ✅ See this in console
      localStorage.removeItem("token");
      setShowLogoutPopup(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v2/users/current-user",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMentor(response.data.user);
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
      }
    };

    const fetchAllMentors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v2/users/mentors/all"
        );
        setAllMentors(response.data.mentors || []);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      }
    };

    fetchMentor();
    fetchAllMentors();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMentors([]);
      setShowSearchDropdown(false);
      return;
    }

    const filtered = allMentors.filter(
      (mentor) =>
        mentor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.specialization?.some((spec) =>
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    setFilteredMentors(filtered);
    setShowSearchDropdown(true);
  }, [searchTerm, allMentors]);

  return (
    <div className="w-full px-5 py-3 flex justify-between items-center bg-[#1E3A8A] relative">
      <h3 className="text-2xl text-white font-bold">Mentora</h3>

      <div className="search-bar relative flex flex-col items-start">
        <div className="flex gap-3 bg-white w-96 h-10 items-center rounded-full pl-3 border border-[#0148aa]">
          <img
            src="https://dashboard.codeparrot.ai/api/image/Z8lsT6wi-41-yX7X/search-i.png"
            alt="search"
            className="w-5 h-5"
          />
          <input
            type="text"
            placeholder="Search by name or specialization"
            className="outline-none w-full h-full bg-transparent pr-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showSearchDropdown && (
          <div className="absolute top-12 w-96 bg-white max-h-60 overflow-y-auto shadow-lg rounded-lg z-20">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor) => (
                <div
                  key={mentor._id}
                  onClick={() => {
                    navigate(`/mentor/${mentor._id}`);
                    setSearchTerm("");
                    setShowSearchDropdown(false);
                  }}
                  className="p-3 hover:bg-gray-200 cursor-pointer flex"
                >
                  <img
                    src={mentor.profile_pic}
                    alt={mentor.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">{mentor.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {mentor.specialization?.join(", ")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-700">
                No results for your search. Maybe try a different name or area
                of expertise?
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-10 items-center relative">
        <h4
          onClick={() => navigate("/BlogPage")}
          className="text-xl font-semibold cursor-pointer text-white"
        >
          <GrArticle size="2rem" />
        </h4>
        <h4
          onClick={() => navigate("/MenteeChat")}
          className="text-xl font-semibold cursor-pointer text-white"
        >
          <IoChatbubbleEllipsesOutline size="2rem" />
        </h4>

        <div className="relative">
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
            <div className="absolute -right-3 mt-4 w-45 bg-white shadow-xl overflow-hidden z-10 rounded-lg">
              <ul className="text-black text-md">
                <li
                  onClick={() => navigate("/MenteeProfile")}
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
                  className="px-4 py-2 flex items-center gap-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setShowLogoutPopup(true)}
                >
                  <MdLogout size="1.2rem" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showLogoutPopup && (
        <div className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-xs bg-white/30 z-50">
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

export default Navbar;
