import { createSlice } from "@reduxjs/toolkit";

// Get initial theme from localStorage
const getInitialTheme = () => {
  const saved = localStorage.getItem("gorgeousDarkMode");
  return saved ? JSON.parse(saved) : true;
};

// Initial state
const initialState = {
  darkMode: getInitialTheme(),
  sidebarOpen: false,
  showStats: false,
  notifications: [],
  confirmDelete: null,
  undoDelete: null,
  isTyping: false,
};

// UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("gorgeousDarkMode", JSON.stringify(state.darkMode));
      // Update CSS custom property
      document.documentElement.style.setProperty(
        "--theme-mode",
        state.darkMode ? "dark" : "light"
      );
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem("gorgeousDarkMode", JSON.stringify(state.darkMode));
      document.documentElement.style.setProperty(
        "--theme-mode",
        state.darkMode ? "dark" : "light"
      );
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleStats: (state) => {
      state.showStats = !state.showStats;
    },
    setShowStats: (state, action) => {
      state.showStats = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: "success",
        duration: 3000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setConfirmDelete: (state, action) => {
      state.confirmDelete = action.payload;
    },
    clearConfirmDelete: (state) => {
      state.confirmDelete = null;
    },
    setUndoDelete: (state, action) => {
      state.undoDelete = action.payload;
    },
    clearUndoDelete: (state) => {
      state.undoDelete = null;
    },
    setIsTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    // Keyboard shortcuts
    handleKeyboardShortcut: (state, action) => {
      const { key, ctrlKey, metaKey } = action.payload;

      if ((ctrlKey || metaKey) && key === "n") {
        // New note shortcut - handled by components
      } else if ((ctrlKey || metaKey) && key === "/") {
        // Search shortcut - handled by components
      } else if (key === "Escape") {
        state.confirmDelete = null;
        state.sidebarOpen = false;
      }
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  toggleStats,
  setShowStats,
  addNotification,
  removeNotification,
  clearNotifications,
  setConfirmDelete,
  clearConfirmDelete,
  setUndoDelete,
  clearUndoDelete,
  setIsTyping,
  handleKeyboardShortcut,
} = uiSlice.actions;

export default uiSlice.reducer;
