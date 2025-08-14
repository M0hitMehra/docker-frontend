import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";
import { useUI } from "../../hooks/useUI.js";
import { COLORS } from "../../utils/constants.js";

const AuthLayout = () => {
  const navigate = useNavigate();
  const { getThemeBackground } = useUI();
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = (userData) => {
    // Redirect to main app after successful authentication
    navigate("/");
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: getThemeBackground,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4">
            GORGEOUS
          </h1>
          <p className="text-white/60 text-lg">
            Beautiful notes, organized perfectly
          </p>
        </motion.div>

        {/* Auth Form Container */}
        <motion.div
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          <p>© 2024 Gorgeous Notes. Made with ❤️</p>
        </motion.div>
      </div>

      {/* Floating Action Elements */}
      <div className="absolute top-8 right-8">
        <motion.button
          className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white/60 hover:text-white hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            // TODO: Implement theme toggle
            console.log("Theme toggle clicked");
          }}
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
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Demo/Guest Access Button */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <button
          className="px-6 py-2 text-sm text-white/60 hover:text-white border border-white/20 rounded-full hover:bg-white/10 transition-all"
          onClick={() => {
            // TODO: Implement demo/guest access
            console.log("Demo access clicked");
          }}
        >
          Try Demo Version
        </button>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-8 right-8 text-white/40 text-xs"
      >
        <p>Press Tab to navigate • Enter to submit</p>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
