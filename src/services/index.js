// Service exports for easy importing
export { apiService } from "./api.js";
export { authService as legacyAuthService } from "./authService.js"; // Renamed to avoid conflicts
export { simpleAuthService as authService } from "./simpleAuthService.js"; // New simple auth service
export { notesService } from "./notesService.js";
export { storageService } from "./storageService.js";
