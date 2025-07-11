import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMentorContext } from "../context/MentorContext";
import api from "./api";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [userType, setUserType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setMentors } = useMentorContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = { email, password, userType };
      const response = await api.post("/users/login", data);

      const {
        accessToken,
        loggedInUser,
        userType: responseUserType,
      } = response.data;

      if (loggedInUser && loggedInUser._id) {
        localStorage.clear();
        localStorage.setItem("token", accessToken);
        localStorage.setItem("userType", responseUserType);
        localStorage.setItem("userId", loggedInUser._id);
        localStorage.setItem(
          "userName",
          loggedInUser.fullName || loggedInUser.name
        );

        if (responseUserType === "mentor") {
          localStorage.setItem("mentorId", loggedInUser._id);
          setMentors([loggedInUser]);
          navigate("/MentorHome");
        } else {
          localStorage.setItem("menteeId", loggedInUser._id);
          navigate("/MenteeHome");
        }
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen flex justify-center items-center h-screen bg-[url(./components/cover16.jpg)] bg-cover">
      <div className="w-96 p-4 shadow-lg rounded-2xl bg-white/30 border-3 border-[#1E3A8A] shadow-lg backdrop-blur-lg">
        {!userType ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4 text-[#1E3A8A]">Join as</h2>
            <button
              onClick={() => setUserType("mentor")}
              className="relative overflow-hidden group w-full font-semibold mb-2 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
            >
              <span className="relative z-10">Mentor</span>
              <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
            </button>

            <button
              onClick={() => setUserType("mentee")}
              className="relative overflow-hidden group w-full font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
            >
              <span className="relative z-10">Mentee</span>
              <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
            </button>

            <p className="text-sm text-center mt-4">
              Don't have an account?{" "}
              <a href="/SignupPage" className="text-[#1E3A8A] hover:underline">
                Signup
              </a>
              .
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Back arrow and title */}
            <div className="flex items-center space-x-2 mb-2">
              <button
                type="button"
                onClick={() => setUserType("")}
                className="text-[#1E3A8A] hover:text-[#3B82F6]"
                aria-label="Go back"
                title="Go back"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-semibold">Login as {userType}</h2>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="w-full border-2 border-[#1E3A8A] p-2 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                required
                className="w-full border-2 border-[#1E3A8A] p-2 rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg hover:scale-105 transition-transform"
            >
              {loading ? "Logging in..." : "Login"}
            </button> */}

<button
  type="submit"
  disabled={loading}
  className="relative overflow-hidden group w-full font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
>
  <span className="relative z-10">{loading ? "Logging in..." : "Login"}</span>
  <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
</button>

          </form>
        )}
      </div>
    </div>
  );
}














// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMentorContext } from "../context/MentorContext";
// import api from "./api";

// export default function LoginPage() {
//   const [userType, setUserType] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const { setMentors } = useMentorContext();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const data = { email, password, userType };
//       console.log("Login request:", { email, userType });

//       const response = await api.post("/users/login", data);

//       // Log full response for debugging
//       console.log("Full login response:", response.data);

//       // Destructure response data
//       const {
//         accessToken,
//         loggedInUser,
//         userType: responseUserType,
//       } = response.data;

//       // Store user data in localStorage
//       if (loggedInUser && loggedInUser._id) {
//         console.log("Storing user data:", {
//           id: loggedInUser._id,
//           name: loggedInUser.fullName || loggedInUser.name,
//           userType: responseUserType,
//           tokenExists: !!accessToken,
//         });

//         localStorage.clear(); // Clear any old data

//         // Store common data
//         localStorage.setItem("token", accessToken);
//         localStorage.setItem("userType", responseUserType);
//         localStorage.setItem("userId", loggedInUser._id);
//         localStorage.setItem(
//           "userName",
//           loggedInUser.fullName || loggedInUser.name
//         );

//         // Store role-specific data
//         if (responseUserType === "mentor") {
//           localStorage.setItem("mentorId", loggedInUser._id);
//           setMentors([loggedInUser]);
//           navigate("/MentorHome");
//         } else {
//           localStorage.setItem("menteeId", loggedInUser._id);
//           navigate("/MenteeHome");
//         }

//         // Log stored data for verification
//         console.log("Stored data in localStorage:", {
//           token: !!localStorage.getItem("token"),
//           userType: localStorage.getItem("userType"),
//           userId: localStorage.getItem("userId"),
//           userName: localStorage.getItem("userName"),
//         });
//       } else {
//         throw new Error("Invalid user data received");
//       }
//     } catch (err) {
//       console.error("Login error:", err.response?.data || err.message);
//       setError(
//         err.response?.data?.message || "Login failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-screen flex justify-center items-center h-screen bg-[url(./components/cover16.jpg)] bg-cover">
//       <div className="w-96 p-6 shadow-lg rounded-2xl bg-white/30 border-3 border-[#1E3A8A] shadow-lg backdrop-blur-lg">
//         {!userType ? (
//           <div className="text-center">
//             <h2 className="text-xl font-bold mb-4 text-[#1E3A8A]">Join as</h2>
//             <button
//               onClick={() => setUserType("mentor")}
//               className="relative overflow-hidden group w-full font-semibold mb-2 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
//             >
//               <span className="relative z-10">Mentor</span>
//               <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
//             </button>

//             {/* <button
//               onClick={() => setUserType("mentee")}
//               className="w-full font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white hover:bg-[#549BEA] py-2 rounded-lg"
//             >
//               Mentee
//             </button> */}

//             <button
//               onClick={() => setUserType("mentee")}
//               className="relative overflow-hidden group w-full font-semibold bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg"
//             >
//               <span className="relative z-10">Mentee</span>
//               <span className="absolute inset-0 bg-[#1E3A8A] transition-transform duration-300 ease-in-out translate-x-[-100%] group-hover:translate-x-[0%] group-hover:duration-300"></span>
//             </button>

//             <p className="text-sm text-center mt-4">
//               Don't have an account?{" "}
//               <a href="/SignupPage" className="text-[#1E3A8A] hover:underline">
//                 Signup
//               </a>
//               .
//             </p>
//           </div>
//         ) : (
//           <form className="space-y-4" onSubmit={handleLogin}>
//             <h2 className="text-xl font-semibold">Login as {userType}</h2>
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <div>
//               <label className="block text-sm font-medium">Email</label>
//               <input
//                 type="email"
//                 required
//                 className="w-full border-2 border-[#1E3A8A] p-2 rounded-lg"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Password</label>
//               <input
//                 type="password"
//                 required
//                 className="w-full border-2 border-[#1E3A8A] p-2 rounded-lg"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2 rounded-lg hover:scale-105 transition-transform"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }


























































// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMentorContext } from "../context/MentorContext";
// import api from "./api";

// export default function LoginPage() {
//   const [userType, setUserType] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const { setMentors } = useMentorContext();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const data = { email, password, userType };
//       console.log("Login request:", { email, userType });

//       const response = await api.post("/users/login", data);

//       // Log full response for debugging
//       console.log("Full login response:", response.data);

//       // Destructure response data
//       const { accessToken, loggedInUser, userType: responseUserType } = response.data;

//       // Store user data in localStorage
//       if (loggedInUser && loggedInUser._id) {
//         console.log("Storing user data:", {
//           id: loggedInUser._id,
//           name: loggedInUser.fullName || loggedInUser.name,
//           userType: responseUserType,
//           tokenExists: !!accessToken
//         });

//         localStorage.clear(); // Clear any old data

//         // Store common data
//         localStorage.setItem("token", accessToken);
//         localStorage.setItem("userType", responseUserType);
//         localStorage.setItem("userId", loggedInUser._id);
//         localStorage.setItem("userName", loggedInUser.fullName || loggedInUser.name);

//         // Store role-specific data
//         if (responseUserType === "mentor") {
//           localStorage.setItem("mentorId", loggedInUser._id);
//           setMentors([loggedInUser]);
//           navigate("/MentorHome");
//         } else {
//           localStorage.setItem("menteeId", loggedInUser._id);
//           navigate("/MenteeHome");
//         }

//         // Log stored data for verification
//         console.log("Stored data in localStorage:", {
//           token: !!localStorage.getItem("token"),
//           userType: localStorage.getItem("userType"),
//           userId: localStorage.getItem("userId"),
//           userName: localStorage.getItem("userName")
//         });
//       } else {
//         throw new Error("Invalid user data received");
//       }
//     } catch (err) {
//       console.error("Login error:", err.response?.data || err.message);
//       setError(err.response?.data?.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="w-screen flex justify-center items-center h-screen bg-[url(./components/cover16.jpg)] bg-cover">
//       <div className="w-96 p-6 shadow-lg rounded-2xl bg-white/30 border-3 border-[#6EB4FF] backdrop-blur-lg">
//         {!userType ? (
//           <div className="text-center">
//             <h2 className="text-xl font-bold mb-4 text-[#1565c0]">Join as</h2>
//             <button
//               onClick={() => setUserType("mentor")}
//               className="w-full font-semibold mb-2 bg-[#1976d2] text-white hover:bg-[#549BEA] py-2 rounded-lg"
//             >
//               Mentor
//             </button>
//             <button
//               onClick={() => setUserType("mentee")}
//               className="w-full font-semibold bg-[#1976d2] text-white hover:bg-[#549BEA] py-2 rounded-lg"
//             >
//               Mentee
//             </button>
//             <p className="text-sm text-center mt-4">
//               Don't have an account?{" "}
//               <a href="/SignupPage" className="text-blue-600 hover:underline">
//                 Signup
//               </a>.
//             </p>
//           </div>
//         ) : (
//           <form className="space-y-4" onSubmit={handleLogin}>
//             <h2 className="text-xl font-semibold">Login as {userType}</h2>
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <div>
//               <label className="block text-sm font-medium">Email</label>
//               <input
//                 type="email"
//                 required
//                 className="w-full border-2 border-[#6EB4FF] p-2 rounded-lg"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium">Password</label>
//               <input
//                 type="password"
//                 required
//                 className="w-full border-2 border-[#6EB4FF] p-2 rounded-lg"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-[#1976d2] text-white py-2 rounded-lg hover:scale-105 transition-transform"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }
