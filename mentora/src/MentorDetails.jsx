




import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MentorContext } from "../context/MentorContext";
import { MenteeContext } from "../context/MenteeContext"; // Assuming you have this context for mentee details
import Navbar from "./Navbar";
import { FaLinkedin, FaStar } from "react-icons/fa";
import { BadgeCheck, Send } from "lucide-react";

const MentorDetails = () => {
  const { id } = useParams();
  const { mentors, sendRequest, submitReview, setMentors } = useContext(MentorContext);  // Destructured setMentors from context
  const { mentee } = useContext(MenteeContext); // Get the logged-in mentee's details
  const mentor = mentors.find((m) => m._id === id);
  const [requestSent, setRequestSent] = useState(mentor?.requestSent || false);
  const [requestAccepted, setRequestAccepted] = useState(mentor?.requestAccepted || false);
  const [comment, setComment] = useState("");
  const [currentMentor, setCurrentMentor] = useState(mentor);

useEffect(() => {
  const found = mentors.find((m) => m._id === id);
  if (found) setCurrentMentor(found);
}, [mentors, id]);


  useEffect(() => {
    const updatedMentor = mentors.find((m) => m._id === id);
    if (updatedMentor) {
      setRequestSent(updatedMentor.requestSent);
      setRequestAccepted(updatedMentor.requestAccepted);
    }
  }, [mentors, id]);

  if (!mentor) {
    return (
      <div className="text-center text-red-600 mt-10">Mentor not found</div>
    );
  }

  const handleAddMentor = async () => {
    if (!requestSent && !requestAccepted) {
      try {
        await sendRequest(mentor._id, setRequestSent);
      } catch (error) {
        console.error("Unexpected error sending request:", error);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      // Get mentee details
      const menteeName = mentee?.name || "Anonymous";
      const menteeProfilePic = mentee?.profile_pic || "/default-profile.png"; // Corrected field name

      // Submit the review
      await submitReview(mentor._id, { comment, menteeName, menteeProfilePic });
      setComment("");  // Clear the comment field

      window.location.reload();

      // Update the mentor's reviews after submission
      const updatedMentor = { 
        ...mentor, 
        reviews: [...mentor.reviews, { comment, menteeName, menteeProfilePic }] 
      };

      // Update the mentor state in your context (assuming MentorContext handles this)
      setMentors((prevMentors) =>
        prevMentors.map((m) => (m._id === mentor._id ? updatedMentor : m))
      );
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Top Section: Profile + Details */}
      <div className="max-w-6xl mx-auto mt-10 flex flex-col md:flex-row gap-8">
        {/* Profile Card */}
        <div className="md:w-1/3 bg-white rounded-xl shadow-md p-6 text-center">
          <img
            src={mentor.profile_pic || "/default-profile.png"}
            alt={mentor.name}
            className="w-36 h-36 rounded-full mx-auto border-4 border-blue-200"
          />
          <h2 className="text-2xl font-semibold mt-4">{mentor.fullName}</h2>
          <p className="text-gray-500">
            {mentor.designation || "No title"}{" "}
            {mentor.job_profile?.companyName || "(SCSIT)"}
          </p>

          {/* Dynamic Rating */}
          {mentor.reviews && mentor.reviews.length > 0 ? (
            <div className="flex justify-center items-center mt-2 text-yellow-400">
              {Array.from(
                { length: Math.round(mentor.averageRating || 0) },
                (_, i) => (
                  <FaStar key={i} />
                )
              )}
              <span className="text-sm text-gray-600 ml-2">
                ({mentor.reviews.length} reviews)
              </span>
            </div>
          ) : (
            <p className="text-gray-400 mt-2">No reviews yet</p>
          )}

          <div className="mt-2">
            <p>{mentor.email}</p>
          </div>

          <button
            onClick={handleAddMentor}
            disabled={requestSent || requestAccepted}
            className={`w-full mt-6 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${
              requestAccepted
                ? "bg-[#02164f] text-gray-200 cursor-not-allowed"
                : requestSent
                ? "bg-black text-white cursor-not-allowed"
                : "text-white bg-[#1E3A8A] hover:bg-black"
            }`}
          >
            {requestAccepted ? (
              <>
                Mentor Added <BadgeCheck size={18} className="text-white" />
              </>
            ) : requestSent ? (
              "Request Sent"
            ) : (
              "Add Mentor"
            )}
          </button>

          {/* LinkedIn */}
          {mentor.linkedinURL && (
            <a
              href={mentor.linkedinURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline mt-4 justify-center"
            >
              <FaLinkedin />
              LinkedIn
            </a>
          )}
        </div>

        {/* Details Card */}
        <div className="md:w-2/3 bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ABOUT ME</h3>
            <p className="text-gray-700 mb-2">{mentor.bio || "No bio provided."}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <span>🌍 {mentor.location || "Unknown Location"}</span>
              <span>👤 {mentor.gender || "Not specified"}</span>
              <span>🧑‍💼 {mentor.experience || 0} years of experience</span>
            </div>
          </div>

          {/* Expertise Section */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">SPECIALIZATION</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.specialization?.length > 0 ? (
                mentor.specialization.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Reviews */}
      <div className="max-w-6xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">REVIEWS</h3>

        {/* Review List */}
        {mentor.reviews && mentor.reviews.length > 0 ? (
          <div className="space-y-4">
            {[...mentor.reviews].reverse().map((review, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={review.menteeProfilePic || "/default-profile.png"}  // Mentee's profile pic
                    alt={review.menteeName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      — {review.menteeName || "Anonymous"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}

        {/* Submit Review */}
        {requestAccepted && (
          <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4 flex flex-col gap-2">
            <div className="flex items-center mt-4 bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Add a review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="ml-2 p-2 rounded-full"
              >
                <Send
                  className={`w-5 h-5 ${!comment.trim() ? "text-gray-400" : "text-blue-600"}`}
                />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MentorDetails;
