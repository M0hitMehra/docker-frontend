import { simpleApi } from "./simpleApi.js";

// Helper function to handle API responses
const handleApiResponse = (response, errorMessage) => {
  const data = response.data;
  if (data && data.success !== false) {
    return data.data || data;
  } else {
    throw new Error(data?.message || data?.error || errorMessage);
  }
};

export const notesService = {
  // Fetch all notes
  async fetchNotes(options = {}) {
    try {
      const { showArchived = false, page = 1, limit = 50 } = options;

      const params = new URLSearchParams();
      if (showArchived) params.append("archived", "true");
      if (page > 1) params.append("page", page.toString());
      if (limit !== 50) params.append("limit", limit.toString());

      const queryString = params.toString();
      const url = `/api/notes${queryString ? `?${queryString}` : ""}`;

      const response = await simpleApi.get(url);
      return handleApiResponse(response, "Failed to fetch notes");
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes");
    }
  },

  // Get a single note by ID
  async getNoteById(id) {
    try {
      const response = await simpleApi.get(`/api/notes/${id}`);
      return handleApiResponse(response, "Failed to fetch note");
    } catch (error) {
      throw new Error(error.message || "Failed to fetch note");
    }
  },

  // Create a new note
  async createNote(noteData) {
    try {
      const response = await simpleApi.post("/api/notes", noteData);
      return handleApiResponse(response, "Failed to create note");
    } catch (error) {
      throw new Error(error.message || "Failed to create note");
    }
  },

  // Update an existing note
  async updateNote(id, noteData) {
    try {
      const response = await simpleApi.put(`/api/notes/${id}`, noteData);
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to update note");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to update note");
    }
  },

  // Delete a note
  async deleteNote(id) {
    try {
      const response = await simpleApi.delete(`/api/notes/${id}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to delete note");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to delete note");
    }
  },

  // Archive/unarchive a note
  async archiveNote(id, archived = true) {
    try {
      const response = await simpleApi.patch(`/api/notes/${id}/archive`, {
        archived,
      });
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(
          response.error ||
            `Failed to ${archived ? "archive" : "unarchive"} note`
        );
      }
    } catch (error) {
      throw new Error(
        error.message || `Failed to ${archived ? "archive" : "unarchive"} note`
      );
    }
  },

  // Pin/unpin a note
  async pinNote(id, pinned = true) {
    try {
      const response = await simpleApi.patch(`/api/notes/${id}/pin`, {
        pinned,
      });
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(
          response.error || `Failed to ${pinned ? "pin" : "unpin"} note`
        );
      }
    } catch (error) {
      throw new Error(
        error.message || `Failed to ${pinned ? "pin" : "unpin"} note`
      );
    }
  },

  // Export notes
  async exportNotes() {
    try {
      const response = await simpleApi.get("/api/notes/export");
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to export notes");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to export notes");
    }
  },

  // Search notes
  async searchNotes(query, options = {}) {
    try {
      const { category, priority, tags, archived = false } = options;

      const params = new URLSearchParams();
      params.append("search", query);
      if (category && category !== "All") params.append("category", category);
      if (priority && priority !== "All") params.append("priority", priority);
      if (tags && tags.length > 0) params.append("tags", tags.join(","));
      if (archived) params.append("archived", "true");

      const response = await simpleApi.get(
        `/api/notes/search?${params.toString()}`
      );
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to search notes");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to search notes");
    }
  },

  // Get notes statistics
  async getNotesStats() {
    try {
      const response = await simpleApi.get("/api/notes/stats");
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to fetch notes statistics");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes statistics");
    }
  },

  // Bulk operations
  async bulkArchive(noteIds, archived = true) {
    try {
      const response = await simpleApi.patch("/api/notes/bulk/archive", {
        noteIds,
        archived,
      });
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to bulk archive notes");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to bulk archive notes");
    }
  },

  async bulkDelete(noteIds) {
    try {
      const response = await simpleApi.delete("/api/notes/bulk", {
        data: { noteIds },
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to bulk delete notes");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to bulk delete notes");
    }
  },

  async bulkPin(noteIds, pinned = true) {
    try {
      const response = await simpleApi.patch("/api/notes/bulk/pin", {
        noteIds,
        pinned,
      });
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to bulk pin notes");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to bulk pin notes");
    }
  },

  // Import notes
  async importNotes(notesData) {
    try {
      const response = await simpleApi.post("/api/notes/import", {
        notes: notesData,
      });
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to import notes");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to import notes");
    }
  },

  // Get notes by category
  async getNotesByCategory(category) {
    try {
      const response = await simpleApi.get(
        `/api/notes?category=${encodeURIComponent(category)}`
      );
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to fetch notes by category");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes by category");
    }
  },

  // Get notes by tag
  async getNotesByTag(tag) {
    try {
      const response = await simpleApi.get(
        `/api/notes?tag=${encodeURIComponent(tag)}`
      );
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to fetch notes by tag");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes by tag");
    }
  },

  // Get all unique tags
  async getAllTags() {
    try {
      const response = await simpleApi.get("/api/notes/tags");
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to fetch tags");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch tags");
    }
  },

  // Get all unique categories
  async getAllCategories() {
    try {
      const response = await simpleApi.get("/api/notes/categories");
      if (response.success) {
        return response.data.data || response.data;
      } else {
        throw new Error(response.error || "Failed to fetch categories");
      }
    } catch (error) {
      throw new Error(error.message || "Failed to fetch categories");
    }
  },
};
