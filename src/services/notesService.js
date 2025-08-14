import { apiService } from "./api.js";

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

      const response = await apiService.get(url);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes");
    }
  },

  // Get a single note by ID
  async getNoteById(id) {
    try {
      const response = await apiService.get(`/api/notes/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch note");
    }
  },

  // Create a new note
  async createNote(noteData) {
    try {
      const response = await apiService.post("/api/notes", noteData);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to create note");
    }
  },

  // Update an existing note
  async updateNote(id, noteData) {
    try {
      const response = await apiService.put(`/api/notes/${id}`, noteData);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to update note");
    }
  },

  // Delete a note
  async deleteNote(id) {
    try {
      const response = await apiService.delete(`/api/notes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to delete note");
    }
  },

  // Archive/unarchive a note
  async archiveNote(id, archived = true) {
    try {
      const response = await apiService.patch(`/api/notes/${id}/archive`, {
        archived,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(
        error.message || `Failed to ${archived ? "archive" : "unarchive"} note`
      );
    }
  },

  // Pin/unpin a note
  async pinNote(id, pinned = true) {
    try {
      const response = await apiService.patch(`/api/notes/${id}/pin`, {
        pinned,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(
        error.message || `Failed to ${pinned ? "pin" : "unpin"} note`
      );
    }
  },

  // Export notes
  async exportNotes() {
    try {
      const response = await apiService.get("/api/notes/export");
      return response.data.data || response.data;
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

      const response = await apiService.get(
        `/api/notes/search?${params.toString()}`
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to search notes");
    }
  },

  // Get notes statistics
  async getNotesStats() {
    try {
      const response = await apiService.get("/api/notes/stats");
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes statistics");
    }
  },

  // Bulk operations
  async bulkArchive(noteIds, archived = true) {
    try {
      const response = await apiService.patch("/api/notes/bulk/archive", {
        noteIds,
        archived,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to bulk archive notes");
    }
  },

  async bulkDelete(noteIds) {
    try {
      const response = await apiService.delete("/api/notes/bulk", {
        data: { noteIds },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to bulk delete notes");
    }
  },

  async bulkPin(noteIds, pinned = true) {
    try {
      const response = await apiService.patch("/api/notes/bulk/pin", {
        noteIds,
        pinned,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to bulk pin notes");
    }
  },

  // Import notes
  async importNotes(notesData) {
    try {
      const response = await apiService.post("/api/notes/import", {
        notes: notesData,
      });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to import notes");
    }
  },

  // Get notes by category
  async getNotesByCategory(category) {
    try {
      const response = await apiService.get(
        `/api/notes?category=${encodeURIComponent(category)}`
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes by category");
    }
  },

  // Get notes by tag
  async getNotesByTag(tag) {
    try {
      const response = await apiService.get(
        `/api/notes?tag=${encodeURIComponent(tag)}`
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch notes by tag");
    }
  },

  // Get all unique tags
  async getAllTags() {
    try {
      const response = await apiService.get("/api/notes/tags");
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch tags");
    }
  },

  // Get all unique categories
  async getAllCategories() {
    try {
      const response = await apiService.get("/api/notes/categories");
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch categories");
    }
  },
};
