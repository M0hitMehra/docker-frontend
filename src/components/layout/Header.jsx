import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth.js";
import { useUI } from "../../hooks/useUI.js";
import { Button } from "../ui/index.js";

const Header = ({ onToggleSidebar, scrollY = 0, className = "" }) => {
  const { user, logout, getDisplayName, getUserInitials } = useAuth();
  const { darkMode, toggleTheme, isMobile } = useUI();

  const handleLogout = async () => {
    await logout();
  };

  const headerY = scrollY * -0.2; // Parallax effect

  return (
    <motion.header
      style={{ y: headerY }}
      className={`flex items-center justify-between mb-8 ${className}`}
    >
      {/* Logo and Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4"
      >
        <h1 className="text-4xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          GORGEOUS
        </h1>

        {/* Mobile Sidebar Toggle */}
        {isMobile && (
          <button
            className="sm:hidden p-2 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </motion.div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "🌞" : "🌙"}
        </motion.button>

        {/* View Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Toggle view mode"
          title="Toggle view mode"
        >
          📋
        </motion.button>

        {/* User Menu */}
        {user && (
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 p-2 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="User menu"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                {getUserInitials()}
              </div>

              {/* User Name (hidden on mobile) */}
              <span className="hidden sm:block text-white/80 text-sm font-medium">
                {getDisplayName()}
              </span>

              {/* Dropdown Arrow */}
              <svg
                className="w-4 h-4 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.button>

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 0, scale: 0.95, y: -10 }}
              whileHover={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-48 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto"
            >
              {/* Profile Link */}
              <button
                className="w-full px-4 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                onClick={() => {
                  // TODO: Navigate to profile page
                  console.log("Navigate to profile");
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </button>

              {/* Settings Link */}
              <button
                className="w-full px-4 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                onClick={() => {
                  // TODO: Navigate to settings
                  console.log("Navigate to settings");
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-white/10" />

              {/* Logout Button */}
              <button
                className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                onClick={handleLogout}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </motion.div>
          </div>
        )}

        {/* Quick Actions */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 rounded-full backdrop-blur-xl border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
          onClick={() => {
            // Scroll to form or trigger new note
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          aria-label="Create new note"
          title="Create new note (Ctrl+N)"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </motion.button>
      </div>
    </motion.header>
  );
};

export default Header;
