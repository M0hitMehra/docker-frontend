import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { ErrorProvider } from "../contexts/ErrorContext.jsx";
import authReducer from "../store/slices/authSlice.js";
import notesReducer from "../store/slices/notesSlice.js";
import uiReducer from "../store/slices/uiSlice.js";

// Test store factory
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      ui: uiReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Custom render function with providers
export const render = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = "/",
    ...renderOptions
  } = {}
) => {
  // Set initial route
  window.history.pushState({}, "Test page", route);

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <ErrorProvider>{children}</ErrorProvider>
      </BrowserRouter>
    </Provider>
  );

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  };
};

// Mock user data
export const mockUser = {
  id: "1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  createdAt: "2023-01-01T00:00:00.000Z",
  preferences: {
    theme: "dark",
    defaultCategory: "Others",
    defaultPriority: "medium",
  },
};

// Mock note data
export const mockNote = {
  _id: "1",
  title: "Test Note",
  content: "This is a test note content",
  category: "Work",
  priority: "high",
  tags: ["test", "important"],
  pinned: false,
  archived: false,
  createdAt: "2023-01-01T00:00:00.000Z",
  updatedAt: "2023-01-01T00:00:00.000Z",
  userId: "1",
};

// Mock notes array
export const mockNotes = [
  mockNote,
  {
    ...mockNote,
    _id: "2",
    title: "Second Note",
    content: "Another test note",
    category: "Personal",
    priority: "medium",
    tags: ["personal"],
    pinned: true,
  },
  {
    ...mockNote,
    _id: "3",
    title: "Archived Note",
    content: "This note is archived",
    archived: true,
    priority: "low",
  },
];

// Mock auth state
export const mockAuthState = {
  user: mockUser,
  token: "mock-jwt-token",
  isAuthenticated: true,
  loading: false,
  error: null,
  initialized: true,
};

// Mock notes state
export const mockNotesState = {
  notes: mockNotes,
  loading: false,
  error: null,
  filters: {
    search: "",
    category: "All",
    priority: "All",
    tag: "All",
  },
  sortBy: "createdAt",
  viewMode: "grid",
  showArchived: false,
};

// Mock UI state
export const mockUIState = {
  theme: "dark",
  sidebarOpen: false,
  notifications: [],
  confirmDelete: null,
};

// Complete mock state
export const mockState = {
  auth: mockAuthState,
  notes: mockNotesState,
  ui: mockUIState,
};

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Mock API responses
export const mockApiResponse = (data, success = true) => ({
  data: success ? { success: true, data } : { success: false, message: data },
});

// Mock error response
export const mockErrorResponse = (message = "Test error") => ({
  response: {
    data: { success: false, message },
    status: 400,
  },
});

// Form test helpers
export const fillForm = async (getByLabelText, formData) => {
  const { userEvent } = await import("@testing-library/user-event");
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(formData)) {
    const field = getByLabelText(new RegExp(label, "i"));
    await user.clear(field);
    await user.type(field, value);
  }
};

// Wait for async operations
export const waitFor = async (callback, options = {}) => {
  const { waitFor: rtlWaitFor } = await import("@testing-library/react");
  return rtlWaitFor(callback, { timeout: 5000, ...options });
};

// Custom matchers
export const customMatchers = {
  toBeInTheDocument: (received) => {
    const { isInTheDocument } = require("@testing-library/jest-dom/matchers");
    return isInTheDocument(received);
  },
  toHaveClass: (received, className) => {
    const { toHaveClass } = require("@testing-library/jest-dom/matchers");
    return toHaveClass(received, className);
  },
};

// Mock intersection observer for lazy loading tests
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  window.IntersectionObserverEntry = jest.fn();
};

// Mock performance API
export const mockPerformanceAPI = () => {
  global.performance = {
    ...global.performance,
    mark: jest.fn(),
    measure: jest.fn(),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  };
};

// Cleanup function for tests
export const cleanup = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};
