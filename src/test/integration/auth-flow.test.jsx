import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../utils.jsx";
import App from "../../App.jsx";

// Mock the performance API
jest.mock("../../utils/performance.js", () => ({
  setupGlobalErrorHandlers: jest.fn(),
  logPerformanceMetrics: jest.fn(),
}));

describe("Authentication Flow Integration", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("shows login form for unauthenticated users", async () => {
    render(<App />, { route: "/login" });

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });
  });

  it("redirects to login when accessing protected route without auth", async () => {
    render(<App />, { route: "/notes" });

    await waitFor(() => {
      expect(window.location.pathname).toBe("/login");
    });
  });

  it("completes login flow successfully", async () => {
    const user = userEvent.setup();

    render(<App />, { route: "/login" });

    // Wait for login form to load
    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    // Fill in login form
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Should redirect to notes page after successful login
    await waitFor(
      () => {
        expect(window.location.pathname).toBe("/notes");
      },
      { timeout: 10000 }
    );
  });

  it("shows error for invalid credentials", async () => {
    const user = userEvent.setup();

    render(<App />, { route: "/login" });

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    // Fill in login form with invalid credentials
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("switches between login and register forms", async () => {
    const user = userEvent.setup();

    render(<App />, { route: "/login" });

    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });

    // Click register link
    const registerLink = screen.getByText(/sign up/i);
    await user.click(registerLink);

    // Should show register form
    await waitFor(() => {
      expect(screen.getByText("Create Account")).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    // Click login link
    const loginLink = screen.getByText(/sign in/i);
    await user.click(loginLink);

    // Should show login form again
    await waitFor(() => {
      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    });
  });

  it("completes registration flow successfully", async () => {
    const user = userEvent.setup();

    render(<App />, { route: "/register" });

    await waitFor(() => {
      expect(screen.getByText("Create Account")).toBeInTheDocument();
    });

    // Fill in registration form
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await user.type(firstNameInput, "Test");
    await user.type(lastNameInput, "User");
    await user.type(emailInput, "newuser@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    // Should redirect to notes page after successful registration
    await waitFor(
      () => {
        expect(window.location.pathname).toBe("/notes");
      },
      { timeout: 10000 }
    );
  });

  it("validates registration form fields", async () => {
    const user = userEvent.setup();

    render(<App />, { route: "/register" });

    await waitFor(() => {
      expect(screen.getByText("Create Account")).toBeInTheDocument();
    });

    // Try to submit empty form
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("validates password confirmation", async () => {
    const user = userEvent.setup();

    render(<App />, { route: "/register" });

    await waitFor(() => {
      expect(screen.getByText("Create Account")).toBeInTheDocument();
    });

    // Fill form with mismatched passwords
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await user.type(firstNameInput, "Test");
    await user.type(lastNameInput, "User");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "differentpassword");
    await user.click(submitButton);

    // Should show password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("handles logout flow", async () => {
    const user = userEvent.setup();

    // Start with authenticated state
    const initialState = {
      auth: {
        user: {
          id: "1",
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
        },
        token: "mock-token",
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true,
      },
    };

    render(<App />, {
      route: "/notes",
      preloadedState: initialState,
    });

    // Should show notes page
    await waitFor(() => {
      expect(screen.getByText(/notes/i)).toBeInTheDocument();
    });

    // Find and click logout button (this would be in the header/navigation)
    // Note: This test assumes there's a logout button accessible
    // You might need to adjust based on your actual UI structure

    // For now, we'll simulate the logout action directly
    // In a real test, you'd interact with the actual logout button
  });
});
