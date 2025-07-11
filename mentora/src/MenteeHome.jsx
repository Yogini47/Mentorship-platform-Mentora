import React, { useContext } from "react";
import Navbar from "./Navbar";
import Card from "./Card";
import { MentorContext } from "../context/MentorContext";

const MenteeHome = () => {
  const { mentors, loading, error } = useContext(MentorContext); // Updated to use loading and error state

  return (
    // <div className="w-full h-full bg-[#e3f2fd] min-h-screen">
    <div className="w-full h-full bg-gray-50 min-h-screen">
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <Navbar />
      </div>

      {/* Hero Section */}
      <div className="h-150 bg-[#bbdefb] w-full flex gap-4 px-20 py-10">
        <div className="w-3/5 flex flex-col gap-6 justify-center">
          <h1 className="text-6xl font-bold text-[#1E3A8A]">
            Reach your goals faster <br /> with expert mentors
          </h1>
          <h4 className="text-2xl text-[#111827] lg:w-2/3">
            Connecting mentors and mentees to inspire, guide, and unlock
            potential—because growth happens together.
          </h4>
        </div>
        <img
          className="w-2/5 h-130 mt-10 object-contain"
          // src="https://next-cdn.codementor.io/images/landing-pages/tutors/hero-image.png"
          src="https://creatorsofproducts.com/images/people.svg"
          alt="Mentor and Mentee"
        />
      </div>

      {/* Mentors Grid */}
      <div className="px-10 mt-5 flex justify-center items-center flex-wrap gap-10">
        {loading ? (
          <p className="text-gray-600 text-lg">Loading mentors...</p>
        ) : error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : mentors && mentors.length > 0 ? (
          mentors.map((mentor) => <Card key={mentor._id} mentor={mentor} />)
        ) : (
          <p className="text-gray-600 text-lg">No mentors available.</p>
        )}
      </div>
    </div>
  );
};

export default MenteeHome;
