import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NoteForm, NotesGrid, NotesList } from "../components/notes/index.js";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "../components/ui/index.js";
import { useNotes } from "../hooks/useNotes.js";
import { useFilters } from "../hooks/useFilters.js";
import { useUI } from "../hooks/useUI.js";
import { useNotifications } from "../hooks/useNotifications.js";
import { fadeInVariants } from "../utils/animations.js";

const NotesPage = () => {
  const {
    notes,
    loading,
    error,
    filteredNotes,
    loadNotes,
    addNote,
    editNote,
    removeNote,
    toggleArchive,
    togglePin,
    clearNotesError,
  } = useNotes();

  const { viewMode, showArchived } = useFilters();
  const {
    confirmDelete,
    setConfirmDelete,
    clearConfirmDelete,
    undoDelete,
    clearUndoDelete,
  } = useUI();
  const { showNoteDeleted } = useNotifications();

  const [editingNote, setEditingNote] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearNotesError();
    };
  }, [clearNotesError]);

  const handleNoteSubmit = async (noteData, noteId = null) => {
    setFormLoading(true);

    try {
      let success;
      if (noteId) {
        // Update existing note
        const result = await editNote(noteId, noteData);
        success = result.success;
      } else {
        // Create new note
        const result = await addNote(noteData);
        success = result.success;
      }

      if (success) {
        setEditingNote(null);
        return true;
      }
      return false;
    } finally {
      setFormLoading(false);
    }
  };

  const handleNoteEdit = (note) => {
    setEditingNote(note);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNoteDelete = (noteId) => {
    setConfirmDelete(noteId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    const result = await removeNote(confirmDelete);
    if (result.success && result.deletedNote) {
      // Show undo notification
      showNoteDeleted(() => handleUndoDelete(result.deletedNote));
    }

    clearConfirmDelete();
  };

  const handleUndoDelete = async (deletedNote) => {
    // Recreate the note
    await addNote({
      title: deletedNote.title,
      content: deletedNote.content,
      category: deletedNote.category,
      priority: deletedNote.priority,
      mood: deletedNote.mood,
      tags: deletedNote.tags,
      color: deletedNote.color,
    });

    clearUndoDelete();
  };

  const handleNoteArchive = async (noteId, archived) => {
    await toggleArchive(noteId, archived);
  };

  const handleNotePin = async (noteId, pinned) => {
    await togglePin(noteId, pinned);
  };

  const handleFormCancel = () => {
    setEditingNote(null);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find note being deleted for confirmation modal
  const noteToDelete = confirmDelete
    ? notes.find((note) => note._id === confirmDelete)
    : null;

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Note Form */}
      <NoteForm
        note={editingNote}
        onSubmit={handleNoteSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
      />

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
        >
          <p className="text-red-400">{error}</p>
          <button
            onClick={clearNotesError}
            className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Notes Display */}
      {viewMode === "grid" ? (
        <NotesGrid
          notes={filteredNotes}
          loading={loading}
          viewMode={viewMode}
          onEdit={handleNoteEdit}
          onDelete={handleNoteDelete}
          onArchive={handleNoteArchive}
          onPin={handleNotePin}
          onConfirmDelete={handleNoteDelete}
          onCreateNote={handleCreateNote}
          emptyStateMessage={
            showArchived ? "No archived notes found" : "No notes found"
          }
          emptyStateSubMessage={
            showArchived
              ? "Archive some notes to see them here!"
              : "Create your first gorgeous note above!"
          }
        />
      ) : (
        <NotesList
          notes={filteredNotes}
          loading={loading}
          onEdit={handleNoteEdit}
          onDelete={handleNoteDelete}
          onArchive={handleNoteArchive}
          onPin={handleNotePin}
          onConfirmDelete={handleNoteDelete}
          onCreateNote={handleCreateNote}
          emptyStateMessage={
            showArchived ? "No archived notes found" : "No notes found"
          }
          emptyStateSubMessage={
            showArchived
              ? "Archive some notes to see them here!"
              : "Create your first gorgeous note above!"
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={clearConfirmDelete}
        title="Delete Note"
        size="medium"
      >
        <ModalHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Note?</h3>
          </div>
        </ModalHeader>

        <ModalBody>
          {noteToDelete && (
            <div className="text-center space-y-4">
              <p className="text-white/80">
                Are you sure you want to delete "{noteToDelete.title}"?
              </p>
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">
                  This action cannot be undone, but you'll have a few seconds to
                  undo it.
                </p>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={clearConfirmDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete Note
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
};

export default NotesPage;
