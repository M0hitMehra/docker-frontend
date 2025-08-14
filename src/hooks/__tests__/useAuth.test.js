import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { createTestStore, mockUser } from "../../test/utils.jsx";
import { useAuth } from "../useAuth.js";

// Mock the auth service
jest.mock("../../services/authService.js", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    verifyToken: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    getStoredToken: jest.fn(),
    getStoredUser: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

const createWrapper = (initialState = {}) => {
  const store = createTestStore(initialState);
  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial auth state", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true); // Loading during initialization
    expect(result.current.error).toBeNull();
    expect(result.current.initialized).toBe(false);
  });

  it("returns authenticated state when user is logged in", () => {
    const initialState = {
      auth: {
        user: mockUser,
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    const wrapper = createWrapper(initialState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe("mock-token");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.initialized).toBe(true);
  });

  it("provides login function", async () => {
    const { authService } = require("../../services/authService.js");
    authService.login.mockResolvedValue({
      user: mockUser,
      token: "new-token",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(loginResult.success).toBe(true);
    expect(authService.login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("handles login error", async () => {
    const { authService } = require("../../services/authService.js");
    authService.login.mockRejectedValue(new Error("Invalid credentials"));

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login({
        email: "test@example.com",
        password: "wrong-password",
      });
    });

    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe("Invalid credentials");
  });

  it("provides register function", async () => {
    const { authService } = require("../../services/authService.js");
    authService.register.mockResolvedValue({
      user: mockUser,
      token: "new-token",
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuth(), { wrapper });

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      });
    });

    expect(registerResult.success).toBe(true);
    expect(authService.register).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
  });

  it("provides logout function", async () => {
    const { authService } = require("../../services/authService.js");
    authService.logout.mockResolvedValue();

    const initialState = {
      auth: {
        user: mockUser,
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    const wrapper = createWrapper(initialState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    let logoutResult;
    await act(async () => {
      logoutResult = await result.current.logout();
    });

    expect(logoutResult.success).toBe(true);
    expect(authService.logout).toHaveBeenCalled();
  });

  it("provides user display name", () => {
    const initialState = {
      auth: {
        user: mockUser,
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    const wrapper = createWrapper(initialState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.getDisplayName()).toBe("Test User");
  });

  it("provides user initials", () => {
    const initialState = {
      auth: {
        user: mockUser,
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    const wrapper = createWrapper(initialState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.getUserInitials()).toBe("TU");
  });

  it("handles user with only first name", () => {
    const userWithOnlyFirstName = {
      ...mockUser,
      lastName: null,
    };

    const initialState = {
      auth: {
        user: userWithOnlyFirstName,
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    const wrapper = createWrapper(initialState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.getDisplayName()).toBe("Test");
    expect(result.current.getUserInitials()).toBe("TE");
  });

  it("handles user with only email", () => {
    const userWithOnlyEmail = {
      ...mockUser,
      firstName: null,
      lastName: null,
    };

    const initialState = {
      auth: {
        user: userWithOnlyEmail,
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    const wrapper = createWrapper(initialState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.getDisplayName()).toBe("test@example.com");
    expect(result.current.getUserInitials()).toBe("TE");
  });
});
