import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoteCard from "./NoteCard.jsx";
import { containerVariants } from "../../utils/animations.js";
import { LoadingSpinner } from "../ui/index.js";

const NotesGrid = ({
  notes = [],
  loading = false,
  viewMode = "grid",
  onEdit,
  onDelete,
  onArchive,
  onPin,
  onConfirmDelete,
  emptyStateMessage = "No notes found",
  emptyStateSubMessage = "Create your first gorgeous note above!",
  onCreateNote,
  className = "",
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner
          size="large"
          text="Loading your gorgeous notes..."
          color="white"
        />
      </div>
    );
  }

  // Empty state
  if (!loading && notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
        role="alert"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          📝
        </motion.div>
        <h3 className="text-xl font-bold mb-2 opacity-80">
          {emptyStateMessage}
        </h3>
        <p className="text-base opacity-60 mb-4">{emptyStateSubMessage}</p>
        {onCreateNote && (
          <motion.button
            onClick={onCreateNote}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl backdrop-blur-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            ✨ Create Note
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Notes grid/list
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-4 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      } ${className}`}
    >
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            viewMode={viewMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchive={onArchive}
            onPin={onPin}
            onConfirmDelete={onConfirmDelete}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotesGrid;
