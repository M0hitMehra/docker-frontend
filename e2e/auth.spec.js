import { test, expect } from "@playwright/test";

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Welcome Back")).toBeVisible();
    await expect(page.getByLabel("Email Address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill login form
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");

    // Submit form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect to notes page
    await expect(page).toHaveURL("/notes");
    await expect(page.getByText("Notes")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill login form with invalid credentials
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("wrongpassword");

    // Submit form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should show error message
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should show validation errors
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByLabel("Password");
    const toggleButton = page.locator('[data-testid="password-toggle"]');

    // Password should be hidden initially
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle button
    await toggleButton.click();

    // Password should be visible
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle button again
    await toggleButton.click();

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should switch to register form", async ({ page }) => {
    await page.goto("/login");

    // Click register link
    await page.getByText("Sign up").click();

    // Should show register form
    await expect(page.getByText("Create Account")).toBeVisible();
    await expect(page.getByLabel("First Name")).toBeVisible();
    await expect(page.getByLabel("Last Name")).toBeVisible();
  });

  test("should register successfully", async ({ page }) => {
    await page.goto("/register");

    // Fill registration form
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email Address").fill("newuser@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("password123");

    // Submit form
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should redirect to notes page
    await expect(page).toHaveURL("/notes");
  });

  test("should validate registration form", async ({ page }) => {
    await page.goto("/register");

    // Try to submit empty form
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should show validation errors
    await expect(page.getByText("First name is required")).toBeVisible();
    await expect(page.getByText("Last name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("should validate password confirmation", async ({ page }) => {
    await page.goto("/register");

    // Fill form with mismatched passwords
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("User");
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm Password").fill("differentpassword");

    // Submit form
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should show password mismatch error
    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("should remember login state", async ({ page }) => {
    await page.goto("/login");

    // Login with remember me checked
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel("Remember me").check();
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect to notes page
    await expect(page).toHaveURL("/notes");

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL("/notes");
    await expect(page.getByText("Notes")).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/notes");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // First login
    await page.goto("/login");
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL("/notes");

    // Find and click logout button
    await page.getByRole("button", { name: "Logout" }).click();

    // Should redirect to login
    await expect(page).toHaveURL("/login");
    await expect(page.getByText("Welcome Back")).toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept and fail the login request
    await page.route("**/api/auth/login", (route) => {
      route.abort("failed");
    });

    await page.goto("/login");

    // Fill and submit form
    await page.getByLabel("Email Address").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should show network error
    await expect(page.getByText(/network error/i)).toBeVisible();
  });
});
