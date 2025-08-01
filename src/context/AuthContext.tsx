import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { VerificationStatus } from "../types/user-types";
import { useLoginMutation, useLogoutMutation } from "../redux/api/authApi";

// Simplified user interface for auth context
interface AuthUser {
	id: number;
	email: string;
	name: string;
	phoneNumber?: string | null;
	role: string;
	verificationStatus?: VerificationStatus;
	createdAt?: Date;
	updatedAt?: Date;
}

interface JWTPayload {
	userId: number;
	email: string;
	name: string;
	phoneNumber?: string | null;
	role: string;
	exp: number;
	iat: number;
}

interface AuthContextType {
	user: AuthUser | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	register: (
		email: string,
		password: string,
		name: string
	) => Promise<{ success: boolean; error?: string }>;
	resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
	changePassword: (
		currentPassword: string,
		newPassword: string
	) => Promise<{ success: boolean; error?: string }>;
	hasRole: (role: string | string[]) => boolean;
	hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// RTK Query hooks
	const [loginMutation] = useLoginMutation();
	const [logoutMutation] = useLogoutMutation();

	// Role-based permissions mapping
	const rolePermissions: Record<string, string[]> = {
		admin: ["read", "write", "delete", "manage_users", "view_all_reports", "manage_settings"],
		manager: ["read", "write", "view_reports", "manage_team"],
		user: ["read", "view_own_reports"],
	};

	// Utility function to decode JWT token
	const decodeJWT = (token: string): JWTPayload | null => {
		try {
			const payload = token.split(".")[1];
			const decoded = JSON.parse(atob(payload));

			// Check if token is expired
			if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
				return null;
			}

			return decoded;
		} catch (error) {
			console.error("Failed to decode JWT:", error);
			return null;
		}
	};

	// Check for existing session on mount
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				const userData = localStorage.getItem("user_data");

				if (token && userData) {
					// Check if token is still valid
					const decoded = decodeJWT(token);
					if (decoded) {
						// Parse stored user data instead of relying on JWT payload
						const user = JSON.parse(userData);
						setUser(user);
					} else {
						// Token expired or invalid
						localStorage.removeItem("auth_token");
						localStorage.removeItem("user_data");
					}
				}
			} catch (error) {
				console.error("Failed to initialize auth:", error);
				localStorage.removeItem("auth_token");
				localStorage.removeItem("user_data");
			} finally {
				setIsLoading(false);
			}
		};

		initializeAuth();
	}, []);

	const login = async (
		email: string,
		password: string
	): Promise<{ success: boolean; error?: string }> => {
		setIsLoading(true);

		try {
			// Use real API login
			const result = await loginMutation({ email, password }).unwrap();

			// Store auth data
			localStorage.setItem("auth_token", result.token);
			localStorage.setItem("user_data", JSON.stringify(result.user));
			setUser(result.user);

			toast.success("Login successful!");
			return { success: true };
		} catch (error: any) {
			console.error("Login error:", error);
			const errorMessage = error?.data?.error || "Login failed. Please try again.";
			return { success: false, error: errorMessage };
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (
		_email: string,
		_password: string,
		_name: string
	): Promise<{ success: boolean; error?: string }> => {
		setIsLoading(true);

		try {
			// TODO: Implement real registration with RTK Query
			// For now, return not implemented
			return { success: false, error: "Registration not implemented yet. Please contact admin." };
		} catch (error) {
			return { success: false, error: "Registration failed. Please try again." };
		} finally {
			setIsLoading(false);
		}
	};

	const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
		try {
			// Simulate API call - replace with actual API integration
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock password reset - in real app, send email with reset link
			const validEmails = [
				"admin@electrolandgh.com",
				"manager@electrolandgh.com",
				"user@electrolandgh.com",
			];

			if (validEmails.includes(email)) {
				toast.success("Password reset link sent to your email!");
				return { success: true };
			} else {
				return { success: false, error: "Email not found in our records" };
			}
		} catch (error) {
			return { success: false, error: "Failed to send reset email. Please try again." };
		}
	};

	const changePassword = async (
		currentPassword: string,
		newPassword: string
	): Promise<{ success: boolean; error?: string }> => {
		try {
			// Simulate API call - replace with actual API integration
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock password change validation
			if (currentPassword.length < 6 || newPassword.length < 6) {
				return { success: false, error: "Password must be at least 6 characters long" };
			}

			toast.success("Password changed successfully!");
			return { success: true };
		} catch (error) {
			return { success: false, error: "Failed to change password. Please try again." };
		}
	};

	const hasRole = (role: string | string[]): boolean => {
		if (!user) return false;

		if (Array.isArray(role)) {
			return role.includes(user.role);
		}

		return user.role === role;
	};

	const hasPermission = (permission: string): boolean => {
		if (!user) return false;

		const userPermissions = rolePermissions[user.role] || [];
		return userPermissions.includes(permission);
	};

	const logout = async () => {
		try {
			// Call API logout endpoint
			await logoutMutation().unwrap();
		} catch (error) {
			console.warn("Logout API call failed, proceeding with local logout:", error);
		} finally {
			// Always clear local storage and state
			localStorage.removeItem("auth_token");
			localStorage.removeItem("user_data");
			setUser(null);
			toast.success("Logged out successfully!");
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		logout,
		register,
		resetPassword,
		changePassword,
		hasRole,
		hasPermission,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
