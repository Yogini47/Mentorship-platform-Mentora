import React, { useState } from "react";
import MentorDashboard from "./MentorDashboard";

const MentorHome = () => {
  const [mentees, setMentees] = useState([]);

  return (
    <div className="flex h-screen w-full bggray-50">
      <MentorDashboard mentees={mentees} />
    </div>
  );
};

export default MentorHome;
