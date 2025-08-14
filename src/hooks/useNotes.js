import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import {
  selectSortedNotes,
  selectNotesLoading,
  selectNotesError,
  selectNotesStats,
  selectAllTags,
  selectPinnedNotes,
} from "../store/selectors/index.js";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  archiveNote,
  pinNote,
  clearError,
  addNoteOptimistic,
  updateNoteOptimistic,
  removeNoteOptimistic,
} from "../store/slices/notesSlice.js";
import { addNotification } from "../store/slices/uiSlice.js";
import { useErrorHandler } from "../hooks/useErrorHandler.js";
// Note: filterNotes, sortNotes, getNotesStats, getAllTags are now handled by memoized selectors

export const useNotes = () => {
  const dispatch = useAppDispatch();
  const notes = useAppSelector((state) => state.notes.notes);
  const loading = useAppSelector(selectNotesLoading);
  const error = useAppSelector(selectNotesError);
  const { filters, sortBy, viewMode, showArchived } = useAppSelector(
    (state) => state.notes
  );
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { handleApiError } = useErrorHandler("useNotes");

  // Use memoized selectors for better performance
  const filteredNotes = useAppSelector(selectSortedNotes);
  const notesStats = useAppSelector(selectNotesStats);
  const allTags = useAppSelector(selectAllTags);
  const pinnedNotes = useAppSelector(selectPinnedNotes);

  // Load notes on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
    }
  }, [isAuthenticated, showArchived]);

  // Load notes function
  const loadNotes = useCallback(async () => {
    try {
      await dispatch(fetchNotes({ showArchived })).unwrap();
    } catch (error) {
      handleApiError(error, "load_notes", () => loadNotes());
    }
  }, [dispatch, showArchived, handleApiError]);

  // Create note function
  const addNote = useCallback(
    async (noteData) => {
      try {
        // Optimistic update
        const tempNote = {
          _id: `temp-${Date.now()}`,
          ...noteData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          archived: false,
          pinned: false,
        };
        dispatch(addNoteOptimistic(tempNote));

        const result = await dispatch(createNote(noteData)).unwrap();

        dispatch(
          addNotification({
            message: "Note created successfully! 🎉",
            type: "success",
          })
        );

        return { success: true, data: result };
      } catch (error) {
        dispatch(
          addNotification({
            message: error || "Failed to create note",
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Update note function
  const editNote = useCallback(
    async (id, noteData) => {
      try {
        // Optimistic update
        const existingNote = notes.find((note) => note._id === id);
        if (existingNote) {
          const updatedNote = {
            ...existingNote,
            ...noteData,
            updatedAt: new Date().toISOString(),
          };
          dispatch(updateNoteOptimistic(updatedNote));
        }

        const result = await dispatch(updateNote({ id, noteData })).unwrap();

        dispatch(
          addNotification({
            message: "Note updated successfully! ✨",
            type: "success",
          })
        );

        return { success: true, data: result };
      } catch (error) {
        dispatch(
          addNotification({
            message: error || "Failed to update note",
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch, notes]
  );

  // Delete note function
  const removeNote = useCallback(
    async (id) => {
      try {
        const noteToDelete = notes.find((note) => note._id === id);

        // Optimistic update
        dispatch(removeNoteOptimistic(id));

        await dispatch(deleteNote(id)).unwrap();

        dispatch(
          addNotification({
            message: "Note deleted! 🗑️",
            type: "success",
          })
        );

        return { success: true, deletedNote: noteToDelete };
      } catch (error) {
        // Revert optimistic update on error
        if (noteToDelete) {
          dispatch(addNoteOptimistic(noteToDelete));
        }

        dispatch(
          addNotification({
            message: error || "Failed to delete note",
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch, notes]
  );

  // Archive/unarchive note function
  const toggleArchive = useCallback(
    async (id, archived) => {
      try {
        const result = await dispatch(archiveNote({ id, archived })).unwrap();

        dispatch(
          addNotification({
            message: archived ? "Note archived! 🗄️" : "Note unarchived! 📤",
            type: "success",
          })
        );

        return { success: true, data: result };
      } catch (error) {
        dispatch(
          addNotification({
            message:
              error || `Failed to ${archived ? "archive" : "unarchive"} note`,
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Pin/unpin note function
  const togglePin = useCallback(
    async (id, pinned) => {
      try {
        const result = await dispatch(pinNote({ id, pinned })).unwrap();

        dispatch(
          addNotification({
            message: pinned ? "Note pinned! 📍" : "Note unpinned! 📌",
            type: "success",
          })
        );

        return { success: true, data: result };
      } catch (error) {
        dispatch(
          addNotification({
            message: error || `Failed to ${pinned ? "pin" : "unpin"} note`,
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch]
  );

  // Clear error function
  const clearNotesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Note: filteredNotes is now provided by the memoized selector above

  // Note: notesStats is now provided by the memoized selector above

  // Note: allTags is now provided by the memoized selector above

  // Get notes by category
  const getNotesByCategory = useCallback(
    (category) => {
      return notes.filter((note) => note.category === category);
    },
    [notes]
  );

  // Get notes by priority
  const getNotesByPriority = useCallback(
    (priority) => {
      return notes.filter((note) => note.priority === priority);
    },
    [notes]
  );

  // Get pinned notes
  const getPinnedNotes = useCallback(() => {
    return notes.filter((note) => note.pinned && !note.archived);
  }, [notes]);

  // Get recent notes (last 7 days)
  const getRecentNotes = useCallback(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return notes.filter((note) => {
      const noteDate = new Date(note.createdAt);
      return noteDate >= weekAgo && !note.archived;
    });
  }, [notes]);

  // Search notes
  const searchNotes = useCallback(
    (query) => {
      if (!query.trim()) return notes;

      const lowercaseQuery = query.toLowerCase();
      return notes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowercaseQuery) ||
          note.content.toLowerCase().includes(lowercaseQuery) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
    },
    [notes]
  );

  // Bulk operations
  const bulkArchive = useCallback(
    async (noteIds, archived = true) => {
      try {
        // Optimistic updates
        noteIds.forEach((id) => {
          const note = notes.find((n) => n._id === id);
          if (note) {
            dispatch(updateNoteOptimistic({ ...note, archived }));
          }
        });

        // This would call a bulk API endpoint
        await Promise.all(
          noteIds.map((id) => dispatch(archiveNote({ id, archived })).unwrap())
        );

        dispatch(
          addNotification({
            message: `${noteIds.length} notes ${
              archived ? "archived" : "unarchived"
            }!`,
            type: "success",
          })
        );

        return { success: true };
      } catch (error) {
        dispatch(
          addNotification({
            message: "Bulk operation failed",
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch, notes]
  );

  const bulkDelete = useCallback(
    async (noteIds) => {
      try {
        // Optimistic updates
        noteIds.forEach((id) => {
          dispatch(removeNoteOptimistic(id));
        });

        await Promise.all(
          noteIds.map((id) => dispatch(deleteNote(id)).unwrap())
        );

        dispatch(
          addNotification({
            message: `${noteIds.length} notes deleted!`,
            type: "success",
          })
        );

        return { success: true };
      } catch (error) {
        dispatch(
          addNotification({
            message: "Bulk delete failed",
            type: "error",
          })
        );
        return { success: false, error };
      }
    },
    [dispatch]
  );

  return {
    // State
    notes,
    loading,
    error,
    filters,
    sortBy,
    viewMode,
    showArchived,

    // Actions
    loadNotes,
    addNote,
    editNote,
    removeNote,
    toggleArchive,
    togglePin,
    clearNotesError,

    // Computed values (using memoized selectors)
    filteredNotes,
    notesStats,
    allTags,
    pinnedNotes,

    // Utilities
    getNotesByCategory,
    getNotesByPriority,
    getPinnedNotes,
    getRecentNotes,
    searchNotes,
    bulkArchive,
    bulkDelete,
  };
};
