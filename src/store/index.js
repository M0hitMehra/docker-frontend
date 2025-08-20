import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import notesReducer from "./slices/notesSlice.js";
import uiReducer from "./slices/uiSlice.js";
// Temporarily disabled to prevent interference with simple auth system
// import { authMiddleware } from "./middleware/authMiddleware.js";
// import {
//   authPersistenceMiddleware,
//   tokenExpirationMiddleware,
//   activityTrackingMiddleware,
// } from "./middleware/authPersistenceMiddleware.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  // Temporarily disabled auth middleware to prevent interference
  // .concat([
  //   authMiddleware.middleware,
  //   authPersistenceMiddleware,
  //   tokenExpirationMiddleware,
  //   activityTrackingMiddleware,
  // ]),
});

export default store;
