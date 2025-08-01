import { externalApi } from "./baseApi";
import type { ExistingJobCardsResponse, JobCardStatusResponse } from "../../types";

// Oracle Job Card API endpoints (External API - Oracle Database)
// This handles fetching job card data FROM Oracle database
export const jobCardOracleApiEndpoints = externalApi.injectEndpoints({
	endpoints: (builder) => ({
		// Get existing job cards by invoice date from Oracle workshop database
		getExistingJobCardsFromOracle: builder.query<ExistingJobCardsResponse, string>({
			query: (invoiceDate) => ({
				url: "/job-cards/existing/by-date",
				params: { invoiceDate },
			}),
			providesTags: ["JobCard"],
		}),

		// Get job card status options from Oracle workshop database
		getJobCardStatusOptionsFromOracle: builder.query<JobCardStatusResponse, void>({
			query: () => ({
				url: "/job-cards/status/options",
			}),
			providesTags: ["JobCard"],
		}),
	}),
});

export const {
	useGetExistingJobCardsFromOracleQuery,
	useGetJobCardStatusOptionsFromOracleQuery,
	useLazyGetExistingJobCardsFromOracleQuery,
	useLazyGetJobCardStatusOptionsFromOracleQuery,
} = jobCardOracleApiEndpoints;
