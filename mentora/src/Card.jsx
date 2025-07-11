import { useState, useContext, useEffect } from "react";
import { MentorContext } from "../context/MentorContext";
import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

const Card = ({ mentor }) => {
  const maxSpecializations = 2;
  const [requestSent, setRequestSent] = useState(mentor.requestSent || false);
  const [requestAccepted, setRequestAccepted] = useState(mentor.requestAccepted || false);
  const navigate = useNavigate();
  const { sendRequest } = useContext(MentorContext);

  const specializationList = Array.isArray(mentor.specialization)
    ? mentor.specialization
    : [];
  const visibleSpecializations = specializationList.slice(0, maxSpecializations);
  const remainingCount = specializationList.length - maxSpecializations;

  const handleAddMentor = async (event) => {
    event.stopPropagation();
    if (!requestSent && !requestAccepted) {
      try {
        await sendRequest(mentor._id, setRequestSent);
      } catch (error) {
        console.error("Unexpected error sending request:", error);
      }
    }
  };

  return (
    <div
      onClick={() => navigate(`/mentor/${mentor._id}`)}
      className="w-70 rounded-lg shadow-lg flex items-center justify-center gap-20 bg-white flex-wrap mt-5 mb-5 cursor-pointer border-2 border-gray-300 hover:border-black"
    >
      <div className="w-72 h-[385px] p-4 rounded-lg bg-white text-center flex flex-col justify-between">
        <div>
          <img
            src={mentor.profile_pic}
            alt={mentor.fullName}
            className="w-30 h-30 rounded-full mx-auto mb-4 border-3 border-blue-300"
          />
          <h3 className="text-lg font-semibold">{mentor.fullName}</h3>
          <p className="text-sm font-semibold text-gray-600">{mentor.designation || "Mentor"}</p>
        </div>

        <div className="mt-2 min-h-[90px] flex-col">
          <p className="text-sm font-medium">Specialization</p>
          <div className="flex px-2 py-1 justify-center gap-2 mt-2 flex-wrap">
            {visibleSpecializations.map((spec, index) => (
              <span
                key={index}
                className="px-4 py-1 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white rounded-full text-xs whitespace-nowrap"
              >
                {spec}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-1 bg-gray-500 text-white rounded-full text-xs">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-4 justify-between items-center">
          <p className="w-1/3 text-sm text-gray-500 bg-blue-200 py-2 rounded-lg">Ratings</p>
          {/* <button
            onClick={handleAddMentor}
            disabled={requestSent || requestAccepted}
            className={`w-2/3 text-sm py-2 rounded-lg transition-all ${
              requestAccepted 
                ? "bg-black text-white cursor-not-allowed"
                : requestSent
                ? "bg-black text-white cursor-not-allowed"
                : "text-white bg-[#1E3A8A] hover:bg-black"
            }`}
          >
            {requestAccepted ? "Request Accepted" : requestSent ? "Request Sent" : "Add Mentor"}
          </button> */}
          <button
  onClick={handleAddMentor}
  disabled={requestSent || requestAccepted}
  className={`w-2/3 text-sm py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
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
        </div>
      </div>
    </div>
  );
};

export default Card;
