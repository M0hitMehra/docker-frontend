import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render, mockState } from "../../../test/utils.jsx";
import LoginForm from "../LoginForm.jsx";

// Mock the hooks
jest.mock("../../../hooks/useAuth.js", () => ({
  useAuth: () => ({
    login: jest.fn(),
    loading: false,
    error: null,
    clearAuthError: jest.fn(),
  }),
}));

jest.mock("../../../hooks/useRememberMe.js", () => ({
  useRememberMe: () => ({
    rememberMe: false,
    setRememberMe: jest.fn(),
  }),
}));

describe("LoginForm", () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/remember me/i)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/please enter a valid email address/i)
      ).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true });

    // Mock the useAuth hook to return our mock login function
    const { useAuth } = require("../../../hooks/useAuth.js");
    useAuth.mockReturnValue({
      login: mockLogin,
      loading: false,
      error: null,
      clearAuthError: jest.fn(),
    });

    const user = userEvent.setup();

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("displays loading state during submission", () => {
    const { useAuth } = require("../../../hooks/useAuth.js");
    useAuth.mockReturnValue({
      login: jest.fn(),
      loading: true,
      error: null,
      clearAuthError: jest.fn(),
    });

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /signing in.../i })
    ).toBeDisabled();
  });

  it("displays error message", () => {
    const { useAuth } = require("../../../hooks/useAuth.js");
    useAuth.mockReturnValue({
      login: jest.fn(),
      loading: false,
      error: "Invalid credentials",
      clearAuthError: jest.fn(),
    });

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole("button", { name: "" }); // Eye icon button

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("calls onSwitchToRegister when register link is clicked", async () => {
    const user = userEvent.setup();

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const registerLink = screen.getByText(/sign up/i);
    await user.click(registerLink);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it("handles remember me checkbox", async () => {
    const mockSetRememberMe = jest.fn();
    const { useRememberMe } = require("../../../hooks/useRememberMe.js");
    useRememberMe.mockReturnValue({
      rememberMe: false,
      setRememberMe: mockSetRememberMe,
    });

    const user = userEvent.setup();

    render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    await user.click(rememberMeCheckbox);

    expect(mockSetRememberMe).toHaveBeenCalledWith(true);
  });
});
