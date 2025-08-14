import { createSelector } from "@reduxjs/toolkit";

// Auth selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;

// Notes selectors
export const selectNotes = (state) => state.notes;
export const selectAllNotes = (state) => state.notes.notes;
export const selectNotesLoading = (state) => state.notes.loading;
export const selectNotesError = (state) => state.notes.error;
export const selectNotesFilters = (state) => state.notes.filters;
export const selectNotesSortBy = (state) => state.notes.sortBy;
export const selectNotesViewMode = (state) => state.notes.viewMode;
export const selectShowArchived = (state) => state.notes.showArchived;

// UI selectors
export const selectUI = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectNotifications = (state) => state.ui.notifications;

// Memoized selectors for better performance
export const selectActiveNotes = createSelector(
  [selectAllNotes, selectShowArchived],
  (notes, showArchived) =>
    notes.filter((note) => note.archived === showArchived)
);

export const selectFilteredNotes = createSelector(
  [selectActiveNotes, selectNotesFilters],
  (notes, filters) => {
    let filtered = notes;

    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((note) => note.category === filters.category);
    }

    // Priority filter
    if (filters.priority && filters.priority !== "All") {
      filtered = filtered.filter((note) => note.priority === filters.priority);
    }

    // Tag filter
    if (filters.tag && filters.tag !== "All") {
      filtered = filtered.filter((note) => note.tags?.includes(filters.tag));
    }

    return filtered;
  }
);

export const selectSortedNotes = createSelector(
  [selectFilteredNotes, selectNotesSortBy],
  (notes, sortBy) => {
    const sortedNotes = [...notes];

    switch (sortBy) {
      case "title":
        return sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
      case "category":
        return sortedNotes.sort((a, b) => a.category.localeCompare(b.category));
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortedNotes.sort(
          (a, b) =>
            (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        );
      case "updatedAt":
        return sortedNotes.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      case "createdAt":
      default:
        return sortedNotes.sort((a, b) => {
          // Pinned notes first
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          // Then by creation date
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }
  }
);

export const selectPinnedNotes = createSelector([selectActiveNotes], (notes) =>
  notes.filter((note) => note.pinned)
);

export const selectNotesStats = createSelector([selectAllNotes], (notes) => {
  const stats = {
    total: notes.length,
    active: 0,
    archived: 0,
    pinned: 0,
    byCategory: {},
    byPriority: { high: 0, medium: 0, low: 0 },
    recentlyCreated: 0,
    recentlyUpdated: 0,
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  notes.forEach((note) => {
    // Active vs archived
    if (note.archived) {
      stats.archived++;
    } else {
      stats.active++;
    }

    // Pinned
    if (note.pinned) {
      stats.pinned++;
    }

    // By category
    stats.byCategory[note.category] =
      (stats.byCategory[note.category] || 0) + 1;

    // By priority
    if (note.priority && stats.byPriority.hasOwnProperty(note.priority)) {
      stats.byPriority[note.priority]++;
    }

    // Recently created/updated
    const createdAt = new Date(note.createdAt);
    const updatedAt = new Date(note.updatedAt);

    if (createdAt > weekAgo) {
      stats.recentlyCreated++;
    }

    if (updatedAt > weekAgo && updatedAt.getTime() !== createdAt.getTime()) {
      stats.recentlyUpdated++;
    }
  });

  return stats;
});

export const selectAllTags = createSelector([selectAllNotes], (notes) => {
  const tagSet = new Set();
  notes.forEach((note) => {
    if (note.tags && Array.isArray(note.tags)) {
      note.tags.forEach((tag) => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
});

export const selectAllCategories = createSelector([selectAllNotes], (notes) => {
  const categorySet = new Set();
  notes.forEach((note) => {
    if (note.category) {
      categorySet.add(note.category);
    }
  });
  return Array.from(categorySet).sort();
});

// User-specific selectors
export const selectUserDisplayName = createSelector([selectUser], (user) => {
  if (!user) return "";
  return user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.email || "";
});

export const selectUserInitials = createSelector([selectUser], (user) => {
  if (!user) return "";
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) {
    return user.firstName.substring(0, 2).toUpperCase();
  }
  return user.email ? user.email.substring(0, 2).toUpperCase() : "";
});

// Performance selectors for specific components
export const selectNotesForGrid = createSelector(
  [selectSortedNotes, selectNotesViewMode],
  (notes, viewMode) => {
    if (viewMode !== "grid") return [];
    return notes;
  }
);

export const selectNotesForList = createSelector(
  [selectSortedNotes, selectNotesViewMode],
  (notes, viewMode) => {
    if (viewMode !== "list") return [];
    return notes;
  }
);

// Search-specific selectors
export const selectSearchResults = createSelector(
  [selectAllNotes, selectNotesFilters],
  (notes, filters) => {
    if (!filters.search || !filters.search.trim()) {
      return { results: [], hasResults: false, query: "" };
    }

    const searchTerm = filters.search.toLowerCase();
    const results = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(searchTerm))
    );

    return {
      results,
      hasResults: results.length > 0,
      query: filters.search,
      count: results.length,
    };
  }
);
