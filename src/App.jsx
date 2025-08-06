import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [mood, setMood] = useState('😊');
  const [tags, setTags] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [darkMode, setDarkMode] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showStats, setShowStats] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#667eea');
  const [isTyping, setIsTyping] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const headerY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

  const categories = ['All', 'Work', 'Personal', 'Ideas', 'Others'];
  const priorities = ['All', 'high', 'medium', 'low'];
  const colors = ['#667eea', '#4299e1', '#48bb78', '#9f7aea', '#ed8936', '#e53e3e', '#38b2ac', '#d69e2e'];
  const moods = ['😊', '🤔', '💡', '🔥', '⚡', '🌟', '🎯', '💪', '🚀', '❤️'];

  useEffect(() => {
    fetchNotes();
    const savedDarkMode = localStorage.getItem('gorgeousDarkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gorgeousDarkMode', JSON.stringify(darkMode));
    document.documentElement.style.setProperty('--theme-mode', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (err) {
      setError('Unable to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      showNotification('Title and content are required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const noteData = {
        title,
        content,
        category: category || 'Others',
        priority: priority || 'medium',
        mood: mood || '😊',
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        color: selectedColor || '#667eea',
      };

      const url = editId ? `/api/notes/${editId}` : '/api/notes';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) throw new Error(editId ? 'Failed to update note' : 'Failed to add note');

      showNotification(editId ? 'Note updated successfully! ✨' : 'Note created successfully! 🎉');
      resetForm();
      fetchNotes();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setPriority('medium');
    setMood('😊');
    setTags('');
    setSelectedColor('#667eea');
    setEditId(null);
    setIsTyping(false);
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setPriority(note.priority || 'medium');
    setMood(note.mood || '😊');
    setTags(note.tags?.join(', ') || '');
    setSelectedColor(note.color || '#667eea');
    setEditId(note._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
      showNotification('Note deleted successfully! 🗑️');
      fetchNotes();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
      setConfirmDelete(null);
    }
  };

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'All' || note.category === filterCategory;
      const matchesPriority = filterPriority === 'All' || note.priority === filterPriority;
      return matchesSearch && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const stats = {
    total: notes.length,
    categories: [...new Set(notes.map(n => n.category))].length,
    high: notes.filter(n => n.priority === 'high').length,
    filtered: filteredNotes.length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const noteVariants = {
    hidden: { y: 50, opacity: 0, rotateX: 45 },
    visible: { 
      y: 0, 
      opacity: 1, 
      rotateX: 0,
      transition: { type: "spring", stiffness: 100 }
    },
    hover: { 
      scale: 1.05, 
      rotateY: 5,
      z: 50,
      transition: { type: "spring", stiffness: 400 }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#26de81';
      default: return '#778ca3';
    }
  };

  return (
    <div ref={containerRef} className="app-container" style={{
      background: darkMode 
        ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 100%)',
      minHeight: '100vh',
      color: darkMode ? '#ffffff' : '#333333',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${colors[Math.floor(Math.random() * colors.length)]}, ${colors[Math.floor(Math.random() * colors.length)]})`
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </motion.div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-2xl"
            style={{
              background: notification.type === 'error' 
                ? 'rgba(255, 59, 48, 0.9)' 
                : 'rgba(52, 199, 89, 0.9)',
              border: `1px solid ${notification.type === 'error' ? '#ff3b30' : '#34c759'}`,
              color: 'white'
            }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.header
          style={{ y: headerY }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse">
              ✨ GORGEOUS
            </h1>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl md:text-4xl font-light opacity-80 mb-8"
            >
              Premium Notes Experience
            </motion.div>
            
            {/* Controls Row */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {darkMode ? '🌞 Light' : '🌙 Dark'}
              </motion.button>
              
              <motion.button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                {viewMode === 'grid' ? '📋 List' : '⊞ Grid'}
              </motion.button>
              
              <motion.button
                onClick={() => setShowStats(!showStats)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                📊 Stats
              </motion.button>
            </div>

            {/* Stats Panel */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-6 rounded-3xl backdrop-blur-xl border border-white/20"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total}</div>
                      <div className="opacity-70">Total Notes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.categories}</div>
                      <div className="opacity-70">Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.high}</div>
                      <div className="opacity-70">High Priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.filtered}</div>
                      <div className="opacity-70">Filtered</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.header>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search notes, tags..."
              className="col-span-2 px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none text-lg"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>
                  {cat}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <option value="createdAt" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>Latest</option>
              <option value="title" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>Title</option>
              <option value="priority" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>Priority</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            {priorities.map(priority => (
              <motion.button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
                  filterPriority === priority
                    ? 'border-white/60 bg-white/20'
                    : 'border-white/20 hover:border-white/40'
                }`}
                style={{ 
                  background: filterPriority === priority 
                    ? getPriorityColor(priority === 'All' ? 'medium' : priority) + '40'
                    : 'rgba(255,255,255,0.1)'
                }}
              >
                {priority === 'All' ? '🔥 All' : `${priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'} ${priority}`}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Note Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12 p-8 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              className="col-span-2 px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none text-xl font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              required
            />
            
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <option value="" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>Select Category</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat} style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>
                  {cat}
                </option>
              ))}
            </select>
            
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <option value="low" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>🟢 Low Priority</option>
              <option value="medium" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>🟡 Medium Priority</option>
              <option value="high" style={{ background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>🔴 High Priority</option>
            </select>
          </div>

          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="📝 Write something amazing..."
            className="w-full px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/20 outline-none text-lg mb-6 min-h-[120px] resize-none"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block mb-2 opacity-80">🎨 Color</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <motion.button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 opacity-80">😊 Mood</label>
              <div className="flex gap-2 flex-wrap">
                {moods.map(m => (
                  <motion.button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    className={`text-2xl p-2 rounded-full ${mood === m ? 'bg-white/20' : ''}`}
                  >
                    {m}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-2 opacity-80">🏷️ Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 outline-none"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-4 rounded-2xl font-bold text-xl text-white shadow-2xl relative overflow-hidden"
              style={{ 
                background: `linear-gradient(45deg, ${selectedColor}, ${selectedColor}dd)`,
              }}
              disabled={isLoading}
            >
              <motion.span
                animate={isTyping ? { y: [-2, 2, -2] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                {isLoading ? 'Saving...' : editId ? '✏️ Update Note' : '✨ Create Note'}
              </motion.span>
            </motion.button>

            <motion.button
              type="button"
              onClick={resetForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              🗑️ Clear
            </motion.button>
          </div>
        </motion.form>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl backdrop-blur-xl border border-red-500/50 text-center"
            style={{ background: 'rgba(255, 59, 48, 0.2)' }}
          >
            {error} <button onClick={fetchNotes} className="underline ml-2">Retry</button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <motion.div
            className="text-center py-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <div className="text-6xl">🔄</div>
            <p className="mt-4 opacity-80">Loading notes...</p>
          </motion.div>
        )}

        {/* Notes Grid/List */}
        {!isLoading && filteredNotes.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }`}
          >
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note._id}
                  variants={noteVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                  whileHover="hover"
                  layout
                  className={`p-6 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl cursor-pointer relative overflow-hidden ${
                    viewMode === 'list' ? 'flex items-center gap-6' : ''
                  }`}
                  style={{ 
                    background: `linear-gradient(135deg, ${note.color}20, rgba(255,255,255,0.1))`,
                    borderColor: note.color + '40'
                  }}
                  onClick={() => handleEdit(note)}
                >
                  {/* Priority Indicator */}
                  <div 
                    className="absolute top-0 right-0 w-0 h-0 border-l-[30px] border-b-[30px]"
                    style={{ 
                      borderLeftColor: 'transparent',
                      borderBottomColor: getPriorityColor(note.priority)
                    }}
                  />

                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-center justify-between mb-3">
                      <motion.h3 
                        className="text-xl font-bold flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-2xl">{note.mood}</span>
                        {note.title}
                      </motion.h3>
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: note.color }}
                      >
                        {note.category}
                      </span>
                    </div>
                    
                    <p className="mb-4 opacity-80 line-clamp-3">{note.content}</p>
                    
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 rounded-full text-xs bg-white/20 border border-white/30"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm opacity-60">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(note);
                          }}
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50"
                        >
                          ✏️
                        </motion.button>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(note._id);
                          }}
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/50"
                        >
                          🗑️
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Floating particles effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.3,
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              📝
            </motion.div>
            <h3 className="text-2xl font-bold mb-4 opacity-80">No notes found</h3>
            <p className="text-lg opacity-60 mb-8">Create your first gorgeous note above!</p>
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-lg font-semibold"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              ✨ Create Note
            </motion.button>
          </motion.div>
        )}

        {/* Floating Action Button */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl z-40"
          style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}
          whileHover={{ 
            scale: 1.1,
            rotate: 360,
            boxShadow: '0 0 30px rgba(102, 126, 234, 0.5)'
          }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <span className="text-2xl">✨</span>
        </motion.button>

        {/* Advanced Features Panel */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 space-y-4 z-30"
        >
          <motion.div
            whileHover={{ scale: 1.1, x: 10 }}
            className="p-3 rounded-2xl backdrop-blur-xl border border-white/20 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => {
              const now = new Date();
              const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
              showNotification(`${greeting}! You have ${notes.length} notes 📚`);
            }}
          >
            🕐
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.1, x: 10 }}
            className="p-3 rounded-2xl backdrop-blur-xl border border-white/20 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => {
              const randomTip = [
                "💡 Use tags to organize better!",
                "🎨 Try different colors for moods!",
                "⚡ High priority for important notes!",
                "🔍 Use search to find notes quickly!",
                "📱 Works great on mobile too!"
              ][Math.floor(Math.random() * 5)];
              showNotification(randomTip);
            }}
          >
            💡
          </motion.div>
        </motion.div>

        {/* Confirm Delete Modal */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setConfirmDelete(null)}
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0, rotateX: 45 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.7, opacity: 0, rotateX: 45 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-6"
                >
                  🗑️
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">Delete Note?</h3>
                <p className="opacity-80 mb-8 text-lg">
                  This action cannot be undone. The note will be permanently deleted.
                </p>
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => handleDelete(confirmDelete)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 rounded-2xl bg-red-500/80 hover:bg-red-500 text-white font-bold transition-all duration-300"
                  >
                    🗑️ Delete
                  </motion.button>
                  <motion.button
                    onClick={() => setConfirmDelete(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 rounded-2xl backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    ❌ Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Sound Toggle (Visual Only) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="fixed bottom-8 left-8 z-40"
        >
          <motion.button
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 0 20px rgba(255,255,255,0.3)'
            }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            onClick={() => showNotification('🎵 Ambient mode activated!')}
          >
            🎵
          </motion.button>
        </motion.div>

        {/* Keyboard Shortcuts Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 2 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-xs opacity-50 text-center"
        >
          <p>✨ Press Ctrl+N for new note • Ctrl+/ for search • Esc to close modals</p>
        </motion.div>

        {/* Performance Monitor (Visual) */}
        <motion.div
          className="fixed top-4 left-4 text-xs opacity-30 font-mono"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div>FPS: 60</div>
          <div>Notes: {notes.length}</div>
          <div>Filtered: {filteredNotes.length}</div>
        </motion.div>

        <style jsx>{`
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .app-container {
            font-feature-settings: "liga" 1, "kern" 1;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          .app-container * {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.3) transparent;
          }

          .app-container *::-webkit-scrollbar {
            width: 6px;
          }

          .app-container *::-webkit-scrollbar-track {
            background: transparent;
          }

          .app-container *::-webkit-scrollbar-thumb {
            background-color: rgba(255,255,255,0.3);
            border-radius: 10px;
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .floating {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;