import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Auth state interface
interface AuthState {
	token: string | null;
	user: {
		id: number;
		email: string;
		name: string;
		role: string;
	} | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

// Initial state
const initialState: AuthState = {
	token: localStorage.getItem("auth_token"),
	user: (() => {
		const userData = localStorage.getItem("user_data");
		return userData ? JSON.parse(userData) : null;
	})(),
	isAuthenticated: !!localStorage.getItem("auth_token"),
	isLoading: false,
};

// Auth slice
const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		// Login success action
		loginSuccess: (state, action: PayloadAction<{ token: string; user: any }>) => {
			state.token = action.payload.token;
			state.user = action.payload.user;
			state.isAuthenticated = true;
			state.isLoading = false;

			// Store in localStorage
			localStorage.setItem("auth_token", action.payload.token);
			localStorage.setItem("user_data", JSON.stringify(action.payload.user));
		},

		// Logout action
		logout: (state) => {
			state.token = null;
			state.user = null;
			state.isAuthenticated = false;
			state.isLoading = false;

			// Clear localStorage
			localStorage.removeItem("auth_token");
			localStorage.removeItem("user_data");
		},

		// Set loading state
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.isLoading = action.payload;
		},
	},
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
