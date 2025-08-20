// Application constants extracted from App.jsx
export const CATEGORIES = ["All", "Work", "Personal", "Ideas", "Others"];

export const PRIORITIES = ["All", "high", "medium", "low"];

export const COLORS = [
  "#667eea",
  "#4299e1",
  "#48bb78",
  "#9f7aea",
  "#ed8936",
  "#e53e3e",
  "#38b2ac",
  "#d69e2e",
];

export const MOODS = [
  "😊",
  "🤔",
  "💡",
  "🔥",
  "⚡",
  "🌟",
  "🎯",
  "💪",
  "🚀",
  "❤️",
];

export const CATEGORY_COLORS = {
  Work: "#4299e1",
  Personal: "#48bb78",
  Ideas: "#9f7aea",
  Others: "#a0aec0",
};

// API endpoints
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  THEME: "theme_preference",
};

// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  NOTES: "/notes",
};
