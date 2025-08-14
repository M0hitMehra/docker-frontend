import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Start with loading true for initialization
  error: null,
  initialized: false,
};

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { authService } = await import("../../services/authService.js");
      const result = await authService.login({ email, password });
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ email, password, firstName, lastName }, { rejectWithValue }) => {
    try {
      const { authService } = await import("../../services/authService.js");
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { authService } = await import("../../services/authService.js");
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue("No token found");
      }

      const { authService } = await import("../../services/authService.js");
      const result = await authService.verifyToken();
      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Token verification failed");
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      const { authPersistenceService } = await import(
        "../../services/authPersistence.js"
      );
      const { authService } = await import("../../services/authService.js");

      // Initialize persistence service
      authPersistenceService.initialize();

      // Validate stored data
      const validation = authPersistenceService.validateStoredData();
      if (!validation.isValid) {
        console.warn("Auth data validation failed:", validation.issues);
        authPersistenceService.clearAuthData();
        return {
          user: null,
          token: null,
          isAuthenticated: false,
        };
      }

      // Check if should auto-login
      if (!authPersistenceService.shouldAutoLogin()) {
        return {
          user: null,
          token: null,
          isAuthenticated: false,
        };
      }

      // Restore auth state
      const restoredState = authPersistenceService.restoreAuthState();
      if (!restoredState) {
        return {
          user: null,
          token: null,
          isAuthenticated: false,
        };
      }

      // Verify the token is still valid with server
      try {
        const result = await authService.verifyToken();

        // Update stored user data with fresh data from server
        authPersistenceService.setUserData(result.user);

        // Create new session
        authPersistenceService.createSession({
          userId: result.user.id,
          loginMethod: "auto",
          deviceFingerprint: authPersistenceService.getDeviceFingerprint(),
        });

        return {
          user: result.user,
          token: restoredState.token,
          isAuthenticated: true,
        };
      } catch (error) {
        // Token is invalid, clear storage
        authPersistenceService.clearAuthData();
        return {
          user: null,
          token: null,
          isAuthenticated: false,
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Authentication initialization failed"
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setInitialized: (state) => {
      state.initialized = true;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.initialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCredentials, clearCredentials, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
