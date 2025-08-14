import { rest } from "msw";
import { mockUser, mockNotes, mockNote } from "../utils.jsx";

const API_BASE_URL = "http://localhost:5000/api";

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;

    if (email === "test@example.com" && password === "password123") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            user: mockUser,
            accessToken: "mock-jwt-token",
            refreshToken: "mock-refresh-token",
          },
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: "Invalid credentials",
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
    const { email, password, firstName, lastName } = req.body;

    if (email && password && firstName && lastName) {
      return res(
        ctx.status(201),
        ctx.json({
          success: true,
          data: {
            user: { ...mockUser, email, firstName, lastName },
            accessToken: "mock-jwt-token",
            refreshToken: "mock-refresh-token",
          },
        })
      );
    }

    return res(
      ctx.status(422),
      ctx.json({
        success: false,
        message: "Validation failed",
        errors: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
          firstName: !firstName ? "First name is required" : null,
          lastName: !lastName ? "Last name is required" : null,
        },
      })
    );
  }),

  rest.get(`${API_BASE_URL}/auth/verify`, (req, res, ctx) => {
    const authHeader = req.headers.get("Authorization");

    if (authHeader && authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { user: mockUser },
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: "Invalid token",
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: "Logged out successfully",
      })
    );
  }),

  // Notes endpoints
  rest.get(`${API_BASE_URL}/notes`, (req, res, ctx) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const archived = req.url.searchParams.get("archived") === "true";
    const filteredNotes = mockNotes.filter(
      (note) => note.archived === archived
    );

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: filteredNotes,
        count: filteredNotes.length,
      })
    );
  }),

  rest.get(`${API_BASE_URL}/notes/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const note = mockNotes.find((n) => n._id === id);

    if (!note) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: "Note not found",
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: note,
      })
    );
  }),

  rest.post(`${API_BASE_URL}/notes`, (req, res, ctx) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const noteData = req.body;
    const newNote = {
      ...mockNote,
      _id: Date.now().toString(),
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        message: "Note created successfully",
        data: newNote,
      })
    );
  }),

  rest.put(`${API_BASE_URL}/notes/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const noteData = req.body;
    const existingNote = mockNotes.find((n) => n._id === id);

    if (!existingNote) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: "Note not found",
        })
      );
    }

    const updatedNote = {
      ...existingNote,
      ...noteData,
      updatedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: "Note updated successfully",
        data: updatedNote,
      })
    );
  }),

  rest.delete(`${API_BASE_URL}/notes/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const noteExists = mockNotes.some((n) => n._id === id);

    if (!noteExists) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: "Note not found",
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: "Note deleted successfully",
      })
    );
  }),

  rest.patch(`${API_BASE_URL}/notes/:id/archive`, (req, res, ctx) => {
    const { id } = req.params;
    const { archived } = req.body;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const note = mockNotes.find((n) => n._id === id);

    if (!note) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: "Note not found",
        })
      );
    }

    const updatedNote = {
      ...note,
      archived,
      updatedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: `Note ${archived ? "archived" : "unarchived"} successfully`,
        data: updatedNote,
      })
    );
  }),

  rest.patch(`${API_BASE_URL}/notes/:id/pin`, (req, res, ctx) => {
    const { id } = req.params;
    const { pinned } = req.body;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const note = mockNotes.find((n) => n._id === id);

    if (!note) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: "Note not found",
        })
      );
    }

    const updatedNote = {
      ...note,
      pinned,
      updatedAt: new Date().toISOString(),
    };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: `Note ${pinned ? "pinned" : "unpinned"} successfully`,
        data: updatedNote,
      })
    );
  }),

  // User endpoints
  rest.get(`${API_BASE_URL}/user/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockUser,
      })
    );
  }),

  rest.put(`${API_BASE_URL}/user/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: "Unauthorized",
        })
      );
    }

    const profileData = req.body;
    const updatedUser = { ...mockUser, ...profileData };

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: updatedUser,
      })
    );
  }),

  // Error simulation endpoints
  rest.get(`${API_BASE_URL}/test/error`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        message: "Internal server error",
      })
    );
  }),

  rest.get(`${API_BASE_URL}/test/network-error`, (req, res, ctx) => {
    return res.networkError("Network error");
  }),
];
