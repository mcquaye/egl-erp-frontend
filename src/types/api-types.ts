// API-related types for backend communication

// ========== AUTH API TYPES ==========

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	success: boolean;
	token?: string;
	user?: {
		id: number;
		email: string;
		name: string;
		phoneNumber?: string | null;
		role: string;
	};
	error?: string;
}

// Users List Response (Protected route)
export interface UsersListResponse {
	users: Array<{
		id: number;
		name: string;
		email: string;
		phoneNumber?: string | null;
		role: string;
		createdAt: string;
		updatedAt: string;
	}>;
	total: number;
	timestamp: string;
}

// ========== SYSTEM API TYPES ==========

export interface HealthResponse {
	status: "healthy";
	timestamp: string; // YYYY-MM-DD HH:mm:ss
	version: string;
}

export interface DBTestResponse {
	status: "success" | "error";
	message: string;
	timestamp: string; // YYYY-MM-DD HH:mm:ss
}

// ========== GENERIC API TYPES ==========

export interface ApiErrorResponse {
	error: string;
	message?: string;
	timestamp: string;
	statusCode?: number;
}

export interface ApiSuccessResponse<T = any> {
	success: boolean;
	data: T;
	message?: string;
	timestamp: string;
}

export interface PaginatedResponse<T = any> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	timestamp: string;
}

// ========== HTTP STATUS CODES ==========

export enum HttpStatusCode {
	OK = 200,
	CREATED = 201,
	NO_CONTENT = 204,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	NOT_FOUND = 404,
	CONFLICT = 409,
	UNPROCESSABLE_ENTITY = 422,
	INTERNAL_SERVER_ERROR = 500,
	SERVICE_UNAVAILABLE = 503,
}

// ========== API ENDPOINTS ==========

export const API_ENDPOINTS = {
	// Auth endpoints
	AUTH: {
		LOGIN: "/login",
		LOGOUT: "/logout",
		REFRESH: "/refresh",
		USERS: "/users",
	},
	// Installation endpoints
	INSTALLATION: {
		FORM: "/installation/form",
		SUBMIT: "/installation/submit",
		FORM_LEGACY: "/installation-form",
		SUBMIT_LEGACY: "/submit-installation",
	},
	// System endpoints
	SYSTEM: {
		HEALTH: "/health",
		DB_TEST: "/db-test",
	},
} as const;

// ========== CORS CONFIGURATION ==========

// Note: CORS is typically handled on the backend server, not frontend
// Frontend can only make requests to allowed origins
export interface CorsConfig {
	allowedOrigins: string[];
	allowedMethods: string[];
	allowedHeaders: string[];
	credentials: boolean;
}

// Default CORS configuration for reference
export const DEFAULT_CORS_CONFIG: CorsConfig = {
	allowedOrigins: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5050"],
	allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	credentials: true,
};
