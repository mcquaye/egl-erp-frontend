import { authApi as authBaseApi } from "./baseApi";
import type { LoginRequest } from "../../types";

// User types to match server
interface UserCreateRequest {
	name: string;
	email: string;
	password: string;
	role: "admin" | "manager" | "user";
	phoneNumber?: string | null;
}

interface UserUpdateRequest {
	name?: string;
	email?: string;
	role?: "admin" | "manager" | "user";
	phoneNumber?: string | null;
}

interface UserChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
}

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	phoneNumber?: string | null;
	created_at: string; // Changed from createdAt to match API response
	updated_at: string; // Changed from updatedAt to match API response
}

interface AuthResponse {
	user: User;
	token: string;
}

// Auth API endpoints (MySQL-based authentication via Express server)
export const authApiEndpoints = authBaseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Health check endpoint
		healthCheck: builder.query<{ message: string; status: string; timestamp: string }, void>({
			query: () => "/health",
		}),

		// Login user
		login: builder.mutation<AuthResponse, LoginRequest>({
			query: (credentials) => ({
				url: "/login",
				method: "POST",
				body: credentials,
			}),
			invalidatesTags: ["Auth"],
		}),

		// Register new user (Admin only)
		register: builder.mutation<{ message: string; user: User }, UserCreateRequest>({
			query: (userData) => ({
				url: "/register",
				method: "POST",
				body: userData,
			}),
			invalidatesTags: ["Users"],
		}),

		// Create user (Admin only) - uses /users endpoint
		createUser: builder.mutation<{ message: string; user: User }, UserCreateRequest>({
			query: (userData) => ({
				url: "/users",
				method: "POST",
				body: userData,
			}),
			invalidatesTags: ["Users"],
		}),

		// Get current user profile
		getProfile: builder.query<User, void>({
			query: () => "/users/profile",
			providesTags: ["Auth"],
		}),

		// Update current user profile
		updateProfile: builder.mutation<{ message: string; user: User }, Partial<UserUpdateRequest>>({
			query: (updateData) => ({
				url: "/users/profile",
				method: "PUT",
				body: updateData,
			}),
			invalidatesTags: ["Auth"],
		}),

		// Change password
		changePassword: builder.mutation<{ message: string }, UserChangePasswordRequest>({
			query: (passwordData) => ({
				url: "/users/change-password",
				method: "PUT",
				body: passwordData,
			}),
		}),

		// Get all users (Admin only)
		getUsers: builder.query<User[], void>({
			query: () => "/users",
			providesTags: ["Users"],
		}),

		// Get user by ID (Admin only)
		getUserById: builder.query<User, number>({
			query: (id) => `/users/${id}`,
			providesTags: ["Users"],
		}),

		// Update user (Admin only)
		updateUser: builder.mutation<
			{ message: string; user: User },
			{ id: number; data: UserUpdateRequest }
		>({
			query: ({ id, data }) => ({
				url: `/users/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Users"],
		}),

		// Delete user (Admin only)
		deleteUser: builder.mutation<{ success: boolean; message: string }, number>({
			query: (id) => ({
				url: `/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Users"],
		}),

		// Logout
		logout: builder.mutation<{ message: string; note: string }, void>({
			query: () => ({
				url: "/logout",
				method: "POST",
			}),
			async onQueryStarted(_, { queryFulfilled }) {
				try {
					await queryFulfilled;
					// Clear local storage
					localStorage.removeItem("auth_token");
					localStorage.removeItem("user_data");
				} catch (error) {
					// Even if server logout fails, clear local storage
					localStorage.removeItem("auth_token");
					localStorage.removeItem("user_data");
				}
			},
			invalidatesTags: ["Auth", "Users"],
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useCreateUserMutation,
	useGetProfileQuery,
	useUpdateProfileMutation,
	useChangePasswordMutation,
	useGetUsersQuery,
	useGetUserByIdQuery,
	useUpdateUserMutation,
	useDeleteUserMutation,
	useLogoutMutation,
} = authApiEndpoints;
