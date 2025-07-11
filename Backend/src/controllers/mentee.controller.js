import { Mentee } from "../models/mentee.model.js";
import { Mentor } from "../models/mentor.model.js";
import mongoose from "mongoose";

/**
 * @desc   Get all mentees
 * @route  GET /api/mentees
 * @access Public
 */
export const getAllMentees = async (req, res) => {
  try {
    const mentees = await Mentee.find().select("-password -refreshToken");
    res.status(200).json({ success: true, data: mentees });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @desc   Get mentee by ID
 * @route  GET /api/mentees/:id
 * @access Public
 */
export const getMenteeById = async (req, res) => {
  try {
    const { id } = req.params;
       // Check if the ID is a valid MongoDB ObjectId
       if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid mentee ID" });
      }
    const mentee = await Mentee.findById(id).select("-password -refreshToken");

    if (!mentee) {
      return res
        .status(404)
        .json({ success: false, message: "Mentee not found" });
    }

    res.status(200).json({ success: true, data: mentee });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @desc   Update mentee details
 * @route  PUT /api/mentees/:id
 * @access Private (Only the mentee can update their profile)
 */
// export const updateMenteeDetails = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const menteeId = req.user.id; // Assuming `req.user` is populated via authentication middleware

//         if (id !== menteeId) {
//             return res.status(403).json({ success: false, message: "Unauthorized to update this profile" });
//         }

//         const updatedMentee = await Mentee.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).select("-password -refreshToken");

//         if (!updatedMentee) {
//             return res.status(404).json({ success: false, message: "Mentee not found" });
//         }

//         res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedMentee });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };

/**
 * @desc   Delete mentee account
 * @route  DELETE /api/mentees/:id
 * @access Private (Only the mentee can delete their account)
 */
export const deleteMenteeAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const menteeId = req.user.id; // Assuming `req.user` is populated via authentication middleware

    if (id !== menteeId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to delete this account",
        });
    }

    const deletedMentee = await Mentee.findByIdAndDelete(id);

    if (!deletedMentee) {
      return res
        .status(404)
        .json({ success: false, message: "Mentee not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// export const sendConnectionRequest = async (req, res) => {
//   const { menteeId, mentorId } = req.body;

//   try {
//     const mentor = await Mentor.findById(mentorId);
//     const mentee = await Mentee.findById(menteeId);
//     if (!mentor || !mentee)
//       return res.status(404).json({ message: "User not found" });

//      // Avoid duplicates
//      const alreadySent = mentor.connectionRequests.some(
//       (req) => req.mentee.toString() === menteeId
//     );

//     // Avoid duplicates
//     if (mentor.connectionRequests.includes(menteeId)) {
//       return res.status(400).json({ message: "Request already sent" });
//     }

//     mentor.connectionRequests.push({
//       mentee: mentee._id,
//       name: mentee.name,
//       email: mentee.email,
//     });
    
//     mentee.pendingRequests.push(mentorId);

//     await mentor.save({ validateBeforeSave: false });
//     await mentee.save({ validateBeforeSave: false });

//     res.status(200).json({ message: "Connection request sent" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


export const sendConnectionRequest = async (req, res) => {
  const { menteeId, mentorId } = req.body;

  try {
    const mentor = await Mentor.findById(mentorId);
    const mentee = await Mentee.findById(menteeId);

    if (!mentor || !mentee) {
      return res.status(404).json({ message: "User not found" });
    }

    // Avoid duplicates using 'some' method for connectionRequests
    const alreadySent = mentor.connectionRequests.some(
      (req) => req.mentee.toString() === menteeId
    );

    if (alreadySent) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Add the connection request
    // mentor.connectionRequests.push(mentee._id); 
    mentor.connectionRequests.push({
      mentee: mentee._id,
      name: mentee.name,
      email: mentee.email,
      profile_pic: mentee.profile_pic
    });
    

    // Add to mentee's pending requests
    mentee.pendingRequests.push(mentorId);

    // Save the changes
    await mentor.save({ validateBeforeSave: false });
    await mentee.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Connection request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const getConnectedMentors = async (req, res) => {
  const { menteeId } = req.params;

  try {
    // Validate menteeId
    if (!menteeId || !mongoose.Types.ObjectId.isValid(menteeId)) {
      console.error('Invalid menteeId:', menteeId);
      return res.status(400).json({
        success: false,
        message: "Invalid mentee ID provided"
      });
    }

    console.log('Fetching connected mentors for mentee:', menteeId);

    const mentee = await Mentee.findById(menteeId);
    if (!mentee) {
      console.error('Mentee not found:', menteeId);
      return res.status(404).json({
        success: false,
        message: "Mentee not found"
      });
    }

    // Get mentors from both acceptedRequests and mentor field
    const mentorIds = [...(mentee.acceptedRequests || [])];
    if (mentee.mentor && !mentorIds.includes(mentee.mentor)) {
      mentorIds.push(mentee.mentor);
    }

    // Get all mentors from the combined list
    const connectedMentors = await Mentor.find({
      _id: { $in: mentorIds }
    }).select('name email profile_pic fullName designation skills bio location');

    console.log('Found connected mentors:', connectedMentors.length);
    console.log('Connected mentors data:', connectedMentors);

    return res.status(200).json({
      success: true,
      data: connectedMentors,
      count: connectedMentors.length
    });

  } catch (error) {
    console.error('Error fetching connected mentors:', error);
    return res.status(500).json({
      success: false,
      message: "Error fetching connected mentors",
      error: error.message
    });
  }
};





// import { Mentee } from "../models/mentee.model.js";
// import { Mentor } from "../models/mentor.model.js";

// /**
//  * @desc   Get all mentees
//  * @route  GET /api/mentees
//  * @access Public
//  */
// export const getAllMentees = async (req, res) => {
//   try {
//     const mentees = await Mentee.find().select("-password -refreshToken");
//     res.status(200).json({ success: true, data: mentees });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc   Get mentee by ID
//  * @route  GET /api/mentees/:id
//  * @access Public
//  */
// export const getMenteeById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const mentee = await Mentee.findById(id).select("-password -refreshToken");

//     if (!mentee) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Mentee not found" });
//     }

//     res.status(200).json({ success: true, data: mentee });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// /**
//  * @desc   Update mentee details
//  * @route  PUT /api/mentees/:id
//  * @access Private (Only the mentee can update their profile)
//  */

// /**
//  * @desc   Delete mentee account
//  * @route  DELETE /api/mentees/:id
//  * @access Private (Only the mentee can delete their account)
//  */
// export const deleteMenteeAccount = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const menteeId = req.user.id; // Assuming `req.user` is populated via authentication middleware

//     if (id !== menteeId) {
//       return res
//         .status(403)
//         .json({
//           success: false,
//           message: "Unauthorized to delete this account",
//         });
//     }

//     const deletedMentee = await Mentee.findByIdAndDelete(id);

//     if (!deletedMentee) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Mentee not found" });
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Account deleted successfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// export const sendConnectionRequest = async (req, res) => {
//   const { menteeId, mentorId } = req.body;

//   try {
//     const mentor = await Mentor.findById(mentorId);
//     const mentee = await Mentee.findById(menteeId);
//     if (!mentor || !mentee)
//       return res.status(404).json({ message: "User not found" });

//     // Avoid duplicates
//     if (mentor.connectionRequests.includes(menteeId)) {
//       return res.status(400).json({ message: "Request already sent" });
//     }

//     mentor.connectionRequests.push(menteeId);
//     mentee.pendingRequests.push(mentorId); 

//         await mentor.save({ validateBeforeSave: false });
//     await mentee.save({ validateBeforeSave: false });

//     res.status(200).json({ message: "Connection request sent" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// // new

// export const getConnectedMentors = async (req, res) => {
//   const { menteeId } = req.params;

//   try {
//     // Validate menteeId
//     if (!menteeId || !mongoose.Types.ObjectId.isValid(menteeId)) {
//       console.error('Invalid menteeId:', menteeId);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid mentee ID provided"
//       });
//     }

//     console.log('Fetching connected mentors for mentee:', menteeId);

//     const mentee = await Mentee.findById(menteeId);
//     if (!mentee) {
//       console.error('Mentee not found:', menteeId);
//       return res.status(404).json({
//         success: false,
//         message: "Mentee not found"
//       });
//     }

//     // Get mentors from both acceptedRequests and mentor field
//     const mentorIds = [...(mentee.acceptedRequests || [])];
//     if (mentee.mentor && !mentorIds.includes(mentee.mentor)) {
//       mentorIds.push(mentee.mentor);
//     }

//     // Get all mentors from the combined list
//     const connectedMentors = await Mentor.find({
//       _id: { $in: mentorIds }
//     }).select('name email profile_pic fullName designation skills bio location');

//     console.log('Found connected mentors:', connectedMentors.length);
//     console.log('Connected mentors data:', connectedMentors);

//     return res.status(200).json({
//       success: true,
//       data: connectedMentors,
//       count: connectedMentors.length
//     });

//   } catch (error) {
//     console.error('Error fetching connected mentors:', error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching connected mentors",
//       error: error.message
//     });
//   }
// };