import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// External API configuration for Electroland API
export const externalApi = createApi({
	reducerPath: "externalApi",
	baseQuery: fetchBaseQuery({
		baseUrl: "https://api.electrolandgh.com",
		prepareHeaders: (headers) => {
			// Get external API token if needed
			const externalToken = localStorage.getItem("external_api_token");

			if (externalToken) {
				headers.set("authorization", `Bearer ${externalToken}`);
			}

			headers.set("content-type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Installation", "ExternalData", "JobCard"],
	endpoints: () => ({}),
});

// Internal API configuration for PostgreSQL/Auth
export const authApi = createApi({
	reducerPath: "authApi",
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_AUTH_API_URL || "http://localhost:3030/api",
		prepareHeaders: (headers) => {
			// Get JWT token from localStorage for auth
			const token = localStorage.getItem("auth_token");

			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}

			headers.set("content-type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Auth", "Users", "Profile", "JobCard"],
	endpoints: () => ({}),
});

// System API for general system operations (could use either backend)
export const systemApi = createApi({
	reducerPath: "systemApi",
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_SYSTEM_API_URL || "http://localhost:3001/api",
		prepareHeaders: (headers) => {
			const token = localStorage.getItem("auth_token");

			if (token) {
				headers.set("authorization", `Bearer ${token}`);
			}

			headers.set("content-type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["System", "Health"],
	endpoints: () => ({}),
});

// Export hooks (will be populated by individual API files)
export const {} = externalApi;
export const {} = authApi;
export const {} = systemApi;

// For backward compatibility, export externalApi as baseApi
export const baseApi = externalApi;
