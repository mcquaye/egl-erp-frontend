import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { InstallationItem } from "../../types";

// Installation state interface
interface InstallationState {
	currentInstallation: {
		serialnum: string | null;
		data: InstallationItem[];
		error: string | null;
		timestamp: string | null;
	};
	submissionHistory: Array<{
		id: string;
		serialnum: string;
		data: Record<string, any>;
		timestamp: string;
	}>;
	isLoading: boolean;
	lastSearchedSerial: string | null;
}

// Initial state
const initialState: InstallationState = {
	currentInstallation: {
		serialnum: null,
		data: [],
		error: null,
		timestamp: null,
	},
	submissionHistory: [],
	isLoading: false,
	lastSearchedSerial: null,
};

// Installation slice
const installationSlice = createSlice({
	name: "installation",
	initialState,
	reducers: {
		// Set current installation data
		setCurrentInstallation: (
			state,
			action: PayloadAction<{
				serialnum: string;
				data: InstallationItem[];
				error: string | null;
				timestamp: string;
			}>
		) => {
			state.currentInstallation = action.payload;
			state.lastSearchedSerial = action.payload.serialnum;
		},

		// Clear current installation
		clearCurrentInstallation: (state) => {
			state.currentInstallation = {
				serialnum: null,
				data: [],
				error: null,
				timestamp: null,
			};
		},

		// Add to submission history
		addToSubmissionHistory: (
			state,
			action: PayloadAction<{
				serialnum: string;
				data: Record<string, any>;
				timestamp: string;
			}>
		) => {
			const submission = {
				id: Date.now().toString(),
				...action.payload,
			};
			state.submissionHistory.unshift(submission);

			// Keep only last 10 submissions
			if (state.submissionHistory.length > 10) {
				state.submissionHistory = state.submissionHistory.slice(0, 10);
			}
		},

		// Set loading state
		setInstallationLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		// Set last searched serial
		setLastSearchedSerial: (state, action: PayloadAction<string>) => {
			state.lastSearchedSerial = action.payload;
		},
	},
});

export const {
	setCurrentInstallation,
	clearCurrentInstallation,
	addToSubmissionHistory,
	setInstallationLoading,
	setLastSearchedSerial,
} = installationSlice.actions;

export default installationSlice.reducer;
