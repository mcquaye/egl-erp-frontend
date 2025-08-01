// Export all API endpoints
export * from "./api/authApi";
export * from "./api/installationApi";
export * from "./api/jobCardApi";
export * from "./api/systemApi";
export * from "../types"; // Import types from central types folder

// Export store and types
export { default as store } from "./store";
export type { RootState, AppDispatch } from "./store";

// Export hooks
export * from "./hooks";

// Export slice actions
export { loginSuccess, logout, setLoading } from "./slices/authSlice";
export {
	setCurrentInstallation,
	clearCurrentInstallation,
	addToSubmissionHistory,
	setInstallationLoading,
	setLastSearchedSerial,
} from "./slices/installationSlice";
