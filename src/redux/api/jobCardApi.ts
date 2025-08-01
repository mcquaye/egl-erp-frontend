import { authApi } from "./baseApi";
import type { JobCardCreateRequest, JobCard } from "../../types";

// Define update request type
export interface JobCardUpdateRequest extends Partial<JobCardCreateRequest> {
	id?: string;
}

// Job Card API endpoints for internal CRUD operations (Internal API - PostgreSQL)
// This handles creating, updating, deleting job cards in our internal system
export const jobCardApiEndpoints = authApi.injectEndpoints({
	endpoints: (builder) => ({
		// Create a new job card
		createJobCard: builder.mutation<JobCard, JobCardCreateRequest>({
			query: (jobCardData) => ({
				url: "/job-cards",
				method: "POST",
				body: jobCardData,
			}),
			invalidatesTags: ["JobCard"],
		}),

		// Get all job cards
		getAllJobCards: builder.query<JobCard[], void>({
			query: () => "/job-cards",
			providesTags: ["JobCard"],
		}),

		// Get my job cards (for managers)
		getMyJobCards: builder.query<JobCard[], string>({
			query: (userId) => `/job-cards/my/${userId}`,
			providesTags: ["JobCard"],
		}),

		// Get job card by ID
		getJobCardById: builder.query<JobCard, string>({
			query: (id) => `/job-cards/${id}`,
			providesTags: ["JobCard"],
		}),

		// Update job card
		updateJobCard: builder.mutation<JobCard, { id: string; data: JobCardUpdateRequest }>({
			query: ({ id, data }) => ({
				url: `/job-cards/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["JobCard"],
		}),

		// Delete job card
		deleteJobCard: builder.mutation<{ success: boolean; message: string }, string>({
			query: (id) => ({
				url: `/job-cards/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["JobCard"],
		}),

		// Assign job card
		assignJobCard: builder.mutation<JobCard, { id: string; assignedTo: string }>({
			query: ({ id, assignedTo }) => ({
				url: `/job-cards/${id}/assign`,
				method: "PATCH",
				body: { assignedTo },
			}),
			invalidatesTags: ["JobCard"],
		}),
	}),
});

export const {
	useCreateJobCardMutation,
	useGetAllJobCardsQuery,
	useGetMyJobCardsQuery,
	useGetJobCardByIdQuery,
	useUpdateJobCardMutation,
	useDeleteJobCardMutation,
	useAssignJobCardMutation,
} = jobCardApiEndpoints;
