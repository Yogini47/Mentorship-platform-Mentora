import { Session } from "../models/session.model.js";
import{Mentee}from"../models/mentee.model.js";
import { Mentor } from "../models/mentor.model.js";;
// Create a new session
export const createSession = async (req, res) => {
  const { mentor, mentee, date, price, notes } = req.body;
  //console.log("Request Body:", req.body);

  try {
    const newSession = new Session({
      mentor,
      mentee,
      date,
      price,
      notes
    });
    await newSession.save();
 //  Update the mentee's `mentor` field and push session ID
 await Mentee.findByIdAndUpdate(
  mentee,
  {
      mentor,
      $push: { sessions: newSession._id } 
  },
  { new: true }
);

//  Also add session to mentor's `sessions` array
await Mentor.findByIdAndUpdate(
  mentor,
  { 
    $addToSet: { mentees: mentee },
    $push: { sessions: newSession._id } },
  { new: true }
);

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: newSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get session by ID
export const getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id).populate("mentor").populate("mentee");
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update session status
export const updateSessionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedSession = await Session.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedSession) return res.status(404).json({ success: false, message: "Session not found" });

    res.status(200).json({ success: true, message: "Session status updated successfully", data: updatedSession });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add feedback to a session
export const addSessionFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const session = await Session.findByIdAndUpdate(id, {
      feedback: { rating, comment },
      status: "completed"
    }, { new: true });

    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    res.status(200).json({ success: true, message: "Feedback added successfully", data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
