// Note utility functions
export const filterNotes = (notes, filters) => {
  const { search, category, priority, tag, showArchived } = filters;

  return notes.filter((note) => {
    // Archive filter
    if (showArchived && !note.archived) return false;
    if (!showArchived && note.archived) return false;

    // Search filter
    const matchesSearch =
      !search ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags?.some((noteTag) =>
        noteTag.toLowerCase().includes(search.toLowerCase())
      );

    // Category filter
    const matchesCategory =
      !category || category === "All" || note.category === category;

    // Priority filter
    const matchesPriority =
      !priority || priority === "All" || note.priority === priority;

    // Tag filter
    const matchesTag = !tag || tag === "All" || note.tags?.includes(tag);

    return matchesSearch && matchesCategory && matchesPriority && matchesTag;
  });
};

export const sortNotes = (notes, sortBy) => {
  return [...notes].sort((a, b) => {
    // Always prioritize pinned notes
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (
          (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2)
        );
      case "createdAt":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
};

export const getNotesStats = (notes) => {
  return {
    total: notes.length,
    categories: [...new Set(notes.map((n) => n.category))].length,
    high: notes.filter((n) => n.priority === "high").length,
    pinned: notes.filter((n) => n.pinned).length,
    archived: notes.filter((n) => n.archived).length,
  };
};

export const getAllTags = (notes) => {
  return [...new Set(notes.flatMap((note) => note.tags || []))].sort();
};

export const exportNotesToJSON = (notes) => {
  const dataStr = JSON.stringify(notes, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gorgeous-notes-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateNotePreview = (content, maxLength = 150) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
};
