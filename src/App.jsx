import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [mood, setMood] = useState("😊");
  const [tags, setTags] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [darkMode, setDarkMode] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showStats, setShowStats] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#667eea");
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [undoDelete, setUndoDelete] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const headerY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  const categories = ["All", "Work", "Personal", "Ideas", "Others"];
  const priorities = ["All", "high", "medium", "low"];
  const colors = [
    "#667eea",
    "#4299e1",
    "#48bb78",
    "#9f7aea",
    "#ed8936",
    "#e53e3e",
    "#38b2ac",
    "#d69e2e",
  ];
  const moods = ["😊", "🤔", "💡", "🔥", "⚡", "🌟", "🎯", "💪", "🚀", "❤️"];
  const categoryColors = {
    Work: "#4299e1",
    Personal: "#48bb78",
    Ideas: "#9f7aea",
    Others: "#a0aec0",
  };

  useEffect(() => {
    fetchNotes();
    const savedDarkMode = localStorage.getItem("gorgeousDarkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        resetForm();
        formRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        document.querySelector('input[placeholder*="Search notes"]').focus();
      }
      if (e.key === "Escape" && confirmDelete) {
        setConfirmDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem("gorgeousDarkMode", JSON.stringify(darkMode));
    document.documentElement.style.setProperty(
      "--theme-mode",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

 const fetchNotes = async () => {
  setIsLoading(true);
  try {
    console.log('🔄 Fetching from:', `${import.meta.env.VITE_API_URL}/api/notes`);
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notes${
        showArchived ? "?archived=true" : ""
      }`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      }
    );
    
     
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
     
    // Handle both old and new response formats
    const notes = result.data || result;
    setNotes(notes);
    setError(null);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    setError(`Unable to load notes: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      showNotification("Title and content are required", "error");
      return;
    }

    setIsLoading(true);
    try {
      const noteData = {
        title,
        content,
        category: category || "Others",
        priority: priority || "medium",
        mood: mood || "😊",
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        color: selectedColor || categoryColors[category] || "#667eea",
      };

      const url = editId
        ? `${import.meta.env.VITE_API_URL}/api/notes/${editId}`
        : `${import.meta.env.VITE_API_URL}/api/notes`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });

      if (!response.ok)
        throw new Error(
          editId ? "Failed to update note" : "Failed to add note"
        );

      showNotification(
        editId
          ? "Note updated successfully! ✨"
          : "Note created successfully! 🎉"
      );
      resetForm();
      fetchNotes();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (id, archived) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}/archive`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: !archived }),
        }
      );
      if (!response.ok)
        throw new Error(
          archived ? "Failed to unarchive note" : "Failed to archive note"
        );
      showNotification(archived ? "Note unarchived! 📤" : "Note archived! 🗄️");
      fetchNotes();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handlePin = async (id, pinned) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}/pin`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinned: !pinned }),
        }
      );
      if (!response.ok)
        throw new Error(pinned ? "Failed to unpin note" : "Failed to pin note");
      showNotification(pinned ? "Note unpinned! 📌" : "Note pinned! 📍");
      fetchNotes();
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notes/export`
      );
      if (!response.ok) throw new Error("Failed to export notes");
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gorgeous-notes-${new Date().toISOString()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification("Notes exported successfully! 📁");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("");
    setPriority("medium");
    setMood("😊");
    setTags("");
    setSelectedColor("#667eea");
    setEditId(null);
    setIsTyping(false);
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setPriority(note.priority || "medium");
    setMood(note.mood || "😊");
    setTags(note.tags?.join(", ") || "");
    setSelectedColor(note.color || categoryColors[note.category] || "#667eea");
    setEditId(note._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const note = notes.find((n) => n._id === id);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notes/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete note");
      setUndoDelete({ id, note });
      showNotification(
        "Note deleted! 🗑️ Undo available for 5 seconds.",
        "success"
      );
      fetchNotes();
      setTimeout(() => setUndoDelete(null), 5000);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setIsLoading(false);
      setConfirmDelete(null);
    }
  };

  const handleUndoDelete = async () => {
    if (!undoDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(undoDelete.note),
        }
      );
      if (!response.ok) throw new Error("Failed to restore note");
      showNotification("Note restored! 🎉");
      fetchNotes();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setIsLoading(false);
      setUndoDelete(null);
    }
  };

  const allTags = [...new Set(notes.flatMap((note) => note.tags || []))].sort();
  const filteredNotes = notes
    .filter((note) => {
      if (showArchived && !note.archived) return false;
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        filterCategory === "All" || note.category === filterCategory;
      const matchesPriority =
        filterPriority === "All" || note.priority === filterPriority;
      const matchesTag = filterTag === "All" || note.tags?.includes(filterTag);
      return matchesSearch && matchesCategory && matchesPriority && matchesTag;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (
          (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
        );
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const stats = {
    total: notes.length,
    categories: [...new Set(notes.map((n) => n.category))].length,
    high: notes.filter((n) => n.priority === "high").length,
    pinned: notes.filter((n) => n.pinned).length,
    archived: notes.filter((n) => n.archived).length,
    filtered: filteredNotes.length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const noteVariants = {
    hidden: { y: 50, opacity: 0, rotateX: 45 },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      transition: { type: "spring", stiffness: 100 },
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      z: 50,
      transition: { type: "spring", stiffness: 400 },
    },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#26de81";
      default:
        return "#778ca3";
    }
  };

  return (
    <div
      ref={containerRef}
      className="app-container h-screen overflow-y-auto relative"
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 100%)",
        color: darkMode ? "#ffffff" : "#333333",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 100 + 30,
              height: Math.random() * 100 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${
                colors[Math.floor(Math.random() * colors.length)]
              }, ${colors[Math.floor(Math.random() * colors.length)]})`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 sm:right-auto sm:left-auto sm:mx-auto z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl max-w-sm"
            style={{
              background:
                notification.type === "error"
                  ? "rgba(255, 59, 48, 0.9)"
                  : "rgba(52, 199, 89, 0.9)",
              border: `1px solid ${
                notification.type === "error" ? "#ff3b30" : "#34c759"
              }`,
              color: "white",
            }}
          >
            {notification.message}
            {undoDelete && notification.message.includes("Undo") && (
              <button onClick={handleUndoDelete} className="underline ml-2">
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.header
          style={{ y: headerY }}
          className="flex items-center justify-between mb-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <h1 className="text-4xl sm:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              GORGEOUS
            </h1>
            <button
              className="sm:hidden p-2 rounded-full backdrop-blur-xl border border-white/20"
              onClick={() => setShowSidebar(true)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
          </motion.div>
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 sm:p-3 rounded-full backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "🌞" : "🌙"}
            </motion.button>
            <motion.button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 sm:p-3 rounded-full backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
              aria-label="Toggle view mode"
            >
              {viewMode === "grid" ? "📋" : "⊞"}
            </motion.button>
          </div>
        </motion.header>

        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 z-50 p-4 sm:hidden"
            >
              <button
                className="absolute top-4 right-4 text-2xl"
                onClick={() => setShowSidebar(false)}
                aria-label="Close sidebar"
              >
                ×
              </button>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">🔍 Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes, tags..."
                    className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="block mb-2">📁 Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    {categories.map((cat) => (
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
                <div>
                  <label className="block mb-2">🏷️ Tags</label>
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
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
                <div>
                  <label className="block mb-2">🔥 Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilterPriority(p)}
                        className={`px-3 py-1 rounded-full ${
                          filterPriority === p
                            ? "bg-white/20 border-white/60"
                            : "border-white/20"
                        }`}
                        style={{
                          background:
                            filterPriority === p
                              ? getPriorityColor(p === "All" ? "medium" : p) +
                                "40"
                              : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {p === "All" ? "All" : p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block mb-2">📈 Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
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
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="w-full py-2 rounded-xl backdrop-blur-xl border border-white/20"
                  style={{
                    background: showArchived
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  {showArchived ? "Show Active Notes" : "Show Archived Notes"}
                </button>
                <button
                  onClick={handleExport}
                  className="w-full py-2 rounded-xl backdrop-blur-xl border border-white/20"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  📁 Export Notes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-6">
          <motion.aside
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:block w-64 space-y-6"
          >
            <div
              className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <label className="block mb-2">🔍 Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, tags..."
                className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </div>
            <div
              className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <label className="block mb-2">📁 Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                {categories.map((cat) => (
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
            <div
              className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <label className="block mb-2">🏷️ Tags</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                style={{ background: "rgba(255,255,255,0.1)" }}
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
            <div
              className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <label className="block mb-2">🔥 Priority</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-3 py-1 rounded-full ${
                      filterPriority === p
                        ? "bg-white/20 border-white/60"
                        : "border-white/20"
                    }`}
                    style={{
                      background:
                        filterPriority === p
                          ? getPriorityColor(p === "All" ? "medium" : p) + "40"
                          : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {p === "All" ? "All" : p}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="p-4 rounded-2xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <label className="block mb-2">📈 Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                style={{ background: "rgba(255,255,255,0.1)" }}
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
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-full py-2 rounded-xl backdrop-blur-xl border border-white/20"
              style={{
                background: showStats
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              📊 {showStats ? "Hide" : "Show"} Stats
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="w-full py-2 rounded-xl backdrop-blur-xl border border-white/20"
              style={{
                background: showArchived
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.1)",
              }}
            >
              {showArchived ? "Show Active Notes" : "Show Archived Notes"}
            </button>
            <button
              onClick={handleExport}
              className="w-full py-2 rounded-xl backdrop-blur-xl border border-white/20"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              📁 Export Notes
            </button>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-2xl backdrop-blur-xl border border-white/20 mt-4"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                <div className="space-y-2 text-sm">
                  <div>Total Notes: {stats.total}</div>
                  <div>Categories: {stats.categories}</div>
                  <div>High Priority: {stats.high}</div>
                  <div>Pinned: {stats.pinned}</div>
                  <div>Archived: {stats.archived}</div>
                  <div>Filtered: {stats.filtered}</div>
                </div>
              </motion.div>
            )}
          </motion.aside>

          <main className="flex-1">
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 sm:p-6 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 1000);
                  }}
                  placeholder="✍️ Note title..."
                  className="px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none text-lg font-semibold"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  required
                  aria-label="Note title"
                />
                <motion.textarea
                  whileFocus={{ scale: 1.02 }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="📝 Write something amazing..."
                  className="px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none text-base min-h-[100px] resize-y"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  required
                  aria-label="Note content"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                    aria-label="Select category"
                  >
                    <option
                      value=""
                      style={{
                        background: darkMode ? "#333" : "#fff",
                        color: darkMode ? "#fff" : "#333",
                      }}
                    >
                      Select Category
                    </option>
                    {categories.slice(1).map((cat) => (
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
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                    aria-label="Select priority"
                  >
                    <option
                      value="low"
                      style={{
                        background: darkMode ? "#333" : "#fff",
                        color: darkMode ? "#fff" : "#333",
                      }}
                    >
                      🟢 Low
                    </option>
                    <option
                      value="medium"
                      style={{
                        background: darkMode ? "#333" : "#fff",
                        color: darkMode ? "#fff" : "#333",
                      }}
                    >
                      🟡 Medium
                    </option>
                    <option
                      value="high"
                      style={{
                        background: darkMode ? "#333" : "#fff",
                        color: darkMode ? "#fff" : "#333",
                      }}
                    >
                      🔴 High
                    </option>
                  </select>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                    aria-label="Tags"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm">🎨 Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <motion.button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-8 h-8 rounded-full border-2 ${
                            selectedColor === color
                              ? "border-white"
                              : "border-transparent"
                          }`}
                          style={{ background: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">😊 Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {moods.map((m) => (
                        <motion.button
                          key={m}
                          type="button"
                          onClick={() => setMood(m)}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                          className={`text-xl p-2 rounded-full ${
                            mood === m ? "bg-white/20" : ""
                          }`}
                          aria-label={`Select mood ${m}`}
                        >
                          {m}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 rounded-xl font-bold text-base text-white shadow-xl"
                    style={{
                      background: `linear-gradient(45deg, ${selectedColor}, ${selectedColor}dd)`,
                    }}
                    disabled={isLoading}
                    aria-label={editId ? "Update note" : "Create note"}
                  >
                    <motion.span
                      animate={isTyping ? { y: [-2, 2, -2] } : {}}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    >
                      {isLoading
                        ? "Saving..."
                        : editId
                        ? "✏️ Update Note"
                        : "✨ Create Note"}
                    </motion.span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={resetForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl backdrop-blur-xl border border-white/20"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                    aria-label="Clear form"
                  >
                    🗑️ Clear
                  </motion.button>
                </div>
              </div>
            </motion.form>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl backdrop-blur-xl border border-red-500/50 text-center"
                style={{ background: "rgba(255, 59, 48, 0.2)" }}
                role="alert"
              >
                {error}{" "}
                <button onClick={fetchNotes} className="underline ml-2">
                  Retry
                </button>
              </motion.div>
            )}

            {isLoading && !error && (
              <motion.div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl backdrop-blur-xl border border-white/20 animate-pulse"
                  >
                    <div className="h-6 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  </div>
                ))}
              </motion.div>
            )}

            {!isLoading && filteredNotes.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                <AnimatePresence>
                  {filteredNotes.map((note) => (
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
                      <div
                        className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px]"
                        style={{
                          borderLeftColor: "transparent",
                          borderBottomColor: getPriorityColor(note.priority),
                        }}
                      />
                      {note.pinned && (
                        <div
                          className="absolute top-2 left-2 text-yellow-400"
                          aria-label="Pinned note"
                        >
                          📍
                        </div>
                      )}
                      <div className={viewMode === "list" ? "flex-1" : ""}>
                        <div className="flex items-center justify-between mb-2">
                          <motion.h3
                            id={`note-title-${note._id}`}
                            className="text-lg font-bold flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <span className="text-xl">{note.mood}</span>
                            {note.title}
                          </motion.h3>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-bold text-white"
                            style={{
                              backgroundColor:
                                categoryColors[note.category] || note.color,
                            }}
                          >
                            {note.category}
                          </span>
                        </div>
                        <p className="mb-3 text-sm opacity-80 line-clamp-3">
                          {note.content}
                        </p>
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
                        <div className="flex items-center justify-between text-xs opacity-60">
                          <span>
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(note);
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full bg-blue-500/20 border border-blue-500/50"
                              aria-label="Edit note"
                            >
                              ✏️
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePin(note._id, note.pinned);
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"
                              aria-label={
                                note.pinned ? "Unpin note" : "Pin note"
                              }
                            >
                              📌
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(note._id, note.archived);
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full bg-purple-500/20 border border-purple-500/50"
                              aria-label={
                                note.archived
                                  ? "Unarchive note"
                                  : "Archive note"
                              }
                            >
                              🗄️
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(note._id);
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-full bg-red-500/20 border border-red-500/50"
                              aria-label="Delete note"
                            >
                              🗑️
                            </motion.button>
                          </div>
                        </div>
                      </div>
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
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!isLoading && filteredNotes.length === 0 && (
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
                  No notes found
                </h3>
                <p className="text-base opacity-60 mb-4">
                  Create your first gorgeous note above!
                </p>
                <motion.button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl backdrop-blur-xl border border-white/20"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  ✨ Create Note
                </motion.button>
              </motion.div>
            )}

            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-4 right-4 w-12 h-12 rounded-full backdrop-blur-xl border border-white/20 shadow-xl z-40"
              style={{ background: "linear-gradient(45deg, #667eea, #764ba2)" }}
              whileHover={{ scale: 1.1, rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              aria-label="Scroll to top"
            >
              <span className="text-xl">✨</span>
            </motion.button>

            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  onClick={() => setConfirmDelete(null)}
                  role="dialog"
                  aria-labelledby="delete-modal-title"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl mb-4"
                    >
                      🗑️
                    </motion.div>
                    <h3
                      id="delete-modal-title"
                      className="text-lg font-bold mb-2"
                    >
                      Delete Note?
                    </h3>
                    <p className="opacity-80 mb-4 text-sm">
                      This action can be undone for 5 seconds.
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => handleDelete(confirmDelete)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-xl bg-red-500/80 text-white font-bold"
                        aria-label="Confirm delete"
                      >
                        🗑️ Delete
                      </motion.button>
                      <motion.button
                        onClick={() => setConfirmDelete(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-xl backdrop-blur-xl border border-white/20"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                        aria-label="Cancel delete"
                      >
                        ❌ Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
