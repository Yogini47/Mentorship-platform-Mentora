
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorSignup from "./MentorSignup";
import MenteeSignup from "./MenteeSignup";

const SignupPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mentor"); // Track active tab

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    // Only navigate if you want to change the route
    // navigate(tab === "mentor" ? "/MentorSignup" : "/MenteeSignup");
  };

  return (
    <div className="w-screen flex flex-col items-center justify-center h-screen bg-[#bbdefb]">
      {/* Navigation Bar */}
      <nav className="p-1 pt-15 bg-[#bbdefb] text-center">
        <button
          className={`mx-10 text-[#1E3A8A] ${
            activeTab === "mentor" ? "border-b-2 border-[#1E3A8A]" : ""
          }`}
          onClick={() => handleNavigation("mentor")}
          aria-pressed={activeTab === "mentor"}
        >
          Mentor Sign Up
        </button>
        <button
          className={`mx-10 text-[#1E3A8A] ${
            activeTab === "mentee" ? "border-b-2 border-[#1E3A8A]" : ""
          }`}
          onClick={() => handleNavigation("mentee")}
          aria-pressed={activeTab === "mentee"}
        >
          Mentee Sign Up
        </button>
      </nav>

      {/* Render Forms Based on Active Tab */}
      <div className="mt-6">{activeTab === "mentor" ? <MentorSignup /> : <MenteeSignup />}</div>

    
    </div>
  );
};

export default SignupPage;











    