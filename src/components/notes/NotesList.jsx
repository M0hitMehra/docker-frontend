import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoteCard from "./NoteCard.jsx";
import { containerVariants } from "../../utils/animations.js";
import { LoadingSpinner } from "../ui/index.js";
import { formatDate } from "../../utils/dateUtils.js";
import { getPriorityColor } from "../../utils/colorUtils.js";

const NotesList = ({
  notes = [],
  loading = false,
  onEdit,
  onDelete,
  onArchive,
  onPin,
  onConfirmDelete,
  emptyStateMessage = "No notes found",
  emptyStateSubMessage = "Create your first gorgeous note above!",
  onCreateNote,
  showCompactView = false,
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

  // Compact list view
  if (showCompactView) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`space-y-2 ${className}`}
      >
        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => onEdit?.(note)}
            >
              {/* Priority Indicator */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getPriorityColor(note.priority) }}
                title={`Priority: ${note.priority}`}
              />

              {/* Mood */}
              <span className="text-lg flex-shrink-0">{note.mood}</span>

              {/* Title and Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">
                  {note.title}
                </h4>
                <p className="text-sm text-white/60 truncate">{note.content}</p>
              </div>

              {/* Category */}
              <span className="px-2 py-1 rounded-full text-xs bg-white/20 text-white/80 flex-shrink-0">
                {note.category}
              </span>

              {/* Date */}
              <span className="text-xs text-white/50 flex-shrink-0">
                {formatDate(note.createdAt)}
              </span>

              {/* Pin indicator */}
              {note.pinned && (
                <span className="text-yellow-400 flex-shrink-0">📍</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Regular list view using NoteCard
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-4 ${className}`}
    >
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            viewMode="list"
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

export default NotesList;
