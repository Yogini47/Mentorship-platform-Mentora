

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useMentee } from "./MenteeContext";

export const MentorContext = createContext();

export const MentorProvider = ({ children }) => {
  const { addMentee } = useMentee();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem("token");
        const menteeId = localStorage.getItem("menteeId");

        if (!token) {
          setLoading(false);
          setError("User not authenticated.");
          return;
        }

        // Get all mentors
        const response = await axios.get("http://localhost:8000/api/v2/users/mentors/all", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (!menteeId) {
          // No mentee ID? Return mentors as-is (for fallback)
          setMentors(response.data.mentors || []);
          setLoading(false);
          return;
        }

        // Get mentee's data including pending and accepted requests
        const menteeRes = await axios.get(
          `http://localhost:8000/api/v2/users/mentees/${menteeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const pendingRequests = menteeRes.data?.data?.pendingRequests || [];
        const acceptedRequests = menteeRes.data?.data?.acceptedRequests || [];

        // Tag each mentor with appropriate status
        const mentorsWithRequestStatus = response.data.mentors.map((mentor) => ({
          ...mentor,
          requestSent: pendingRequests.includes(mentor._id),
          requestAccepted: acceptedRequests.includes(mentor._id),
        }));

        setMentors(mentorsWithRequestStatus);
      } catch (err) {
        console.error("Error fetching mentors:", err);
        setError("Failed to fetch mentors.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // ✅ Send connection request from mentee to mentor
  const sendRequest = async (mentorId, setRequestSent) => {
    try {
      const token = localStorage.getItem("token");
      const menteeId = localStorage.getItem("menteeId");

      if (!token || !menteeId) {
        setError("Missing token or mentee ID.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/v2/users/mentees/connect",
        { mentorId, menteeId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.message) {
        console.log(response.data.message);
        setRequestSent(true);
      }
    } catch (err) {
      console.error("Error sending request:", err);
      if (err?.response?.data?.message === "Request already sent") {
        setRequestSent(true);
      } else {
        setError("Failed to send request.");
      }
    }
  };


  const acceptMentee = async (mentorId, menteeId) => {
    
    console.log("acceptMentee called with:");
    console.log("mentorId:", mentorId);
    console.log("menteeId:", menteeId);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Missing token.");
        return;
      }
  
      const response = await axios.post(
        "http://localhost:8000/api/v2/users/mentor/accept-mentee",
        { mentorId, menteeId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const updatedConnectedMentees = response.data.data.mentor.connectedMentees;
  
      // ✅ Update mentors state with fresh connectedMentees from backend
      setMentors((prev) =>
        prev.map((mentor) =>
          mentor._id === mentorId
            ? { ...mentor, connectedMentees: updatedConnectedMentees }
            : mentor
        )
      );
  
      console.log(response.data.message);
    } catch (err) {
      console.error("Error accepting mentee:", err);
      setError("Failed to accept mentee.");
    }
  };
  

  // ✅ Add mentor (admin/testing usage)
  const addMentor = async (newMentor) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v2/users/mentors/register",
        newMentor
      );
      if (response.data?.data) {
        setMentors((prev) => [...prev, response.data.data]);
      } else {
        setError("Failed to add mentor.");
      }
    } catch (err) {
      console.error("Error adding mentor:", err);
      setError("Failed to add mentor.");
    }
  };

  // ✅ Submit a review for a mentor
  const submitReview = async (mentorId, reviewData) => {
    const token = localStorage.getItem("token");
    const menteeId = localStorage.getItem("menteeId");
  
    if (!token || !menteeId) {
      throw new Error("User is not authenticated or menteeId is missing");
    }
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  
    try {
      // Log the reviewData before submitting
      console.log("Review data: ", reviewData);
      console.log("Submitting review with the following data: ", { mentorId, reviewData, menteeId });
  
      // Add the menteeId to the review data
      const dataToSend = {
        ...reviewData,
        menteeId,  // Include the mentee ID
      };
  
      const response = await axios.post(
        `http://localhost:8000/api/v2/users/mentors/${mentorId}/reviews`,
        dataToSend,
        config
      );
  
      console.log("Review submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting review:", error.response ? error.response.data : error.message);
      throw error;
    }
  };
  
  

  return (
    <MentorContext.Provider
      value={{
        mentors,
        loading,
        error,
        acceptMentee,
        addMentor,
        setMentors,
        sendRequest,
        submitReview, // Add submitReview to context
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};

export const useMentorContext = () => useContext(MentorContext);

