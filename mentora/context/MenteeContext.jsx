import { createContext, useContext, useState, useEffect } from "react";

export const MenteeContext = createContext();

export const MenteeProvider = ({ children }) => {
  const [mentees, setMentees] = useState([]);
  const [mentee, setMentee] = useState(null);

  // const addMentee = (newMentee) => {
  //   setMentees((prevMentees) => {
  //     // Check for duplicate mentee
  //     if (!prevMentees.some((m) => m._id === newMentee._id)) {
  //       const updatedMentees = [...prevMentees, newMentee];
  //       localStorage.setItem("mentees", JSON.stringify(updatedMentees)); // Persist to localStorage
  //       return updatedMentees;
  //     }
  //     return prevMentees;
  //   });
  // };

  // const addMentee = (newMentee) => {
  //   setMentees((prevMentees) => {
  //     // Check if mentee already exists
  //     const exists = prevMentees.some((m) => m._id === newMentee._id);
  //     if (exists) return prevMentees; // ❌ Don't add duplicate
  
  //     const updated = [...prevMentees, newMentee];
  //     localStorage.setItem("mentees", JSON.stringify(updated));
  //     return updated;

  //     console.log("Unique mentees count:", uniqueMentees.length);

  //   });
  // };
  
  const addMentee = (newMentee) => {
    setMentees((prevMentees) => {
      const exists = prevMentees.some((m) => m._id === newMentee._id);
      if (exists) return prevMentees;
  
      const updated = [...prevMentees, newMentee];
      localStorage.setItem("mentees", JSON.stringify(updated));
      return updated;
    });
  };
  
  
  // Load mentee from localStorage on app start
  useEffect(() => {
    const storedMentee = localStorage.getItem("mentee");
    const storedMentees = localStorage.getItem("mentees");

    if (storedMentee) {
      setMentee(JSON.parse(storedMentee));
    }
    if (storedMentees) {
      setMentees(JSON.parse(storedMentees));
    }
  }, []);

  // Optional: Update mentee in localStorage when it changes
  useEffect(() => {
    if (mentee) {
      localStorage.setItem("mentee", JSON.stringify(mentee));
    }
  }, [mentee]);

  return (
    <MenteeContext.Provider value={{ mentees, addMentee, mentee, setMentee }}>
      {children}
    </MenteeContext.Provider>
  );
};

export const useMentee = () => useContext(MenteeContext);



// import { createContext, useContext, useState } from "react";

// export const MenteeContext = createContext();

// export const MenteeProvider = ({ children }) => {
//   const [mentees, setMentees] = useState([]);
//   const [mentee, setMentee] = useState(null); // <- Track logged-in mentee

//   const addMentee = (newMentee) => {
//     setMentees((prevMentees) => [...prevMentees, newMentee]);
//   };

//   return (
//     <MenteeContext.Provider value={{ mentees, addMentee, mentee, setMentee }}>
//       {children}
//     </MenteeContext.Provider>
//   );
// };

// export const useMentee = () => useContext(MenteeContext);

