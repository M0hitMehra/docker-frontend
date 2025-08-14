import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../utils/constants.js";

const Navigation = ({ className = "" }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      path: ROUTES.HOME,
      label: "Notes",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      path: ROUTES.PROFILE,
      label: "Profile",
      icon: (
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-white bg-white/20 border border-white/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Background highlight for active item */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavItem"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-white/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <span className="relative z-10">{item.icon}</span>

                {/* Label */}
                <span className="relative z-10 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default Navigation;
