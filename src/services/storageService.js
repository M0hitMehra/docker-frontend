import { STORAGE_KEYS } from "../utils/constants.js";

export const storageService = {
  // Generic storage methods
  setItem(key, value) {
    try {
      const serializedValue =
        typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },

  // Auth-specific methods
  setAuthToken(token) {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getAuthToken() {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  removeAuthToken() {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setUserData(userData) {
    return this.setItem(STORAGE_KEYS.USER_DATA, userData);
  },

  getUserData() {
    return this.getItem(STORAGE_KEYS.USER_DATA);
  },

  removeUserData() {
    return this.removeItem(STORAGE_KEYS.USER_DATA);
  },

  // Theme-specific methods
  setTheme(theme) {
    return this.setItem(STORAGE_KEYS.THEME, theme);
  },

  getTheme() {
    return this.getItem(STORAGE_KEYS.THEME, "dark");
  },

  // App preferences
  setPreference(key, value) {
    const preferences = this.getItem("app_preferences", {});
    preferences[key] = value;
    return this.setItem("app_preferences", preferences);
  },

  getPreference(key, defaultValue = null) {
    const preferences = this.getItem("app_preferences", {});
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  },

  // Draft notes (auto-save functionality)
  saveDraft(draftData) {
    return this.setItem("note_draft", {
      ...draftData,
      timestamp: Date.now(),
    });
  },

  getDraft() {
    const draft = this.getItem("note_draft");
    if (!draft) return null;

    // Check if draft is older than 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - draft.timestamp > twentyFourHours) {
      this.removeDraft();
      return null;
    }

    return draft;
  },

  removeDraft() {
    return this.removeItem("note_draft");
  },

  // Recent searches
  addRecentSearch(query) {
    if (!query || query.trim() === "") return;

    const recentSearches = this.getItem("recent_searches", []);
    const filteredSearches = recentSearches.filter(
      (search) => search !== query
    );
    const updatedSearches = [query, ...filteredSearches].slice(0, 10); // Keep only 10 recent searches

    return this.setItem("recent_searches", updatedSearches);
  },

  getRecentSearches() {
    return this.getItem("recent_searches", []);
  },

  clearRecentSearches() {
    return this.removeItem("recent_searches");
  },

  // Export/Import app data
  exportAppData() {
    const data = {
      preferences: this.getItem("app_preferences", {}),
      recentSearches: this.getItem("recent_searches", []),
      theme: this.getItem(STORAGE_KEYS.THEME),
      timestamp: Date.now(),
    };

    return data;
  },

  importAppData(data) {
    try {
      if (data.preferences) {
        this.setItem("app_preferences", data.preferences);
      }
      if (data.recentSearches) {
        this.setItem("recent_searches", data.recentSearches);
      }
      if (data.theme) {
        this.setItem(STORAGE_KEYS.THEME, data.theme);
      }
      return true;
    } catch (error) {
      console.error("Error importing app data:", error);
      return false;
    }
  },

  // Check storage availability
  isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Get storage usage info
  getStorageInfo() {
    if (!this.isStorageAvailable()) {
      return { available: false };
    }

    let totalSize = 0;
    const items = {};

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        items[key] = size;
        totalSize += size;
      }
    }

    return {
      available: true,
      totalSize,
      items,
      itemCount: Object.keys(items).length,
    };
  },
};
