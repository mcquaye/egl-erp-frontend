import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";

interface User {
	id: string;
	email: string;
	name: string;
	role: "admin" | "user" | "manager";
}

interface JWTPayload {
	id: string;
	email: string;
	name: string;
	role: "admin" | "user" | "manager";
	exp: number;
	iat: number;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
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
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Role-based permissions mapping
	const rolePermissions = {
		admin: ["read", "write", "delete", "manage_users", "view_all_reports", "manage_settings"],
		manager: ["read", "write", "view_reports", "manage_team"],
		user: ["read", "view_own_reports"],
	};

	// Utility function to create mock JWT token
	const createMockJWT = (userData: User): string => {
		const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
		const payload = btoa(
			JSON.stringify({
				...userData,
				exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
				iat: Math.floor(Date.now() / 1000),
			})
		);
		const signature = btoa("mock_signature");
		return `${header}.${payload}.${signature}`;
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

				if (token) {
					const decoded = decodeJWT(token);
					if (decoded) {
						setUser({
							id: decoded.id,
							email: decoded.email,
							name: decoded.name,
							role: decoded.role,
						});
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
			// Simulate API call - replace with actual API integration
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock validation - replace with real authentication
			// Define mock users with different roles
			const mockUsers = [
				{
					email: "admin@electrolandgh.com",
					password: "admin123",
					userData: {
						id: "1",
						email: "admin@electrolandgh.com",
						name: "Admin User",
						role: "admin" as const,
					},
				},
				{
					email: "manager@electrolandgh.com",
					password: "manager123",
					userData: {
						id: "2",
						email: "manager@electrolandgh.com",
						name: "Manager User",
						role: "manager" as const,
					},
				},
				{
					email: "user@electrolandgh.com",
					password: "user123",
					userData: {
						id: "3",
						email: "user@electrolandgh.com",
						name: "Regular User",
						role: "user" as const,
					},
				},
			];

			const foundUser = mockUsers.find((u) => u.email === email && u.password === password);

			if (foundUser) {
				const token = createMockJWT(foundUser.userData);

				// Store auth data
				localStorage.setItem("auth_token", token);
				localStorage.setItem("user_data", JSON.stringify(foundUser.userData));
				setUser(foundUser.userData);

				toast.success("Login successful!");

				return { success: true };
			} else {
				return { success: false, error: "Invalid email or password" };
			}
		} catch (error) {
			return { success: false, error: "Login failed. Please try again." };
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (
		email: string,
		_password: string,
		name: string
	): Promise<{ success: boolean; error?: string }> => {
		setIsLoading(true);

		try {
			// Simulate API call - replace with actual API integration
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock registration - replace with real API
			const userData: User = {
				id: Date.now().toString(),
				email: email,
				name: name,
				role: "user", // Default role for new users
			};

			const token = createMockJWT(userData);

			// Store auth data
			localStorage.setItem("auth_token", token);
			localStorage.setItem("user_data", JSON.stringify(userData));
			setUser(userData);

			toast.success("Registration successful!");

			return { success: true };
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

	const logout = () => {
		localStorage.removeItem("auth_token");
		localStorage.removeItem("user_data");
		setUser(null);
		toast.success("Logged out successfully!");
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
