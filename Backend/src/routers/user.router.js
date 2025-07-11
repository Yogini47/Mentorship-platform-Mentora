import express from "express";
import {
  menteeRegistration,
  mentorRegistration,
  login,
  logout,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateProfilePic,
  updateMentorAccountDetails,
  updateMenteeAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = express.Router();
router.route("/register/mentor").post(upload.fields([
  {
    name: "profilePic",
    maxCount: 1
  }
]), mentorRegistration)

router.route("/register/mentee").post(upload.fields([{
  name: "profile_pic",
  max: 1
}]), menteeRegistration)

router.route("/login").post(login)
router.route("/logout").post(verifyJWT, logout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/profile_pic").patch(verifyJWT, upload.single("profile_pic"), updateProfilePic)
router.route("/update-Mentor").patch(verifyJWT,updateMentorAccountDetails)
router.route("/update-Mentee").patch(verifyJWT,updateMenteeAccountDetails)

export default router;

