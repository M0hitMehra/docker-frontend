import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { slideInVariants } from "../../utils/animations.js";
import { useFilters } from "../../hooks/useFilters.js";
import { useNotes } from "../../hooks/useNotes.js";
import { useUI } from "../../hooks/useUI.js";
import { getPriorityColor } from "../../utils/colorUtils.js";
import { CATEGORIES, PRIORITIES } from "../../utils/constants.js";
import { Input, Button } from "../ui/index.js";

const Sidebar = ({ isOpen = false, onClose, onExport, className = "" }) => {
  const {
    filters,
    sortBy,
    showArchived,
    setSearch,
    setCategory,
    setPriority,
    setTag,
    updateSortBy,
    toggleShowArchived,
    hasActiveFilters,
    resetFilters,
  } = useFilters();

  const { allTags, notesStats } = useNotes();
  const { darkMode, isMobile } = useUI();

  const handleExport = () => {
    onExport?.();
    if (isMobile) {
      onClose?.();
    }
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case "search":
        setSearch(value);
        break;
      case "category":
        setCategory(value);
        break;
      case "priority":
        setPriority(value);
        break;
      case "tag":
        setTag(value);
        break;
      case "sort":
        updateSortBy(value);
        break;
      default:
        break;
    }
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div
        className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <label className="block mb-2 text-white/80">🔍 Search</label>
        <Input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          placeholder="Search notes, tags..."
          variant="filled"
          fullWidth
        />
      </div>

      {/* Category Filter */}
      <div
        className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <label className="block mb-2 text-white/80">📁 Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white"
        >
          {CATEGORIES.map((cat) => (
            <option
              key={cat}
              value={cat}
              style={{
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#333",
              }}
            >
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Filter */}
      <div
        className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <label className="block mb-2 text-white/80">🏷️ Tags</label>
        <select
          value={filters.tag}
          onChange={(e) => handleFilterChange("tag", e.target.value)}
          className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white"
        >
          <option
            value="All"
            style={{
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#333",
            }}
          >
            All Tags
          </option>
          {allTags.map((tag) => (
            <option
              key={tag}
              value={tag}
              style={{
                background: darkMode ? "#333" : "#fff",
                color: darkMode ? "#fff" : "#333",
              }}
            >
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div
        className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <label className="block mb-2 text-white/80">🔥 Priority</label>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => handleFilterChange("priority", p)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                filters.priority === p
                  ? "bg-white/20 border-white/60"
                  : "border border-white/20 hover:bg-white/10"
              }`}
              style={{
                background:
                  filters.priority === p
                    ? getPriorityColor(p === "All" ? "medium" : p) + "40"
                    : "rgba(255,255,255,0.1)",
              }}
            >
              {p === "All" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div
        className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <label className="block mb-2 text-white/80">📈 Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white"
        >
          <option
            value="createdAt"
            style={{
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#333",
            }}
          >
            Latest
          </option>
          <option
            value="title"
            style={{
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#333",
            }}
          >
            Title
          </option>
          <option
            value="priority"
            style={{
              background: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#333",
            }}
          >
            Priority
          </option>
        </select>
      </div>

      {/* Stats Display */}
      <div
        className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <label className="block mb-2 text-white/80">📊 Stats</label>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Total Notes:</span>
            <span className="text-white font-medium">{notesStats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Categories:</span>
            <span className="text-white font-medium">
              {notesStats.categories}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">High Priority:</span>
            <span className="text-red-400 font-medium">{notesStats.high}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Pinned:</span>
            <span className="text-yellow-400 font-medium">
              {notesStats.pinned}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Archived:</span>
            <span className="text-white/60 font-medium">
              {notesStats.archived}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="medium"
            fullWidth
            onClick={resetFilters}
          >
            🗑️ Clear Filters
          </Button>
        )}

        {/* Toggle Archived */}
        <Button
          variant="secondary"
          size="medium"
          fullWidth
          onClick={toggleShowArchived}
        >
          {showArchived ? "📤 Show Active Notes" : "🗄️ Show Archived Notes"}
        </Button>

        {/* Export Notes */}
        <Button
          variant="secondary"
          size="medium"
          fullWidth
          onClick={handleExport}
        >
          📁 Export Notes
        </Button>
      </div>
    </div>
  );

  // Mobile Sidebar (Overlay)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.aside
              variants={slideInVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 w-80 bg-white/10 backdrop-blur-xl border-r border-white/20 z-50 p-4 overflow-y-auto"
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={onClose}
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className={`hidden sm:block w-64 ${className}`}
    >
      <SidebarContent />
    </motion.aside>
  );
};

export default Sidebar;
