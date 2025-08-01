import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { JobCard, ExistingJobCard, JobCardStatusOption } from "../../types";

// Job Card state interface
interface JobCardState {
	// Current job cards (from internal database)
	jobCards: JobCard[];
	currentJobCard: JobCard | null;
	myJobCards: JobCard[];

	// Oracle job card data
	existingJobCards: ExistingJobCard[];
	statusOptions: JobCardStatusOption[];

	// UI states
	isLoading: boolean;
	isSubmitting: boolean;

	// Filters and search
	filters: {
		jobStatus?: string;
		assignedTo?: string;
		dateRange?: {
			start: string;
			end: string;
		};
		searchTerm?: string;
	};

	// Errors
	error: string | null;

	// Last fetched data info
	lastFetch: {
		jobCards: string | null;
		existingJobCards: string | null;
		statusOptions: string | null;
	};
}

// Initial state
const initialState: JobCardState = {
	jobCards: [],
	currentJobCard: null,
	myJobCards: [],
	existingJobCards: [],
	statusOptions: [],
	isLoading: false,
	isSubmitting: false,
	filters: {},
	error: null,
	lastFetch: {
		jobCards: null,
		existingJobCards: null,
		statusOptions: null,
	},
};

// Job Card slice
const jobCardSlice = createSlice({
	name: "jobCard",
	initialState,
	reducers: {
		// Loading states
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},

		setSubmitting: (state, action: PayloadAction<boolean>) => {
			state.isSubmitting = action.payload;
		},

		// Error handling
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},

		clearError: (state) => {
			state.error = null;
		},

		// Job Cards (Internal Database)
		setJobCards: (state, action: PayloadAction<JobCard[]>) => {
			state.jobCards = action.payload;
			state.lastFetch.jobCards = new Date().toISOString();
		},

		setCurrentJobCard: (state, action: PayloadAction<JobCard | null>) => {
			state.currentJobCard = action.payload;
		},

		setMyJobCards: (state, action: PayloadAction<JobCard[]>) => {
			state.myJobCards = action.payload;
		},

		addJobCard: (state, action: PayloadAction<JobCard>) => {
			state.jobCards.unshift(action.payload); // Add to beginning
		},

		updateJobCard: (state, action: PayloadAction<JobCard>) => {
			const index = state.jobCards.findIndex((jc) => jc.id === action.payload.id);
			if (index !== -1) {
				state.jobCards[index] = action.payload;
			}

			// Update current job card if it's the same one
			if (state.currentJobCard?.id === action.payload.id) {
				state.currentJobCard = action.payload;
			}

			// Update my job cards if it's in there
			const myIndex = state.myJobCards.findIndex((jc) => jc.id === action.payload.id);
			if (myIndex !== -1) {
				state.myJobCards[myIndex] = action.payload;
			}
		},

		removeJobCard: (state, action: PayloadAction<number>) => {
			state.jobCards = state.jobCards.filter((jc) => jc.id !== action.payload);
			state.myJobCards = state.myJobCards.filter((jc) => jc.id !== action.payload);

			// Clear current if it was deleted
			if (state.currentJobCard?.id === action.payload) {
				state.currentJobCard = null;
			}
		},

		// Oracle Job Card Data
		setExistingJobCards: (state, action: PayloadAction<ExistingJobCard[]>) => {
			state.existingJobCards = action.payload;
			state.lastFetch.existingJobCards = new Date().toISOString();
		},

		setStatusOptions: (state, action: PayloadAction<JobCardStatusOption[]>) => {
			state.statusOptions = action.payload;
			state.lastFetch.statusOptions = new Date().toISOString();
		},

		// Filters
		setFilters: (state, action: PayloadAction<Partial<JobCardState["filters"]>>) => {
			state.filters = { ...state.filters, ...action.payload };
		},

		clearFilters: (state) => {
			state.filters = {};
		},

		// Bulk operations
		clearAllJobCards: (state) => {
			state.jobCards = [];
			state.myJobCards = [];
			state.currentJobCard = null;
		},

		clearOracleData: (state) => {
			state.existingJobCards = [];
			state.statusOptions = [];
			state.lastFetch.existingJobCards = null;
			state.lastFetch.statusOptions = null;
		},

		// Reset entire state
		resetJobCardState: () => initialState,
	},
});

// Export actions
export const {
	setLoading,
	setSubmitting,
	setError,
	clearError,
	setJobCards,
	setCurrentJobCard,
	setMyJobCards,
	addJobCard,
	updateJobCard,
	removeJobCard,
	setExistingJobCards,
	setStatusOptions,
	setFilters,
	clearFilters,
	clearAllJobCards,
	clearOracleData,
	resetJobCardState,
} = jobCardSlice.actions;

// Selectors
export const selectJobCards = (state: { jobCard: JobCardState }) => state.jobCard.jobCards;
export const selectCurrentJobCard = (state: { jobCard: JobCardState }) =>
	state.jobCard.currentJobCard;
export const selectMyJobCards = (state: { jobCard: JobCardState }) => state.jobCard.myJobCards;
export const selectExistingJobCards = (state: { jobCard: JobCardState }) =>
	state.jobCard.existingJobCards;
export const selectStatusOptions = (state: { jobCard: JobCardState }) =>
	state.jobCard.statusOptions;
export const selectJobCardLoading = (state: { jobCard: JobCardState }) => state.jobCard.isLoading;
export const selectJobCardSubmitting = (state: { jobCard: JobCardState }) =>
	state.jobCard.isSubmitting;
export const selectJobCardError = (state: { jobCard: JobCardState }) => state.jobCard.error;
export const selectJobCardFilters = (state: { jobCard: JobCardState }) => state.jobCard.filters;

// Filtered job cards selector
export const selectFilteredJobCards = (state: { jobCard: JobCardState }) => {
	const { jobCards, filters } = state.jobCard;
	let filtered = [...jobCards];

	if (filters.jobStatus) {
		filtered = filtered.filter((jc) => jc.jobStatus === filters.jobStatus);
	}

	if (filters.assignedTo) {
		filtered = filtered.filter((jc) => jc.assignedTo === filters.assignedTo);
	}

	if (filters.searchTerm) {
		const term = filters.searchTerm.toLowerCase();
		filtered = filtered.filter(
			(jc) =>
				jc.jobNumber.toLowerCase().includes(term) ||
				jc.customerName.toLowerCase().includes(term) ||
				jc.serialNumber.toLowerCase().includes(term) ||
				jc.description.toLowerCase().includes(term)
		);
	}

	if (filters.dateRange) {
		const { start, end } = filters.dateRange;
		filtered = filtered.filter((jc) => {
			const jobDate = new Date(jc.jobDate);
			return jobDate >= new Date(start) && jobDate <= new Date(end);
		});
	}

	return filtered;
};

// Export reducer
export default jobCardSlice.reducer;
