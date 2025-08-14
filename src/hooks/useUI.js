import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  toggleStats,
  setShowStats,
  setConfirmDelete,
  clearConfirmDelete,
  setUndoDelete,
  clearUndoDelete,
  setIsTyping,
  handleKeyboardShortcut,
} from "../store/slices/uiSlice.js";

export const useUI = () => {
  const dispatch = useAppDispatch();
  const {
    darkMode,
    sidebarOpen,
    showStats,
    confirmDelete,
    undoDelete,
    isTyping,
  } = useAppSelector((state) => state.ui);

  // Initialize theme on mount
  useEffect(() => {
    // Apply theme to document
    document.documentElement.style.setProperty(
      "--theme-mode",
      darkMode ? "dark" : "light"
    );

    // Update body class for theme-specific styles
    document.body.className = darkMode ? "dark-theme" : "light-theme";
  }, [darkMode]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey } = event;

      // Dispatch keyboard shortcut action
      dispatch(handleKeyboardShortcut({ key, ctrlKey, metaKey }));

      // Handle specific shortcuts
      if ((ctrlKey || metaKey) && key === "n") {
        event.preventDefault();
        // This would trigger new note creation
        // The actual implementation would be in the component
      } else if ((ctrlKey || metaKey) && key === "/") {
        event.preventDefault();
        // Focus search input
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      } else if (key === "Escape") {
        // Close modals, sidebars, etc.
        if (confirmDelete) {
          dispatch(clearConfirmDelete());
        }
        if (sidebarOpen) {
          dispatch(setSidebarOpen(false));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, confirmDelete, sidebarOpen]);

  // Theme functions
  const toggleTheme = useCallback(() => {
    dispatch(toggleDarkMode());
  }, [dispatch]);

  const setTheme = useCallback(
    (isDark) => {
      dispatch(setDarkMode(isDark));
    },
    [dispatch]
  );

  // Sidebar functions
  const toggleSidebarOpen = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const openSidebar = useCallback(() => {
    dispatch(setSidebarOpen(true));
  }, [dispatch]);

  const closeSidebar = useCallback(() => {
    dispatch(setSidebarOpen(false));
  }, [dispatch]);

  // Stats functions
  const toggleStatsVisibility = useCallback(() => {
    dispatch(toggleStats());
  }, [dispatch]);

  const showStatsPanel = useCallback(
    (show = true) => {
      dispatch(setShowStats(show));
    },
    [dispatch]
  );

  // Confirmation dialog functions
  const showConfirmDelete = useCallback(
    (noteId) => {
      dispatch(setConfirmDelete(noteId));
    },
    [dispatch]
  );

  const hideConfirmDelete = useCallback(() => {
    dispatch(clearConfirmDelete());
  }, [dispatch]);

  // Undo delete functions
  const showUndoDelete = useCallback(
    (deleteData) => {
      dispatch(setUndoDelete(deleteData));

      // Auto-clear after 5 seconds
      setTimeout(() => {
        dispatch(clearUndoDelete());
      }, 5000);
    },
    [dispatch]
  );

  const hideUndoDelete = useCallback(() => {
    dispatch(clearUndoDelete());
  }, [dispatch]);

  // Typing indicator functions
  const setTypingStatus = useCallback(
    (typing) => {
      dispatch(setIsTyping(typing));
    },
    [dispatch]
  );

  // Responsive utilities
  const isMobile = useCallback(() => {
    return window.innerWidth < 768;
  }, []);

  const isTablet = useCallback(() => {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }, []);

  const isDesktop = useCallback(() => {
    return window.innerWidth >= 1024;
  }, []);

  // Scroll utilities
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToElement = useCallback((elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Focus utilities
  const focusElement = useCallback((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
    }
  }, []);

  const focusSearchInput = useCallback(() => {
    focusElement('input[placeholder*="Search"]');
  }, [focusElement]);

  const focusNoteForm = useCallback(() => {
    focusElement(
      'input[placeholder*="Title"], textarea[placeholder*="content"]'
    );
  }, [focusElement]);

  // Animation utilities
  const getThemeBackground = useCallback(() => {
    return darkMode
      ? "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)"
      : "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 100%)";
  }, [darkMode]);

  const getThemeTextColor = useCallback(() => {
    return darkMode ? "#ffffff" : "#333333";
  }, [darkMode]);

  // Local storage utilities for UI preferences
  const saveUIPreferences = useCallback(() => {
    const preferences = {
      darkMode,
      sidebarOpen: false, // Don't persist sidebar state
      showStats,
    };
    localStorage.setItem("ui_preferences", JSON.stringify(preferences));
  }, [darkMode, showStats]);

  const loadUIPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem("ui_preferences");
      if (saved) {
        const preferences = JSON.parse(saved);
        if (preferences.darkMode !== undefined) {
          dispatch(setDarkMode(preferences.darkMode));
        }
        if (preferences.showStats !== undefined) {
          dispatch(setShowStats(preferences.showStats));
        }
      }
    } catch (error) {
      console.warn("Failed to load UI preferences:", error);
    }
  }, [dispatch]);

  // Auto-save preferences when they change
  useEffect(() => {
    saveUIPreferences();
  }, [saveUIPreferences]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Close sidebar on mobile when resizing to desktop
      if (isDesktop() && sidebarOpen) {
        dispatch(setSidebarOpen(false));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, sidebarOpen, isDesktop]);

  return {
    // State
    darkMode,
    sidebarOpen,
    showStats,
    confirmDelete,
    undoDelete,
    isTyping,

    // Theme actions
    toggleTheme,
    setTheme,

    // Sidebar actions
    toggleSidebarOpen,
    openSidebar,
    closeSidebar,

    // Stats actions
    toggleStatsVisibility,
    showStatsPanel,

    // Confirmation actions
    showConfirmDelete,
    hideConfirmDelete,

    // Undo actions
    showUndoDelete,
    hideUndoDelete,

    // Typing actions
    setTypingStatus,

    // Responsive utilities
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),

    // Scroll utilities
    scrollToTop,
    scrollToElement,

    // Focus utilities
    focusElement,
    focusSearchInput,
    focusNoteForm,

    // Theme utilities
    getThemeBackground: getThemeBackground(),
    getThemeTextColor: getThemeTextColor(),

    // Preferences
    saveUIPreferences,
    loadUIPreferences,
  };
};
