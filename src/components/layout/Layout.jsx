import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { useUI } from "../../hooks/useUI.js";
import { useAuth } from "../../hooks/useAuth.js";
import { COLORS } from "../../utils/constants.js";
import { Notification } from "../ui/index.js";

const Layout = ({ children, className = "" }) => {
  const { darkMode, sidebarOpen, setSidebarOpen, getThemeBackground } = useUI();
  const { isAuthenticated } = useAuth();
  const containerRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleExport = async () => {
    try {
      // This would be implemented with the notes service
      console.log("Export notes functionality");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`app-container h-screen overflow-y-auto relative ${className}`}
      style={{
        background: getThemeBackground,
        color: darkMode ? "#ffffff" : "#333333",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Animated Background Elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 100 + 30,
              height: Math.random() * 100 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${
                COLORS[Math.floor(Math.random() * COLORS.length)]
              }, ${COLORS[Math.floor(Math.random() * COLORS.length)]})`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>

      {/* Notification Container */}
      <Notification />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <Header onToggleSidebar={handleToggleSidebar} scrollY={scrollY} />

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleCloseSidebar}
            onExport={handleExport}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center text-white text-xl z-30 sm:hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <svg
          className="w-6 h-6"
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

      {/* Scroll to Top Button */}
      {scrollY > 500 && (
        <motion.button
          className="fixed bottom-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-xl flex items-center justify-center text-white z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </motion.button>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 text-white/30 text-xs pointer-events-none hidden lg:block">
        <p>Ctrl+N: New Note • Ctrl+/: Search • Esc: Close</p>
      </div>
    </div>
  );
};

export default Layout;
