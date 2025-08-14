import React from "react";
import { motion } from "framer-motion";
import { noteVariants } from "../../utils/animations.js";
import { getPriorityColor } from "../../utils/colorUtils.js";
import { formatDate } from "../../utils/dateUtils.js";
import { CATEGORY_COLORS } from "../../utils/constants.js";

const NoteCard = ({
  note,
  viewMode = "grid",
  onEdit,
  onDelete,
  onArchive,
  onPin,
  onConfirmDelete,
}) => {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(note);
  };

  const handlePin = (e) => {
    e.stopPropagation();
    onPin?.(note._id, !note.pinned);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    onArchive?.(note._id, !note.archived);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onConfirmDelete?.(note._id);
  };

  return (
    <motion.div
      key={note._id}
      variants={noteVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover="hover"
      layout
      className={`p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-xl relative ${
        viewMode === "list" ? "flex items-center gap-4" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${note.color}20, rgba(255,255,255,0.1))`,
        borderColor: note.color + "40",
      }}
      role="article"
      aria-labelledby={`note-title-${note._id}`}
    >
      {/* Priority Indicator */}
      <div
        className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px]"
        style={{
          borderLeftColor: "transparent",
          borderBottomColor: getPriorityColor(note.priority),
        }}
        aria-label={`Priority: ${note.priority}`}
      />

      {/* Pin Indicator */}
      {note.pinned && (
        <div
          className="absolute top-2 left-2 text-yellow-400"
          aria-label="Pinned note"
        >
          📍
        </div>
      )}

      {/* Note Content */}
      <div className={viewMode === "list" ? "flex-1" : ""}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <motion.h3
            id={`note-title-${note._id}`}
            className="text-lg font-bold flex items-center gap-2"
            whileHover={{ x: 5 }}
          >
            <span className="text-xl" aria-label={`Mood: ${note.mood}`}>
              {note.mood}
            </span>
            {note.title}
          </motion.h3>
          <span
            className="px-2 py-1 rounded-full text-xs font-bold text-white"
            style={{
              backgroundColor: CATEGORY_COLORS[note.category] || note.color,
            }}
          >
            {note.category}
          </span>
        </div>

        {/* Content */}
        <p className="mb-3 text-sm opacity-80 line-clamp-3">{note.content}</p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {note.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full text-xs bg-white/20 border border-white/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs opacity-60">
          <span title={new Date(note.createdAt).toLocaleString()}>
            {formatDate(note.createdAt)}
          </span>
          <div className="flex gap-2">
            <motion.button
              onClick={handleEdit}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-blue-500/20 border border-blue-500/50 hover:bg-blue-500/30 transition-colors"
              aria-label="Edit note"
              title="Edit note"
            >
              ✏️
            </motion.button>
            <motion.button
              onClick={handlePin}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30 transition-colors"
              aria-label={note.pinned ? "Unpin note" : "Pin note"}
              title={note.pinned ? "Unpin note" : "Pin note"}
            >
              📌
            </motion.button>
            <motion.button
              onClick={handleArchive}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30 transition-colors"
              aria-label={note.archived ? "Unarchive note" : "Archive note"}
              title={note.archived ? "Unarchive note" : "Archive note"}
            >
              🗄️
            </motion.button>
            <motion.button
              onClick={handleDelete}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-colors"
              aria-label="Delete note"
              title="Delete note"
            >
              🗑️
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default NoteCard;
