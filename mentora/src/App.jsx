


import { useState } from "react";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import MenteeHome from "./MenteeHome";
import MentorHome from "./MentorHome";
// import RegistrationPage from "./RegistrationPage";
import LandingPage from "./LandingPage";
import AddBlog from "./AddBlog";
import MenteeProfile from "./MenteeProfile";
import { MentorProvider } from "../context/MentorContext";
import { BlogProvider } from "../context/BlogContext"; 
import { MenteeProvider } from "../context/MenteeContext";
import { ChatProvider } from "../context/ChatContext";
import MentorDetails from "./MentorDetails";
import BlogPage from "./BlogPage";
import MentorProfile from "./MentorProfile";
import Blog from "./Blog";
import MenteeChat from "./MenteeChat";
import AboutUs from "./AboutUs";
import MentorChat from "./MentorChat";
import ResetPasswordModal from "./components/ResetPasswordModal";


function App() {
  const [userType, setUserType] = useState(null); // Stores whether the user is mentor or mentee

  return (
    <MenteeProvider>
        <MentorProvider>
<BlogProvider>
  <ChatProvider>
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage />} />
         <Route path="/SignupPage" element={<SignupPage />} /> 
         <Route path="/MentorHome" element={<MentorHome />} />
         <Route path="/MentorProfile" element={<MentorProfile />} />
         <Route path="/MenteeHome" element={<MenteeHome />} />
         <Route path="/AddBLog" element={<AddBlog />} />
         <Route path="/MenteeProfile" element={<MenteeProfile />} />
        <Route path="/LoginPage" element={<LoginPage setUserType={setUserType} />} />
        <Route path="/MentorHome" element={userType === "mentor" ? <MentorHome /> : <LoginPage setUserType={setUserType} />} />
        <Route path="/MenteeHome" element={userType === "mentee" ? <MenteeHome /> : <LoginPage setUserType={setUserType} />} />
        <Route path="/mentor/:id" element={<MentorDetails />} />
        <Route path="/BlogPage" element={<BlogPage />} />
        <Route path="/blogs/:blogId" element={<Blog />} />
        <Route path="/MenteeChat" element={<MenteeChat />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/MentorChat" element={<MentorChat/>} />
        <Route path="/ResetPasswordModal" element={<ResetPasswordModal />} />

      </Routes>
    </Router>
    </ChatProvider>
    </BlogProvider>
    </MentorProvider>
    </MenteeProvider>

  );
}

export default App;







