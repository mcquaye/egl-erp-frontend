// Central export for all types

// User-related types
export * from "./user-types";

// Installation-related types
export * from "./installation-types";

// API-related types
export * from "./api-types";

// Re-export commonly used types for convenience
export type {
	// User types
	User,
	AuthUser,
	CreateUserData,
	UpdateUserData,
	LoginData,
} from "./user-types";

export type {
	// Installation types
	InstallationItem,
	InstallationFormResponse,
	InstallationSubmitRequest,
	InstallationSubmitResponse,
	InstallationState,
	// Job card types
	JobCard,
	JobCardCreateRequest,
	JobCardResponse,
	JobCardListResponse,
	JobCardStatusOption,
	JobCardStatusResponse,
	ExistingJobCard,
	ExistingJobCardsResponse,
} from "./installation-types";

export type {
	// API types
	LoginRequest,
	LoginResponse,
	ApiErrorResponse,
	HealthResponse,
	DBTestResponse,
	UsersListResponse,
	ApiSuccessResponse,
	PaginatedResponse,
} from "./api-types";

export type {
	InstallationItemInput,
	InstallationSubmitRequestInput,
	GPSCoordinatesInput,
	// Job card input types
	JobCardInput,
	JobCardCreateRequestInput,
	JobCardStatusOptionInput,
	ExistingJobCardInput,
} from "./installation-types";
