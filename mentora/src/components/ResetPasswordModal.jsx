import React, { useState } from "react";
import axios from "axios";

const ResetPasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long and include at least one uppercase letter."
      );
      return;
    }

    try {
      setIsLoading(true);
      // const token = localStorage.getItem("authToken");
      const token = localStorage.getItem("token");
console.log("Sending request with token:", token);

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/v2/users/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || "Password changed successfully.");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setError("");
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>

        {message && <div className="text-green-600 mb-4">{message}</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={handleChange(setCurrentPassword)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={handleChange(setNewPassword)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleChange(setConfirmPassword)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;


// import React, { useState } from "react";
// import axios from "axios";

// const ResetPasswordModal = ({ onClose }) => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const validatePassword = (password) => {
//     // Password must be at least 8 characters long and include at least one uppercase letter
//     const regex = /^(?=.*[A-Z]).{8,}$/;
//     return regex.test(password);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     if (!validatePassword(newPassword)) {
//       setError("Password must be at least 8 characters long and include a mix of uppercase, lowercase, and numbers.");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const token = localStorage.getItem("authToken"); // Assuming you're storing the JWT token here

//       const response = await axios.post(
//         "http://localhost:8000/api/v2/users/change-password", // Adjust the URL as per your API
//         { currentPassword, newPassword },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setMessage(response.data.message);
//       setError("");
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong!");
//       setMessage("");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Reset message and error when user starts typing
//   const handleChange = (setter) => (e) => {
//     setter(e.target.value);
//     setMessage("");  // Clear the message when user starts typing
//     setError("");    // Clear error message when user starts typing
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//         <h2 className="text-xl font-bold mb-4">Reset Password</h2>

//         {/* Display success message */}
//         {message && <div className="text-green-600 mb-4">{message}</div>}

//         {/* Display error message */}
//         {error && <div className="text-red-600 mb-4">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-semibold mb-2">Current Password</label>
//             <input
//               type="password"
//               value={currentPassword}
//               onChange={handleChange(setCurrentPassword)}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-semibold mb-2">New Password</label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={handleChange(setNewPassword)}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={handleChange(setConfirmPassword)}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div className="flex justify-between items-center">
//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//               disabled={isLoading} // Disable button while loading
//             >
//               {isLoading ? "Submitting..." : "Submit"}
//             </button>

//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded-lg"
//             >
//               Close
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPasswordModal;

// import React, { useState } from "react";
// import axios from "axios";

// const ResetPasswordModal = ({ onClose }) => {
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (newPassword !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("authToken"); // Assuming you're storing the JWT token here

//       const response = await axios.post(
//         "http://localhost:8000/api/v2/users/change-password", // Adjust the URL as per your API
//         { currentPassword, newPassword },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       setMessage(response.data.message);
//       setError("");
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong!");
//       setMessage("");
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-96">
//         <h2 className="text-xl font-bold mb-4">Reset Password</h2>

//         {/* Display success message */}
//         {message && <div className="text-green-600 mb-4">{message}</div>}

//         {/* Display error message */}
//         {error && <div className="text-red-600 mb-4">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-sm font-semibold mb-2">Current Password</label>
//             <input
//               type="password"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-semibold mb-2">New Password</label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-semibold mb-2">Confirm New Password</label>
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           <div className="flex justify-between items-center">
//             <button
//               type="submit"
//               className="bg-blue-600 text-white px-4 py-2 rounded-lg"
//             >
//               Submit
//             </button>

//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-500 text-white px-4 py-2 rounded-lg"
//             >
//               Close
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ResetPasswordModal;
