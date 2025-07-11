import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const GEOAPIFY_API_KEY = "af06f0cac97c48bcb3636602fbe7d235"; // Replace with your actual key

const MenteeSignup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  const [profilePic, setProfilePic] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePic(file);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setLocationInput(query);
    setSelectedLocation("");
    clearErrors("location");

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
    setSelectedLocation(loc);
    setLocationInput(loc);
    setLocationSuggestions([]);
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      setError("location", {
        type: "manual",
        message: "Please select a location from the dropdown.",
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("gender", data.gender);
      formData.append("location", selectedLocation);
      formData.append("goals", data.goals);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      formData.append("education[college_name]", data.college_name);
      formData.append("education[year]", data.year);
      formData.append("education[course_name]", data.course_name);
      if (profilePic) {
        formData.append("profile_pic", profilePic);
      }

      const response = await axios.post(
        "http://localhost:8000/api/v2/users/register/mentee",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log(response.data);

      setShowSuccessPopup(true);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="w-screen flex justify-center -mt-3 items-center min-h-screen bg-cover bg-[url(./components/cover16.jpg)] relative">
      <div className="max-w-lg bg-white/30 p-6 rounded-lg drop-shadow-md border-3 border-[#1E3A8A]">
        <h2 className="text-2xl font-bold mb-4 text-[#1E3A8A]">
          Mentee Sign Up
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <label>Full Name</label>
              <input
                {...register("name", { required: "Full Name is required" })}
                className="w-full p-2 border rounded"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}

              <label>Email</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full p-2 border rounded"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}

              <label>Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded
               file:mr-4 file:py-1 file:px-2 
             file:rounded-lg file:border-0 
             file:text-white file:bg-[#1E3A8A]"
                onChange={handleFileChange}
              />

              <label>Gender</label>
              <select
                {...register("gender", { required: "Gender is required" })}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm">{errors.gender.message}</p>
              )}

<button
                type="button"
                onClick={handleNext}
                className="relative overflow-hidden group w-full font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
              >
                <span className="relative z-10">Next</span>
                <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
              </button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <a href="/LoginPage" className="text-[#1E3A8A] hover:underline">
                  Login
                </a>
                .
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <label>Location</label>
              <input
                type="text"
                value={locationInput}
                onChange={handleLocationChange}
                placeholder="Start typing your location..."
                className="w-full p-2 border rounded"
              />
              {errors.location && (
                <p className="text-red-500 text-sm">
                  {errors.location.message}
                </p>
              )}
              {locationSuggestions.length > 0 && (
                <ul className="bg-white border rounded mt-1 max-h-40 overflow-y-auto z-10 relative">
                  {locationSuggestions.map((loc, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectLocation(loc)}
                    >
                      {loc}
                    </li>
                  ))}
                </ul>
              )}

              <label>Your Goals</label>
              <textarea
                {...register("goals", {
                  required: "Please describe your goals",
                })}
                placeholder="Tell us about your career goals, expectations, etc."
                className="w-full p-2 border rounded h-20 resize-none"
              />
              {errors.goals && (
                <p className="text-red-500 text-sm">{errors.goals.message}</p>
              )}

              <label>College Name</label>
              <input
                {...register("college_name", {
                  required: "College name is required",
                })}
                className="w-full p-2 border rounded"
              />
              {errors.college_name && (
                <p className="text-red-500 text-sm">
                  {errors.college_name.message}
                </p>
              )}

              <div className="flex justify-between gap-4">
              <button
                  type="button"
                  onClick={handleBack}
                  className="relative overflow-hidden group w-1/2 font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-white py-2 rounded-lg"
                >
                  <span className="relative z-10">Back</span>
                  <span className="absolute inset-0 bg-black transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="relative overflow-hidden group w-1/2 font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
                >
                  <span className="relative z-10">Next</span>
                  <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label>Course Name</label>
              <input
                {...register("course_name", {
                  required: "Course name is required",
                })}
                className="w-full p-2 border rounded"
              />
              {errors.course_name && (
                <p className="text-red-500 text-sm">
                  {errors.course_name.message}
                </p>
              )}
              <label>Year of Completion</label>
              <input
                type="number"
                {...register("year", { required: "Year is required" })}
                className="w-full p-2 border rounded"
              />
              {errors.year && (
                <p className="text-red-500 text-sm">{errors.year.message}</p>
              )}

              <label>Password</label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full p-2 border rounded pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              <label>Confirm Password</label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                  className="w-full p-2 border rounded pr-10"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}

              <div className="flex justify-between gap-4">
                {/* <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/2 p-2 bg-gray-800 text-white rounded"
                >
                  Back
                </button> */}
                 <button
                  type="button"
                  onClick={handleBack}
                  className="relative overflow-hidden group w-1/2 font-semibold bg-gradient-to-r from-gray-800 to-gray-600 text-white py-2 rounded-lg"
                >
                  <span className="relative z-10">Back</span>
                  <span className="absolute inset-0 bg-black transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
                </button>
                {/* <button
                  type="submit"
                  className="w-1/2 p-2 bg-[#7760ED] text-white rounded"
                >
                  Sign Up
                </button> */}
                <button
                  type="submit"
                  className="relative overflow-hidden group w-1/2 font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
                >
                  <span className="relative z-10">Sign Up</span>
                  <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {/* ✅ Success Popup */}
      {showSuccessPopup && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              Mentee registered successfully!
            </h3>
            <p className="mb-4">You may now log in to your account.</p>
            <Link
              to="/LoginPage"
              className="text-white bg-[#7760ED] px-4 py-2 rounded inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>



      )}
    </div>
  );
};

export default MenteeSignup;
