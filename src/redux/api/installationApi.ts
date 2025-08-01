import { externalApi } from "./baseApi";
import type { InstallationFormResponse, InstallationSubmitResponse } from "../../types";

// Installation API endpoints (External API - Electroland)
export const installationApiEndpoints = externalApi.injectEndpoints({
	endpoints: (builder) => ({
		// Get installation form data by serial number
		getInstallationForm: builder.query<InstallationFormResponse, string>({
			query: (serialnum) => ({
				url: "/installation/form",
				params: { serialnum },
			}),
			providesTags: ["Installation"],
		}),

		// Legacy endpoint for installation form
		getInstallationFormLegacy: builder.query<InstallationFormResponse, string>({
			query: (serialnum) => ({
				url: "/installation-form",
				params: { serialnum },
			}),
			providesTags: ["Installation"],
		}),

		// Submit installation data
		submitInstallation: builder.mutation<InstallationSubmitResponse, Record<string, any>>({
			query: (installationData) => ({
				url: "/installation/submit",
				method: "POST",
				body: installationData,
			}),
			invalidatesTags: ["Installation", "JobCard"],
		}),

		// Legacy endpoint for submitting installation
		submitInstallationLegacy: builder.mutation<InstallationSubmitResponse, Record<string, any>>({
			query: (installationData) => ({
				url: "/submit-installation",
				method: "POST",
				body: installationData,
			}),
			invalidatesTags: ["Installation"],
		}),
	}),
});

export const {
	useGetInstallationFormQuery,
	useGetInstallationFormLegacyQuery,
	useSubmitInstallationMutation,
	useSubmitInstallationLegacyMutation,
	useLazyGetInstallationFormQuery,
	useLazyGetInstallationFormLegacyQuery,
} = installationApiEndpoints;
