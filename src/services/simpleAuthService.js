import { tokenStorage } from "../utils/tokenStorage.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const simpleAuthService = {
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const { user, accessToken } = data.data || data;

      if (!accessToken) {
        throw new Error("No token received from server");
      }

      // Store token and user data
      tokenStorage.setToken(accessToken);
      tokenStorage.setUser(user);

      return { user, token: accessToken };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  async logout() {
    try {
      const token = tokenStorage.getToken();

      if (token) {
        // Try to call logout endpoint
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.warn("Logout API call failed:", error.message);
    } finally {
      // Always clear local storage
      tokenStorage.clearAll();
    }
  },

  async verifyToken() {
    const token = tokenStorage.getToken();

    if (!token) {
      throw new Error("No token found");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      const data = await response.json();
      const { user } = data.data || data;

      // Update stored user data
      tokenStorage.setUser(user);

      return { user };
    } catch (error) {
      console.error("Token verification error:", error);
      tokenStorage.clearAll();
      throw error;
    }
  },

  getStoredUser() {
    return tokenStorage.getUser();
  },

  getStoredToken() {
    return tokenStorage.getToken();
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      const { user, accessToken } = data.data || data;

      if (!accessToken) {
        throw new Error("No token received from server");
      }

      // Store token and user data
      tokenStorage.setToken(accessToken);
      tokenStorage.setUser(user);

      return { user, token: accessToken };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  },

  isAuthenticated() {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    return !!(token && user);
  },
};
