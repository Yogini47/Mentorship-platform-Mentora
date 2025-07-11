import { Mentor } from "../models/mentor.model.js";
import { Rating } from "../models/rating.model.js";
import { Mentee } from "../models/mentee.model.js";
import mongoose from "mongoose";

// Get all mentors with filters
export const getAllMentors = async (req, res) => {
  const { skills, experience, location } = req.query;
  const query = {};

  if (skills) {
    const skillArray = skills
      .split(",")
      .map((skill) => new RegExp(skill.trim(), "i"));
    query.specialization = { $in: skillArray };
  }
  if (experience)
    query["job_profile.experience"] = { $gte: Number(experience) };
  if (location) query.location = location;

  try {
    const mentors = await Mentor.find(query).select("-password -refreshToken");
    res.status(200).json({ success: true, data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get mentor by ID with reviews
export const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate("mentees");

    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }

    // Fetch reviews separately and attach them to the mentor object
    const reviews = await Rating.find({ mentor: mentor._id });

    res.status(200).json({
      success: true,
      data: { ...mentor.toObject(), reviews }, // Manually merge reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//get all mentors registered
export const getAllRegisteredMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({})
      .select("-password -refreshToken") // Hide sensitive fields
      .sort({ createdAt: -1 }); // Optional: newest first

    res.status(200).json({
      message: "Mentors fetched successfully",
      total: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Error fetching mentors:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Become a mentor (Upgrade Mentee to Mentor)
export const becomeMentor = async (req, res) => {
  const { menteeId, bio, specialization, pricing, availability, job_profile } =
    req.body;
  try {
    const mentee = await Mentee.findById(menteeId);
    if (!mentee)
      return res
        .status(404)
        .json({ success: false, message: "Mentee not found" });

    const newMentor = new Mentor({
      name: mentee.name,
      email: mentee.email,
      password: mentee.password,
      bio,
      specialization,
      pricing,
      availability,
      job_profile,
      profile_pic: mentee.profile_pic,
      gender: mentee.gender,
    });
    await newMentor.save();

    res.status(201).json({
      success: true,
      message: "Successfully upgraded to Mentor",
      data: newMentor,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// Update Mentor Details
// export const updateMentorDetails = async (req, res) => {
//     const mentorId = req.user._id;
//     let updates = req.body;

//     try {
//         // Prevent updating restricted fields
//         const restrictedFields = ["_id", "password", "refreshToken"];
//         restrictedFields.forEach(field => delete updates[field]);

//         // Handle nested object updates properly (like job_profile)
//         if (updates.job_profile) {
//             updates["job_profile.title"] = updates.job_profile.title;
//             updates["job_profile.companyName"] = updates.job_profile.companyName;
//             updates["job_profile.experience"] = updates.job_profile.experience;
//             delete updates.job_profile; // Remove original object
//         }

//         // Perform update
//         const updatedMentor = await Mentor.findByIdAndUpdate(
//             mentorId,
//             { $set: updates },
//             { new: true, runValidators: true }
//         ).select("-password -refreshToken");

//         if (!updatedMentor) {
//             return res.status(404).json({ success: false, message: "Mentor not found" });
//         }

//         res.status(200).json({ success: true, message: "Mentor details updated successfully", data: updatedMentor });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

export const addMentorFeedback = async (req, res) => {
  const { mentorId } = req.params;
  const { comment, menteeId } = req.body;

  if (!mentorId || !comment || !menteeId) {
    return res.status(400).json({ message: 'Mentor ID, comment, and mentee ID are required' });
  }

  try {
    const mentor = await Mentor.findById(mentorId);
    const mentee = await Mentee.findById(menteeId);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    if (!mentee) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // ✅ Add mentee ObjectId too
    mentor.reviews.push({
      mentee: mentee._id,  // 👈 You missed this
      menteeName: mentee.name,  // NOTE: mentee.fullName, not mentee.name
      menteeProfilePic: mentee.profile_pic || '/default-profile.png',
      comment,
    });

    await mentor.save();

    res.status(201).json({ message: 'Review submitted successfully', updatedMentor: mentor });  // ✅ Return updated mentor if you want
  } catch (error) {
    console.error('Error adding mentor feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// get mentor reviews

export const getMentorReviews = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).select("reviews");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Return the reviews with mentee's name and profile picture
    const reviewsWithMenteeInfo = mentor.reviews.map(review => ({
      comment: review.comment,
      menteeName: review.menteeName,  // mentee's name
      menteeProfilePic: review.menteeProfilePic  // mentee's profile picture
    }));

    res.status(200).json(reviewsWithMenteeInfo);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// export const acceptConnectionRequest = async (req, res) => {
//   const { mentorId, menteeId } = req.body;

//   console.log("mentorId received:", mentorId);
// console.log("menteeId received:", menteeId);

//   try {
//     const mentor = await Mentor.findById(mentorId);
//     const mentee = await Mentee.findById(menteeId);

//     if (!mentor || !mentee) {
//       return res.status(404).json({ message: "Mentor or mentee not found" });
//     }

//     // Prevent duplicate connection
//     if (mentor.connectedMentees.includes(menteeId)) {
//       return res.status(400).json({ message: "Mentee already connected" });
//     }

//     // Update mentor and mentee
//     mentor.connectedMentees.push(menteeId);
//     mentor.connectionRequests = mentor.connectionRequests.filter(
//       (id) => id.toString() !== menteeId
//     );

//     mentee.acceptedRequests.push(mentorId);
//     mentee.pendingRequests = mentee.pendingRequests.filter(
//       (id) => id.toString() !== mentorId
//     );
//     mentee.mentor = mentorId;

//     await mentor.save();
//     await mentee.save();

//     // Populate connectionRequests and connectedMentees with name/email/pic
//     // const updatedMentor = await Mentor.findById(mentorId)
//     //   .populate("connectionRequests", "name email profile_pic")
//     //   .populate("connectedMentees", "name email profile_pic");

//     const updatedMentor = await Mentor.findById(mentorId);

// await updatedMentor.populate([
//   { path: "connectionRequests.mentee", select: "name email profile_pic" },
//   { path: "connectedMentees", select: "name email profile_pic bio location" }
// ]);


//     const updatedMentee = await Mentee.findById(menteeId).populate(
//       "mentor",
//       "name email profile_pic"
//     );

//     res.status(200).json({
//       message: "Mentee connected successfully",
//       data: {
//         mentor: {
//           connectionRequests: updatedMentor.connectionRequests,
//           connectedMentees: updatedMentor.connectedMentees,
//         },
//         mentee: {
//           acceptedRequests: updatedMentee.acceptedRequests,
//           pendingRequests: updatedMentee.pendingRequests,
//           mentor: updatedMentee.mentor,
//         },
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };


export const acceptConnectionRequest = async (req, res) => {
  const { mentorId, menteeId } = req.body;

  try {
    const mentor = await Mentor.findById(mentorId);
    const mentee = await Mentee.findById(menteeId);

    if (!mentor || !mentee) {
      return res.status(404).json({ message: "Mentor or mentee not found" });
    }

    if (mentor.connectedMentees.includes(menteeId)) {
      return res.status(400).json({ message: "Mentee already connected" });
    }

    mentor.connectedMentees.push(menteeId);

    // ✅ FIXED FILTER HERE
    mentor.connectionRequests = mentor.connectionRequests.filter(
      (req) => req.mentee.toString() !== menteeId
    );

    mentee.acceptedRequests.push(mentorId);
    mentee.pendingRequests = mentee.pendingRequests.filter(
      (id) => id.toString() !== mentorId
    );
    mentee.mentor = mentorId;

    await mentor.save();
    await mentee.save();

    const updatedMentor = await Mentor.findById(mentorId);
    await updatedMentor.populate([
      { path: "connectionRequests.mentee", select: "name email profile_pic" },
      { path: "connectedMentees", select: "name email profile_pic bio location" }
    ]);

    const updatedMentee = await Mentee.findById(menteeId).populate(
      "mentor",
      "name email profile_pic"
    );

    res.status(200).json({
      message: "Mentee connected successfully",
      data: {
        mentor: {
          connectionRequests: updatedMentor.connectionRequests,
          connectedMentees: updatedMentor.connectedMentees,
        },
        mentee: {
          acceptedRequests: updatedMentee.acceptedRequests,
          pendingRequests: updatedMentee.pendingRequests,
          mentor: updatedMentee.mentor,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




export const getConnectedMentees = async (req, res) => {
  const { mentorId } = req.params;

  try {
    // Validate mentorId
    if (!mentorId || !mongoose.Types.ObjectId.isValid(mentorId)) {
      console.error('Invalid mentorId:', mentorId);
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID provided"
      });
    }

    console.log('Fetching connected mentees for mentor:', mentorId);

    const mentor = await Mentor.findById(mentorId)
      .populate({
        path: 'connectedMentees',
        select: 'name email profile_pic bio skills location'
      });

    if (!mentor) {
      console.error('Mentor not found:', mentorId);
      return res.status(404).json({
        success: false,
        message: "Mentor not found"
      });
    }

    // Check if connectedMentees array exists
    if (!mentor.connectedMentees) {
      console.log('No connected mentees array found for mentor:', mentorId);
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    console.log('Found connected mentees:', mentor.connectedMentees.length);

    return res.status(200).json({
      success: true,
      data: mentor.connectedMentees,
      count: mentor.connectedMentees.length
    });

  } catch (error) {
    console.error('Error fetching connected mentees:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching connected mentees",
      error: error.message
    });
  }
};

// export const dismissConnectionRequest = async (req, res) => {
//   const { mentorId, menteeId } = req.body;



//   try {
//     console.log('Dismissing connection request:', { mentorId, menteeId });

//     const mentor = await Mentor.findById(mentorId);
//     const mentee = await Mentee.findById(menteeId);

//     if (!mentor) {
//       console.error('Mentor not found:', mentorId);
//       return res.status(404).json({ message: "Mentor not found" });
//     }
//     if (!mentee) {
//       console.error('Mentee not found:', menteeId);
//       return res.status(404).json({ message: "Mentee not found" });
//     }

//     // Log initial state
//     console.log('Initial state:', {
//       mentor: {
//         connectionRequests: mentor.connectionRequests,
//         connectedMentees: mentor.connectedMentees
//       },
//       mentee: {
//         pendingRequests: mentee.pendingRequests,
//         acceptedRequests: mentee.acceptedRequests,
//         mentor: mentee.mentor
//       }
//     });

//     // Initialize arrays if they don't exist
//     if (!mentor.connectionRequests) mentor.connectionRequests = [];
//     if (!mentee.pendingRequests) mentee.pendingRequests = [];
//     if (!mentee.acceptedRequests) mentee.acceptedRequests = [];

//     // Remove from mentor's connection requests
//     mentor.connectionRequests = mentor.connectionRequests.filter(
//       (id) => id.toString() !== menteeId
//     );

//     // Remove from mentee's pending requests
//     mentee.pendingRequests = mentee.pendingRequests.filter(
//       (id) => id.toString() !== mentorId
//     );

//     // Remove from mentee's accepted requests
//     mentee.acceptedRequests = mentee.acceptedRequests.filter(
//       (id) => id.toString() !== mentorId
//     );

//     // If this was the mentee's current mentor, clear the mentor field
//     if (mentee.mentor?.toString() === mentorId) {
//       mentee.mentor = null;
//     }

//     // Log state before save
//     console.log('State before save:', {
//       mentor: {
//         connectionRequests: mentor.connectionRequests,
//         connectedMentees: mentor.connectedMentees
//       },
//       mentee: {
//         pendingRequests: mentee.pendingRequests,
//         acceptedRequests: mentee.acceptedRequests,
//         mentor: mentee.mentor
//       }
//     });

//     // Save changes
//     await mentor.save();
//     await mentee.save();

//     // Log state after save
//     console.log('State after save:', {
//       mentor: {
//         connectionRequests: mentor.connectionRequests,
//         connectedMentees: mentor.connectedMentees
//       },
//       mentee: {
//         pendingRequests: mentee.pendingRequests,
//         acceptedRequests: mentee.acceptedRequests,
//         mentor: mentee.mentor
//       }
//     });

//     res.status(200).json({
//       message: "Request dismissed successfully",
//       data: {
//         mentor: {
//           connectionRequests: mentor.connectionRequests,
//           connectedMentees: mentor.connectedMentees
//         },
//         mentee: {
//           pendingRequests: mentee.pendingRequests,
//           acceptedRequests: mentee.acceptedRequests,
//           mentor: mentee.mentor
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error in dismissConnectionRequest:', error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//       stack: error.stack
//     });
//   }
// };

export const dismissConnectionRequest = async (req, res) => {
  const { mentorId, menteeId } = req.body;

  try {
    const mentor = await Mentor.findById(mentorId);
    const mentee = await Mentee.findById(menteeId);

    if (!mentor || !mentee) {
      return res.status(404).json({ message: "Mentor or mentee not found" });
    }

    // ✅ Remove mentee from mentor's connectionRequests (correct way)
    mentor.connectionRequests = mentor.connectionRequests.filter(
      (req) => req.mentee.toString() !== menteeId
    );

    // ✅ Remove mentor from mentee's pendingRequests
    mentee.pendingRequests = mentee.pendingRequests.filter(
      (id) => id.toString() !== mentorId
    );

    await mentor.save();
    await mentee.save();

    const updatedMentor = await Mentor.findById(mentorId);
    await updatedMentor.populate([
      { path: "connectionRequests.mentee", select: "name email profile_pic" },
      { path: "connectedMentees", select: "name email profile_pic bio location" }
    ]);

    res.status(200).json({
      message: "Mentee request dismissed successfully",
      data: {
        mentor: {
          connectionRequests: updatedMentor.connectionRequests,
          connectedMentees: updatedMentor.connectedMentees,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
