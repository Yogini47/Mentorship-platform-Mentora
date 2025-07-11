import jwt from "jsonwebtoken";
import { Mentee } from "../models/mentee.model.js";
import { Mentor } from "../models/mentor.model.js";
import { ApiError } from "../utils/ApiError.js";

// Middleware to verify JWT
export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request. Token not found.");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token:", decodedToken);
    // Identify the user model dynamically
    const user =
      (await Mentor.findById(decodedToken?._id).select("-password -refreshToken")) ||
      (await Mentee.findById(decodedToken?._id).select("-password -refreshToken"));
      console.log("Found User:", user);
    if (!user) {
      throw new ApiError(401, "Invalid or expired access token.");
    }

    req.user = user; // Store the identified user in the request object
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    res.status(401).json({ message: error?.message || "Invalid Access Token" });
  }
};

// // Middleware for Mentor-only access
// export const isMentor = (req, res, next) => {
//   if (!req.user || req.user instanceof Mentee) {
//     return res.status(403).json({ message: "Access denied. Mentors only." });
//   }
//   next();
// };

// // Middleware for Mentee-only access
// export const isMentee = (req, res, next) => {
//   if (!req.user || req.user instanceof Mentor) {
//     return res.status(403).json({ message: "Access denied. Mentees only." });
//   }
//   next();
// };

