import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import {
  setFilters,
  clearFilters,
  setSortBy,
  setViewMode,
  setShowArchived,
} from "../store/slices/notesSlice.js";
import { storageService } from "../services/storageService.js";

export const useFilters = () => {
  const dispatch = useAppDispatch();
  const { filters, sortBy, viewMode, showArchived } = useAppSelector(
    (state) => state.notes
  );

  // Update search filter
  const setSearch = useCallback(
    (search) => {
      dispatch(setFilters({ search }));

      // Save recent search
      if (search.trim()) {
        storageService.addRecentSearch(search.trim());
      }
    },
    [dispatch]
  );

  // Update category filter
  const setCategory = useCallback(
    (category) => {
      dispatch(setFilters({ category }));
      storageService.setPreference("lastCategory", category);
    },
    [dispatch]
  );

  // Update priority filter
  const setPriority = useCallback(
    (priority) => {
      dispatch(setFilters({ priority }));
      storageService.setPreference("lastPriority", priority);
    },
    [dispatch]
  );

  // Update tag filter
  const setTag = useCallback(
    (tag) => {
      dispatch(setFilters({ tag }));
      storageService.setPreference("lastTag", tag);
    },
    [dispatch]
  );

  // Update multiple filters at once
  const updateFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  // Clear all filters
  const resetFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  // Update sort option
  const updateSortBy = useCallback(
    (newSortBy) => {
      dispatch(setSortBy(newSortBy));
      storageService.setPreference("sortBy", newSortBy);
    },
    [dispatch]
  );

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    const newViewMode = viewMode === "grid" ? "list" : "grid";
    dispatch(setViewMode(newViewMode));
    storageService.setPreference("viewMode", newViewMode);
  }, [dispatch, viewMode]);

  // Set specific view mode
  const updateViewMode = useCallback(
    (newViewMode) => {
      dispatch(setViewMode(newViewMode));
      storageService.setPreference("viewMode", newViewMode);
    },
    [dispatch]
  );

  // Toggle archived notes visibility
  const toggleShowArchived = useCallback(() => {
    dispatch(setShowArchived(!showArchived));
  }, [dispatch, showArchived]);

  // Set archived notes visibility
  const updateShowArchived = useCallback(
    (show) => {
      dispatch(setShowArchived(show));
    },
    [dispatch]
  );

  // Get recent searches
  const getRecentSearches = useCallback(() => {
    return storageService.getRecentSearches();
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    storageService.clearRecentSearches();
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return (
      filters.search !== "" ||
      filters.category !== "All" ||
      filters.priority !== "All" ||
      filters.tag !== "All"
    );
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const activeFilters = [];

    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`);
    }
    if (filters.category !== "All") {
      activeFilters.push(`Category: ${filters.category}`);
    }
    if (filters.priority !== "All") {
      activeFilters.push(`Priority: ${filters.priority}`);
    }
    if (filters.tag !== "All") {
      activeFilters.push(`Tag: ${filters.tag}`);
    }
    if (showArchived) {
      activeFilters.push("Showing archived");
    }

    return activeFilters;
  }, [filters, showArchived]);

  // Save current filter state as preset
  const saveFilterPreset = useCallback(
    (name) => {
      const preset = {
        name,
        filters: { ...filters },
        sortBy,
        viewMode,
        showArchived,
        createdAt: Date.now(),
      };

      const presets = storageService.getItem("filter_presets", []);
      const updatedPresets = [
        ...presets.filter((p) => p.name !== name),
        preset,
      ];

      storageService.setItem("filter_presets", updatedPresets);
      return preset;
    },
    [filters, sortBy, viewMode, showArchived]
  );

  // Load filter preset
  const loadFilterPreset = useCallback(
    (preset) => {
      dispatch(setFilters(preset.filters));
      dispatch(setSortBy(preset.sortBy));
      dispatch(setViewMode(preset.viewMode));
      dispatch(setShowArchived(preset.showArchived));
    },
    [dispatch]
  );

  // Get saved filter presets
  const getFilterPresets = useCallback(() => {
    return storageService.getItem("filter_presets", []);
  }, []);

  // Delete filter preset
  const deleteFilterPreset = useCallback((name) => {
    const presets = storageService.getItem("filter_presets", []);
    const updatedPresets = presets.filter((p) => p.name !== name);
    storageService.setItem("filter_presets", updatedPresets);
  }, []);

  // Quick filter functions
  const showTodayNotes = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    dispatch(
      setFilters({
        search: "",
        category: "All",
        priority: "All",
        tag: "All",
      })
    );
    // This would need additional logic to filter by date
  }, [dispatch]);

  const showHighPriorityNotes = useCallback(() => {
    dispatch(
      setFilters({
        ...filters,
        priority: "high",
      })
    );
  }, [dispatch, filters]);

  const showPinnedNotes = useCallback(() => {
    // This would need additional state management for pinned filter
    dispatch(
      setFilters({
        search: "",
        category: "All",
        priority: "All",
        tag: "All",
      })
    );
  }, [dispatch]);

  // Initialize filters from storage
  const initializeFilters = useCallback(() => {
    const savedSortBy = storageService.getPreference("sortBy", "createdAt");
    const savedViewMode = storageService.getPreference("viewMode", "grid");

    if (savedSortBy !== sortBy) {
      dispatch(setSortBy(savedSortBy));
    }
    if (savedViewMode !== viewMode) {
      dispatch(setViewMode(savedViewMode));
    }
  }, [dispatch, sortBy, viewMode]);

  return {
    // Current state
    filters,
    sortBy,
    viewMode,
    showArchived,

    // Filter actions
    setSearch,
    setCategory,
    setPriority,
    setTag,
    updateFilters,
    resetFilters,

    // Sort and view actions
    updateSortBy,
    toggleViewMode,
    updateViewMode,
    toggleShowArchived,
    updateShowArchived,

    // Recent searches
    getRecentSearches,
    clearRecentSearches,

    // Filter utilities
    hasActiveFilters: hasActiveFilters(),
    getFilterSummary: getFilterSummary(),

    // Filter presets
    saveFilterPreset,
    loadFilterPreset,
    getFilterPresets,
    deleteFilterPreset,

    // Quick filters
    showTodayNotes,
    showHighPriorityNotes,
    showPinnedNotes,

    // Initialization
    initializeFilters,
  };
};
