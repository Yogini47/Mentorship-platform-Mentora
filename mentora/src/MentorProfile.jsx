import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MentorNavbar from "./MentorNavbar";
import axios from "axios";

const GEOAPIFY_API_KEY = "af06f0cac97c48bcb3636602fbe7d235";

const MentorProfile = () => {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profile_pic: "",
    bio: "",
    designation: "",
    contact: "",
    experience: "",
    specialization: [],
    location: "",
  });

  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);

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

        setFormData({
          profile_pic: response.data.user.profile_pic || "",
          bio: response.data.user.bio || "",
          designation: response.data.user.designation || "",
          contact: response.data.user.contact || "",
          experience: response.data.user.experience || "",
          specialization: response.data.user.specialization || [],
          location: response.data.user.location || "",
        });

        setLocationInput(response.data.user.location || "");
        
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
      }
    };
    fetchMentor();
  }, []);

  const handleEditClick = () => setIsEditing(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecializationChange = (e) => {
    setFormData({ ...formData, specialization: e.target.value.split(",") });
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
      const res = await axios.get(
        "https://api.geoapify.com/v1/geocode/autocomplete",
        {
          params: {
            text: query,
            apiKey: GEOAPIFY_API_KEY,
            limit: 5,
            lang: "en",
          },
        }
      );

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
      const response = await axios.patch(
        "http://localhost:8000/api/v2/users/update-Mentor",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMentor((prevMentor) => ({
        ...prevMentor,
        ...formData,
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating mentor profile:", error);
    }
  };

  if (!mentor) return <div>Loading...</div>;

  return (
    <div className="bg-[#B0C4DE] min-h-screen">
      <MentorNavbar />
      <div className="w-screen flex justify-center mt-10">
        <div className="w-7xl bg-gray-100 p-6 shadow-md rounded-lg border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Profile</h2>

          <div className="flex items-start mb-6">
            <img
              src={mentor.profile_pic || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 rounded-full mr-6 object-cover aspect-square"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {mentor.fullName || "No name available"}
              </h3>

              {isEditing ? (
                <input
                  type="text"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="text-md border rounded-md px-2 py-1 mt-2 w-4xl"
                  autoFocus
                />
              ) : (
                <p className="text-md text-gray-700 border rounded-md px-1 mt-2 max-w-4xl">
                  {mentor.bio || "No bio available"}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end mb-4">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-2 py-1 rounded-lg shadow-md hover:bg-green-600 transition"
              >
                Save
              </button>
            ) : (
              <button
                onClick={handleEditClick}
                className="bg-blue-500 text-white px-2 py-1 rounded-lg shadow-md hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          <hr className="border-t-2 border-gray-400 my-4" />

          <div className="grid grid-cols-2 gap-x-10 gap-y-4">
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
                <span className="text-lg">{mentor.location || "N/A"}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-semibold">Email:</span>
              <span className="text-lg">{mentor.email || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Gender:</span>
              <span className="text-lg">
                {mentor.gender || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Designation:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="border rounded-md px-2 py-1"
                />
              ) : (
                <span className="text-lg">{mentor.designation || "N/A"}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Experience:</span>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="border rounded-md px-2 py-1"
                />
              ) : (
                <span className="text-lg">
                  {mentor.experience ? `${mentor.experience} years` : "N/A"}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Contact:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="border rounded-md px-2 py-1"
                />
              ) : (
                <span className="text-lg">{mentor.contact || "N/A"}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Specializations:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization.join(",")}
                  onChange={handleSpecializationChange}
                  className="border rounded-md px-2 py-1"
                />
              ) : (
                <ul className="list-disc list-inside">
                  {mentor.specialization &&
                  Array.isArray(mentor.specialization) ? (
                    mentor.specialization.map((spec, index) => (
                      <li key={index}>{spec.replace(/[\[\]"']/g, "")}</li>
                    ))
                  ) : (
                    <li>No specializations added</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
