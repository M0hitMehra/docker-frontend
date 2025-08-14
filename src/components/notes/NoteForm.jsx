import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "../ui/index.js";
import {
  CATEGORIES,
  COLORS,
  MOODS,
  PRIORITIES,
} from "../../utils/constants.js";
import {
  validateNoteTitle,
  validateNoteContent,
  validateTags,
} from "../../utils/validators.js";
import { useUI } from "../../hooks/useUI.js";

const NoteForm = ({
  note = null,
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}) => {
  const { darkMode, isTyping, setTypingStatus } = useUI();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    priority: "medium",
    mood: "😊",
    tags: "",
    color: "#667eea",
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form data when note prop changes
  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        content: note.content || "",
        category: note.category || "",
        priority: note.priority || "medium",
        mood: note.mood || "😊",
        tags: note.tags?.join(", ") || "",
        color: note.color || "#667eea",
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [note]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      priority: "medium",
      mood: "😊",
      tags: "",
      color: "#667eea",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Set typing status for animations
    setTypingStatus(true);
    setTimeout(() => setTypingStatus(false), 1000);
  };

  const handleColorSelect = (color) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }));
  };

  const handleMoodSelect = (mood) => {
    setFormData((prev) => ({
      ...prev,
      mood,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const titleError = validateNoteTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const contentError = validateNoteContent(formData.content);
    if (contentError) newErrors.content = contentError;

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    const tagsError = validateTags(tagsArray);
    if (tagsError) newErrors.tags = tagsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const noteData = {
      title: formData.title,
      content: formData.content,
      category: formData.category || "Others",
      priority: formData.priority,
      mood: formData.mood,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      color: formData.color,
    };

    const success = await onSubmit?.(noteData, isEditing ? note._id : null);

    if (success && !isEditing) {
      resetForm();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Expose scroll function for external use
  useEffect(() => {
    if (window.scrollToNoteForm) {
      window.scrollToNoteForm = scrollToForm;
    }
  }, []);

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mb-8 p-4 sm:p-6 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.1)" }}
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {/* Title Input */}
        <Input
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="✍️ Note title..."
          error={errors.title}
          variant="filled"
          size="large"
          fullWidth
          className="text-lg font-semibold"
          required
          aria-label="Note title"
        />

        {/* Content Textarea */}
        <div>
          <motion.textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="📝 Write something amazing..."
            className="w-full px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none text-base min-h-[100px] resize-y bg-white/10 text-white placeholder-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/50"
            whileFocus={{ scale: 1.02 }}
            required
            aria-label="Note content"
          />
          {errors.content && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-red-400"
            >
              {errors.content}
            </motion.p>
          )}
        </div>

        {/* Category, Priority, and Tags Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category Select */}
          <div>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white"
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
              {CATEGORIES.slice(1).map((cat) => (
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

          {/* Priority Select */}
          <div>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl border border-white/20 outline-none bg-white/10 text-white"
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
          </div>

          {/* Tags Input */}
          <Input
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="tag1, tag2, tag3"
            error={errors.tags}
            variant="filled"
            fullWidth
            aria-label="Tags (comma separated)"
          />
        </div>

        {/* Color and Mood Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Color Picker */}
          <div>
            <label className="block mb-2 text-sm text-white/80">🎨 Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <motion.button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color
                      ? "border-white"
                      : "border-transparent"
                  }`}
                  style={{ background: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Mood Picker */}
          <div>
            <label className="block mb-2 text-sm text-white/80">😊 Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <motion.button
                  key={m}
                  type="button"
                  onClick={() => handleMoodSelect(m)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-xl p-2 rounded-full ${
                    formData.mood === m ? "bg-white/20" : ""
                  }`}
                  aria-label={`Select mood ${m}`}
                >
                  {m}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
            disabled={loading}
            style={{
              background: `linear-gradient(45deg, ${formData.color}, ${formData.color}dd)`,
            }}
            className="flex-1"
          >
            <motion.span
              animate={isTyping ? { y: [-2, 2, -2] } : {}}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              {loading
                ? "Saving..."
                : isEditing
                ? "✏️ Update Note"
                : "✨ Create Note"}
            </motion.span>
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.form>
  );
};

export default NoteForm;
