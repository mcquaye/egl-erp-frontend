import { systemApi as systemBaseApi } from "./baseApi";
import type { HealthResponse, DBTestResponse } from "../../types";

// System API endpoints (Internal/Auth API)
export const systemApiEndpoints = systemBaseApi.injectEndpoints({
	endpoints: (builder) => ({
		// System health check
		getHealth: builder.query<HealthResponse, void>({
			query: () => "/health",
			providesTags: ["System"],
		}),

		// Database connection test
		testDatabase: builder.query<DBTestResponse, void>({
			query: () => "/db-test",
			providesTags: ["System"],
		}),
	}),
});

export const {
	useGetHealthQuery,
	useTestDatabaseQuery,
	useLazyGetHealthQuery,
	useLazyTestDatabaseQuery,
} = systemApiEndpoints;
