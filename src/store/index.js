import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import notesReducer from "./slices/notesSlice.js";
import uiReducer from "./slices/uiSlice.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import {
  authPersistenceMiddleware,
  tokenExpirationMiddleware,
  activityTrackingMiddleware,
} from "./middleware/authPersistenceMiddleware.js";

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
    }).concat([
      authMiddleware.middleware,
      authPersistenceMiddleware,
      tokenExpirationMiddleware,
      activityTrackingMiddleware,
    ]),
});

export default store;
