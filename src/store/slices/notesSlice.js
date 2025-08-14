import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  notes: [],
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

// Async thunks using service layer
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async ({ showArchived = false }, { rejectWithValue }) => {
    try {
      const { notesService } = await import("../../services/notesService.js");
      const notes = await notesService.fetchNotes({ showArchived });
      return notes;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch notes");
    }
  }
);

export const createNote = createAsyncThunk(
  "notes/createNote",
  async (noteData, { rejectWithValue }) => {
    try {
      const { notesService } = await import("../../services/notesService.js");
      const note = await notesService.createNote(noteData);
      return note;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create note");
    }
  }
);

export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ id, noteData }, { rejectWithValue }) => {
    try {
      const { notesService } = await import("../../services/notesService.js");
      const note = await notesService.updateNote(id, noteData);
      return note;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update note");
    }
  }
);

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async (id, { rejectWithValue }) => {
    try {
      const { notesService } = await import("../../services/notesService.js");
      await notesService.deleteNote(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete note");
    }
  }
);

export const archiveNote = createAsyncThunk(
  "notes/archiveNote",
  async ({ id, archived }, { rejectWithValue }) => {
    try {
      const { notesService } = await import("../../services/notesService.js");
      const note = await notesService.archiveNote(id, archived);
      return note;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to archive note");
    }
  }
);

export const pinNote = createAsyncThunk(
  "notes/pinNote",
  async ({ id, pinned }, { rejectWithValue }) => {
    try {
      const { notesService } = await import("../../services/notesService.js");
      const note = await notesService.pinNote(id, pinned);
      return note;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to pin note");
    }
  }
);

// Notes slice
const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        category: "All",
        priority: "All",
        tag: "All",
      };
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setShowArchived: (state, action) => {
      state.showArchived = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic updates
    addNoteOptimistic: (state, action) => {
      state.notes.unshift(action.payload);
    },
    updateNoteOptimistic: (state, action) => {
      const index = state.notes.findIndex(
        (note) => note._id === action.payload._id
      );
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },
    removeNoteOptimistic: (state, action) => {
      state.notes = state.notes.filter((note) => note._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create note
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.loading = false;
        state.notes.unshift(action.payload);
        state.error = null;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update note
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(
          (note) => note._id === action.payload._id
        );
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete note
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note._id !== action.payload);
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Archive note
      .addCase(archiveNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(
          (note) => note._id === action.payload._id
        );
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(archiveNote.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Pin note
      .addCase(pinNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(
          (note) => note._id === action.payload._id
        );
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(pinNote.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setSortBy,
  setViewMode,
  setShowArchived,
  clearError,
  addNoteOptimistic,
  updateNoteOptimistic,
  removeNoteOptimistic,
} = notesSlice.actions;

export default notesSlice.reducer;
