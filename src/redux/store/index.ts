import { configureStore } from "@reduxjs/toolkit";
import { externalApi, authApi, systemApi } from "../api/baseApi";
import authReducer from "../slices/authSlice";
import installationReducer from "../slices/installationSlice";
import jobCardReducer from "../slices/jobCardSlice";

// Configure the Redux store
export const store = configureStore({
	reducer: {
		// API slices
		[externalApi.reducerPath]: externalApi.reducer,
		[authApi.reducerPath]: authApi.reducer,
		[systemApi.reducerPath]: systemApi.reducer,

		// Local state slices
		auth: authReducer,
		installation: installationReducer,
		jobCard: jobCardReducer,
	},

	// Adding the api middleware enables caching, invalidation, polling, and other useful features of RTK Query
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			externalApi.middleware,
			authApi.middleware,
			systemApi.middleware
		) as any,

	// Enable Redux DevTools in development
	devTools: import.meta.env.DEV,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store as default
export default store;
