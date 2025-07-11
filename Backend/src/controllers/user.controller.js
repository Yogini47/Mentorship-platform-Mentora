import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Mentee } from "../models/mentee.model.js";
import { Mentor } from "../models/mentor.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//*Generate Token**
const generateAccessAndRefreshTokens = async (userId, userType) => {
  //console.log("🟡 Received in Token Generation:", { userId, userType });
  if (!userType || (userType !== "mentor" && userType !== "mentee")) {
    //console.error("Invalid userType detected:", userType);
    throw new Error("Invalid userType provided");
  }
  try {
    const user =
      userType === "mentor"
        ? await Mentor.findById(userId)
        : await Mentee.findById(userId);

    if (!user) throw new Error(`${userType} not found`);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log("✅ Saved Refresh Token in DB:", user.refreshToken);
    //console.log("🟢 Access Token:", accessToken);
    //console.log("🟢 Refresh Token:", refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error.message);
    throw new Error("Failed to generate tokens");
  }
};

// **Mentor Registration**
const mentorRegistration = async (req, res) => {
  console.log("Received request body:", req.files);
  // console.log("Uploaded file details:", req.files);
  try {


    const {
      fullName,
      email,
      bio,
      gender,
      job_profile,
      experience,
      linkedinURL,
      password,
      pricing,
      availability,
      specialization,
      contact,
      designation,
      location,
    } = req.body;
    // let parsedLocation = {};
    // try {
    //   parsedLocation = typeof req.body.location === "string"
    //     ? JSON.parse(req.body.location)
    //     : req.body.location;
    // } catch (err) {
    //   return res.status(400).json({ message: "Invalid location format" });
    // }
    let userExists = await Mentor.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Mentor already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const profile_picLocalPath = req.files?.profilePic?.[0]?.path;
    console.log("Profile Pic Path:", profile_picLocalPath);
    if (!profile_picLocalPath) {
      return res
        .status(400)
        .json({ message: "Please upload a profile picture" });
    }
    const profile_pic = await uploadOnCloudinary(profile_picLocalPath);
    if (!profile_pic) {
      return res
        .status(400)
        .json({ message: "Failed to upload profile picture" });
    }

   
    const newMentor = await Mentor.create({
      fullName,
      email,
      profile_pic: profile_pic.url,
      bio,
      gender,
      job_profile,
      experience,
      // linkedinURL,
      // location: {
      //   country: location.country,
      //   state: location.state,
      //   city: location.city},
      location,

      designation,
      contact,
      password: hashedPassword,
      // pricing,
      // availability: JSON.parse(availability),
      specialization: specialization ? specialization.split(",") : [],
      password: hashedPassword,
      // pricing,
      // availability: JSON.parse(availability),
      specialization: specialization ? specialization.split(",") : [],
    });
    const createMentor = await Mentor.findById(newMentor._id).select(
      "-password -refreshToken"
    );
    if (!createMentor) {
      return res.status(400).json({ message: "Failed to create mentor" });
    }
    //await newMentor.save();
    res
      .status(201)
      .json({
        message: "Mentor registered successfully",
        mentor: createMentor,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// **Mentee Registration**
const menteeRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      education,
      location,
      gender,
      password,
      goals,
      state,
      city,
    } = req.body;

    let userExists = await Mentee.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Mentee already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    if (
      !education ||
      !education.college_name ||
      !education.year ||
      !education.course_name
    ) {
      return res
        .status(400)
        .json({ message: "Education details are required" });
    }
    const profile_picLocalPath = req.files?.profile_pic?.[0]?.path;
    if (!profile_picLocalPath) {
      return res
        .status(400)
        .json({ message: "Please upload a profile picture" });
    }
    const profile_pic = await uploadOnCloudinary(profile_picLocalPath);
    if (!profile_pic) {
      return res
        .status(400)
        .json({ message: "Failed to upload profile picture" });
    }
    const newMentee = await Mentee.create({
      name,
      email,
      gender,
      profile_pic: profile_pic.url,
      education: {
        college_name: education.college_name,
        year: education.year,
        course_name: education.course_name,
      },
      location: {
        state: location.state,
        city: location.city,
      },
      goals,
      mentor: null,
      location,
      password: hashedPassword,
    });
    const createMentee = await Mentee.findById(newMentee._id).select(
      "-password -refreshToken"
    );
    if (!createMentee) {
      return res.status(400).json({ message: "Failed to create mentee" });
    }
    //await newMentee.save();
    return res
      .status(201)
      .json({
        message: "Mentee registered successfully",
        mentee: createMentee,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//**Login Controller for both(Mentor & Mentee) */
const login = async (req, res) => {
  console.log(req.body);

  const { email, password, userType } = req.body;
  //console.log("🟡 Incoming Request Data:", { email, userType, password });

  if (!email || !password || !userType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user =
    userType === "mentor"
      ? await Mentor.findOne({ email })
      : await Mentee.findOne({ email });
  //console.log("🔍 Found User in DB:", user);
  if (!user) {
    return res.status(404).json({ message: `${userType} not found` });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  //console.log("🔎 Password Match Status:", isMatch);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  //console.log("✅ userType Passed to Token Generation:", userType);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
    userType
  );
  //console.log("✅ Tokens Generated Successfully");

  const loggedInUser = await (userType === "mentor"
    ? Mentor.findById(user._id).select("-password -refreshToken")
    : Mentee.findById(user._id).select("-password -refreshToken"));
  // console.log("🟢 Logged In User Details:", loggedInUser);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: `${
        userType === "mentor" ? "Mentor" : "Mentee"
      } logged in successfully`,
      accessToken,
      refreshToken,
      loggedInUser,
      userType,
    });
};
//**Logout Controller for both (Mentor and Mentee) **/
const logout = async (req, res) => {
  try {
    const userId = req.user._id; // Extract userId from verified token

    // Clear refresh token in the database
    const user =
      (await Mentor.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: "" } },
        { new: true }
      )) ||
      (await Mentee.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: "" } },
        { new: true }
      ));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clear cookies from the client
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log out. Please try again." });
  }
};

//**Refresh Access Token Controller **/
const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  // console.log("Incoming Refresh Token:", `"${incomingRefreshToken}"`);

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized Request. Refresh token is required." });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Check in both Mentor and Mentee collections
    const user =
      (await Mentor.findById(decodedToken?._id)) ||
      (await Mentee.findById(decodedToken?._id));
    //console.log("🟡 Decoded Token:", decodedToken);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const userType = user instanceof Mentor ? "mentor" : "mentee";
    if (incomingRefreshToken !== user.refreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token is expired or invalid." });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id, userType);

    await user.updateOne({ refreshToken: newRefreshToken });

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        message: "Access token refreshed successfully",
        accessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error refreshing token: " + error.message });
  }
};

//**Change Password of current User Controller **/
const changeCurrentPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await (Mentor.findById(req.user?._id) ||
    Mentee.findById(req.user?._id));

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Current password is incorrect" });

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedNewPassword;

  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
};

//**Get Current User Controller **/
const getCurrentUser = async (req, res) => {
  return res
    .status(200)
    .json({ message: "Current user fetched successfully", user: req.user });
};

//**Update Profile Pic Controller**/
const updateProfilePic = async (req, res) => {
  const profile_picLocalPath = req.file?.path;

  if (!profile_picLocalPath) {
    return res.status(400).json({ message: "Please upload a profile picture" });
  }

  const profile_pic = await uploadOnCloudinary(profile_picLocalPath);
  if (!profile_pic.url) {
    return res
      .status(500)
      .json({ message: "Failed to upload profile picture" });
  }

  const user = await (Mentor.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { profile_pic: profile_pic.url },
    },
    { new: true }
  ) ||
    Mentee.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { profile_pic: profile_pic.url },
      },
      { new: true }
    ).select("-password"));

  if (!user) return res.status(404).json({ message: "User not found" });

  res
    .status(200)
    .json({ message: "Profile picture updated successfully", user });
};
// **Update Account Details of Mentor**
const updateMentorAccountDetails = async (req, res) => {
  const {
    name,
    email,
    bio,
    location,
    linkedinURL,
    experience,
    specialization,
    availability,
  } = req.body;

  const updatedFields = {
    name,
    email,
    bio,
    location,
    linkedinURL,
    experience,
    specialization,
    availability,
  };

  //Remove undefined fields
  Object.keys(updatedFields).forEach((key) => {
    if (updatedFields[key] === undefined) {
      delete updatedFields[key];
    }
  });

  const mentor = await Mentor.findByIdAndUpdate(
    req.user?._id,
    { $set: updatedFields },
    { new: true }
  ).select("-password");

  if (!mentor) {
    return res.status(404).json({ message: "Mentor not found" });
  }

  res
    .status(200)
    .json({ message: "Mentor details updated successfully", mentor });
};

// **Update Account Details of Mentee**
const updateMenteeAccountDetails = async (req, res) => {
  const { name, email, location, goals, education } = req.body;

  const updatedFields = { name, email, location, goals, education };
  //Remove undefined fields
  Object.keys(updatedFields).forEach((key) => {
    if (updatedFields[key] === undefined) {
      delete updatedFields[key];
    }
  });

  const mentee = await Mentee.findByIdAndUpdate(
    req.user?._id,
    { $set: updatedFields },
    { new: true }
  ).select("-password");

  if (!mentee) return res.status(404).json({ message: "Mentee not found" });

  res
    .status(200)
    .json({ message: "Mentee account details updated successfully", mentee });
};

export {
  menteeRegistration,
  mentorRegistration,
  login,
  logout,
  refreshAccessToken,
  generateAccessAndRefreshTokens,
  changeCurrentPassword,
  getCurrentUser,
  updateProfilePic,
  updateMentorAccountDetails,
  updateMenteeAccountDetails,
};
