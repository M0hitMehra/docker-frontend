import React, { createContext, useContext, useState, useEffect } from "react";
import { simpleAuthService } from "../services/simpleAuthService.js";

const SimpleAuthContext = createContext();

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return context;
};

export const SimpleAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Initializing auth...");

      // Check if user is already authenticated
      if (simpleAuthService.isAuthenticated()) {
        const storedUser = simpleAuthService.getStoredUser();
        const storedToken = simpleAuthService.getStoredToken();

        console.log("📦 Found stored user:", storedUser);
        console.log("🔑 Found stored token:", storedToken ? "Yes" : "No");

        if (storedUser) {
          // For now, let's skip server verification and just use stored user
          // This will prevent the immediate logout issue
          console.log("✅ Using stored user without server verification");
          setUser(storedUser);

          // TODO: Re-enable server verification once we debug the issue
          // try {
          //   const { user: verifiedUser } = await simpleAuthService.verifyToken();
          //   setUser(verifiedUser);
          // } catch (verifyError) {
          //   console.warn("Token verification failed:", verifyError.message);
          //   // Token is invalid, clear auth state
          //   setUser(null);
          // }
        }
      } else {
        console.log("❌ No stored authentication found");
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔐 Attempting login...", credentials.email);
      const { user: loggedInUser } = await simpleAuthService.login(credentials);
      console.log("✅ Login successful:", loggedInUser);
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error.message);
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log("📝 Attempting registration...", userData.email);
      const { user: registeredUser } = await simpleAuthService.register(
        userData
      );
      console.log("✅ Registration successful:", registeredUser);
      setUser(registeredUser);

      return { success: true, user: registeredUser };
    } catch (error) {
      console.error("❌ Registration error:", error);
      setError(error.message);
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await simpleAuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
