import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";

// Memoized note card component
export const MemoizedNoteCard = memo(
  ({ note, onEdit, onDelete, onArchive, onPin, className = "" }) => {
    const cardVariants = useMemo(
      () => ({
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        hover: { y: -5, scale: 1.02 },
      }),
      []
    );

    const formattedDate = useMemo(() => {
      return new Date(note.updatedAt).toLocaleDateString();
    }, [note.updatedAt]);

    const truncatedContent = useMemo(() => {
      return note.content.length > 150
        ? note.content.substring(0, 150) + "..."
        : note.content;
    }, [note.content]);

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`note-card ${className}`}
        layout
      >
        {/* Note card content would go here */}
        <div className="p-4 rounded-xl backdrop-blur-xl border border-white/20 bg-white/10">
          <h3 className="font-semibold text-white mb-2">{note.title}</h3>
          <p className="text-white/70 text-sm mb-3">{truncatedContent}</p>
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>{formattedDate}</span>
            <div className="flex gap-2">
              {note.pinned && <span>📌</span>}
              {note.archived && <span>🗄️</span>}
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better memoization
    return (
      prevProps.note.id === nextProps.note.id &&
      prevProps.note.title === nextProps.note.title &&
      prevProps.note.content === nextProps.note.content &&
      prevProps.note.updatedAt === nextProps.note.updatedAt &&
      prevProps.note.pinned === nextProps.note.pinned &&
      prevProps.note.archived === nextProps.note.archived
    );
  }
);

// Memoized filter component
export const MemoizedFilter = memo(
  ({ label, value, options, onChange, icon }) => {
    const handleChange = useMemo(
      () => (e) => onChange(e.target.value),
      [onChange]
    );

    return (
      <div className="filter-component">
        <label className="block text-sm font-medium text-white/80 mb-2">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </label>
        <select
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg backdrop-blur-xl border border-white/20 bg-white/10 text-white focus:border-white/40"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

// Memoized search component
export const MemoizedSearch = memo(
  ({ value, onChange, placeholder = "Search notes...", debounceMs = 300 }) => {
    const [localValue, setLocalValue] = React.useState(value);
    const timeoutRef = React.useRef();

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleChange = useMemo(
      () => (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Debounce the onChange call
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          onChange(newValue);
        }, debounceMs);
      },
      [onChange, debounceMs]
    );

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 rounded-lg backdrop-blur-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:border-white/40"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    );
  }
);

// Memoized tag list component
export const MemoizedTagList = memo(({ tags, onTagClick, maxTags = 5 }) => {
  const displayTags = useMemo(() => {
    if (!tags || !Array.isArray(tags)) return [];
    return tags.slice(0, maxTags);
  }, [tags, maxTags]);

  const remainingCount = useMemo(() => {
    return tags && tags.length > maxTags ? tags.length - maxTags : 0;
  }, [tags, maxTags]);

  if (!displayTags.length) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className="px-2 py-1 text-xs rounded-full bg-white/20 text-white/80 hover:bg-white/30 transition-colors"
        >
          #{tag}
        </button>
      ))}
      {remainingCount > 0 && (
        <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/60">
          +{remainingCount}
        </span>
      )}
    </div>
  );
});

// Memoized stats component
export const MemoizedStatsCard = memo(
  ({ title, value, icon, trend, className = "" }) => {
    const formattedValue = useMemo(() => {
      if (typeof value === "number") {
        return value.toLocaleString();
      }
      return value;
    }, [value]);

    return (
      <div
        className={`stats-card p-4 rounded-xl backdrop-blur-xl border border-white/20 bg-white/10 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">{title}</p>
            <p className="text-white text-2xl font-bold">{formattedValue}</p>
          </div>
          {icon && <div className="text-3xl opacity-60">{icon}</div>}
        </div>
        {trend && <div className="mt-2 text-xs text-white/50">{trend}</div>}
      </div>
    );
  }
);

// Memoized empty state component
export const MemoizedEmptyState = memo(
  ({ icon, title, description, action, className = "" }) => {
    return (
      <div className={`text-center py-12 ${className}`}>
        {icon && <div className="text-6xl mb-4 opacity-60">{icon}</div>}
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">{description}</p>
        {action}
      </div>
    );
  }
);

MemoizedNoteCard.displayName = "MemoizedNoteCard";
MemoizedFilter.displayName = "MemoizedFilter";
MemoizedSearch.displayName = "MemoizedSearch";
MemoizedTagList.displayName = "MemoizedTagList";
MemoizedStatsCard.displayName = "MemoizedStatsCard";
MemoizedEmptyState.displayName = "MemoizedEmptyState";
