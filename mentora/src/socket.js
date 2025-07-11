import { io } from "socket.io-client";
import axios from "axios";

// Function to get user data from localStorage
const getUserData = () => {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");
  const mentorId = localStorage.getItem("mentorId");
  const menteeId = localStorage.getItem("menteeId");

  // Debug all localStorage contents
  console.log("getUserData - All localStorage contents:", {
    token: token ? "exists" : "missing",
    userType,
    userId,
    mentorId,
    menteeId,
    allKeys: Object.keys(localStorage)
  });

  // Convert userType to proper case for model name (mentor -> Mentor, mentee -> Mentee)
  const role = userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : null;

  // If userId is missing but we have a role-specific ID, use that
  let effectiveUserId = userId;
  if (!effectiveUserId && role === 'Mentor' && mentorId) {
    console.log("Using mentorId as fallback for userId");
    effectiveUserId = mentorId;
  } else if (!effectiveUserId && role === 'Mentee' && menteeId) {
    console.log("Using menteeId as fallback for userId");
    effectiveUserId = menteeId;
  }

  return { token, role, userId: effectiveUserId };
};

// Function to refresh token
const refreshToken = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/v2/users/refresh-token",
      {},
      { withCredentials: true }
    );

    const { accessToken } = response.data;
    localStorage.setItem("token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.clear();
    window.location.href = "/";
    return null;
  }
};

// Function to create socket connection
const createSocket = async () => {
  let { token, role, userId } = getUserData();

  // If no token, try to refresh
  if (!token) {
    token = await refreshToken();
    if (!token) return null;
  }

  console.log("createSocket - Initializing with:", {
    userId,
    role,
    hasToken: !!token,
    fullToken: token ? `${token.substring(0, 10)}...` : null
  });

  // Check if we have all required data
  if (!token || !role || !userId) {
    console.error("Missing required user data:", {
      hasToken: !!token,
      role,
      userId,
      localStorageKeys: Object.keys(localStorage)
    });
    return null;
  }

  return io("http://localhost:8000", {
    auth: {
      token,
      role,
      userId
    },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
};

// Create initial socket connection
let socket = null;

// Function to initialize socket with retry
const initializeSocket = async () => {
  try {
    socket = await createSocket();
    if (!socket) return;

    // Add connection event listeners
    socket.on('connect', () => {
      console.log('Socket connected successfully', {
        role: socket.auth.role,
        userId: socket.auth.userId,
        socketId: socket.id
      });
    });

    socket.on('connect_error', async (error) => {
      console.error('Socket connection error:', error);

      // If token expired, try to refresh
      if (error.message.includes('jwt expired')) {
        const newToken = await refreshToken();
        if (newToken) {
          // Recreate socket with new token
          socket = await createSocket();
        }
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // Try to reconnect with fresh data
        initializeSocket();
      }
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
  }
};

// Initialize socket
initializeSocket();

export default socket;