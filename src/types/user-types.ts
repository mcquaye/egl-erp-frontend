// User types matching Prisma schema
import { z } from "zod";

export enum UserRole {
	ADMIN = "ADMIN",
	MANAGER = "MANAGER",
	USER = "USER",
}

export enum VerificationStatus {
	PENDING = "PENDING",
	VERIFIED = "VERIFIED",
}

export interface User {
	id: number;
	name: string;
	email: string;
	phoneNumber?: string | null;
	companyName?: string | null;
	companyPhoneNumber?: string | null;
	password: string;
	role: string;
	verificationStatus: VerificationStatus;
	verificationToken?: string | null;
	verificationExpiry?: Date | null;
	resetToken?: string | null;
	resetTokenExpiry?: Date | null;
	// Location tracking fields
	lastKnownLatitude?: number | null;
	lastKnownLongitude?: number | null;
	lastKnownAddress?: string | null;
	lastLocationUpdate?: Date | null;
	locationPermission: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Omit password for client-side use
export interface SafeUser extends Omit<User, "password" | "verificationToken" | "resetToken"> {}

// For authentication context
export interface AuthUser {
	id: number;
	name: string;
	email: string;
	phoneNumber?: string | null;
	companyName?: string | null;
	companyPhoneNumber?: string | null;
	role: string;
	verificationStatus: VerificationStatus;
	// Location tracking fields
	lastKnownLatitude?: number | null;
	lastKnownLongitude?: number | null;
	lastKnownAddress?: string | null;
	lastLocationUpdate?: Date | null;
	locationPermission: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// For user creation/registration
export interface CreateUserData {
	name: string;
	email: string;
	phoneNumber?: string;
	companyName?: string;
	companyPhoneNumber?: string;
	password: string;
	role?: string;
}

// For user updates
export interface UpdateUserData {
	name?: string;
	email?: string;
	phoneNumber?: string;
	companyName?: string;
	companyPhoneNumber?: string;
	role?: string;
	verificationStatus?: VerificationStatus;
	// Location updates
	lastKnownLatitude?: number;
	lastKnownLongitude?: number;
	lastKnownAddress?: string;
	locationPermission?: boolean;
}

// Location-specific interfaces
export interface LocationData {
	latitude: number;
	longitude: number;
	address?: string;
	timestamp: Date;
}

export interface LocationPermissionRequest {
	userId: number;
	granted: boolean;
}

export interface LocationUpdateData {
	userId: number;
	latitude: number;
	longitude: number;
	address?: string;
}

// For password reset
export interface PasswordResetData {
	token: string;
	newPassword: string;
}

// For login
export interface LoginData {
	email: string;
	password: string;
}

// JWT Payload type
export interface JWTPayload {
	userId: number;
	email: string;
	role: string;
	name: string;
	iat?: number;
	exp?: number;
}

// ========== ZOD VALIDATION SCHEMAS ==========

// Zod enum schemas
export const UserRoleSchema = z.nativeEnum(UserRole);
export const VerificationStatusSchema = z.nativeEnum(VerificationStatus);

// Base validation schemas
export const emailSchema = z.string().email("Invalid email format").min(1, "Email is required");

export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const nameSchema = z
	.string()
	.min(2, "Name must be at least 2 characters")
	.max(50, "Name must not exceed 50 characters")
	.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

export const phoneNumberSchema = z
	.string()
	.regex(/^[+]?([1-9][\d]{0,15})$/, "Invalid phone number format")
	.optional()
	.or(z.literal(""));

// Location validation schemas
export const latitudeSchema = z
	.number()
	.min(-90, "Latitude must be between -90 and 90")
	.max(90, "Latitude must be between -90 and 90");

export const longitudeSchema = z
	.number()
	.min(-180, "Longitude must be between -180 and 180")
	.max(180, "Longitude must be between -180 and 180");

export const addressSchema = z
	.string()
	.min(1, "Address cannot be empty")
	.max(255, "Address must not exceed 255 characters")
	.optional();

// User validation schemas
export const UserSchema = z.object({
	id: z.number().int().positive(),
	name: nameSchema,
	email: emailSchema,
	companyName: z.string().nullable().optional(),
	companyPhoneNumber: z.string().nullable().optional(),
	phoneNumber: z.string().nullable().optional(),
	password: z.string(), // Don't validate password here since it's hashed
	role: z.string(),
	verificationStatus: VerificationStatusSchema,
	verificationToken: z.string().nullable().optional(),
	verificationExpiry: z.date().nullable().optional(),
	resetToken: z.string().nullable().optional(),
	resetTokenExpiry: z.date().nullable().optional(),
	// Location fields
	lastKnownLatitude: latitudeSchema.nullable().optional(),
	lastKnownLongitude: longitudeSchema.nullable().optional(),
	lastKnownAddress: addressSchema.nullable(),
	lastLocationUpdate: z.date().nullable().optional(),
	locationPermission: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const SafeUserSchema = UserSchema.omit({
	password: true,
	verificationToken: true,
	resetToken: true,
});

export const AuthUserSchema = z.object({
	id: z.number().int().positive(),
	name: nameSchema,
	email: emailSchema,
	phoneNumber: z.string().nullable().optional(),
	companyName: z.string().nullable().optional(),
	companyPhoneNumber: z.string().nullable().optional(),
	role: z.string(),
	verificationStatus: VerificationStatusSchema,
	// Location fields
	lastKnownLatitude: latitudeSchema.nullable().optional(),
	lastKnownLongitude: longitudeSchema.nullable().optional(),
	lastKnownAddress: addressSchema.nullable(),
	lastLocationUpdate: z.date().nullable().optional(),
	locationPermission: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
});

// Form validation schemas
export const CreateUserDataSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	phoneNumber: phoneNumberSchema,
	companyName: z.string().nullable().optional(),
	companyPhoneNumber: z.string().nullable().optional(),
	password: passwordSchema,
	role: z.string().optional().default("user"),
});

export const UpdateUserDataSchema = z.object({
	name: nameSchema.optional(),
	email: emailSchema.optional(),
	phoneNumber: phoneNumberSchema,
	role: z.string().optional(),
	companyName: z.string().nullable().optional(),
	companyPhoneNumber: z.string().nullable().optional(),
	verificationStatus: VerificationStatusSchema.optional(),
	// Location updates
	lastKnownLatitude: latitudeSchema.optional(),
	lastKnownLongitude: longitudeSchema.optional(),
	lastKnownAddress: addressSchema,
	locationPermission: z.boolean().optional(),
});

// Location-specific validation schemas
export const LocationDataSchema = z.object({
	latitude: latitudeSchema,
	longitude: longitudeSchema,
	address: addressSchema,
	timestamp: z.date(),
});

export const LocationPermissionRequestSchema = z.object({
	userId: z.number().int().positive(),
	granted: z.boolean(),
});

export const LocationUpdateDataSchema = z.object({
	userId: z.number().int().positive(),
	latitude: latitudeSchema,
	longitude: longitudeSchema,
	address: addressSchema,
});

export const PasswordResetDataSchema = z.object({
	token: z.string().min(1, "Reset token is required"),
	newPassword: passwordSchema,
});

export const LoginDataSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export const JWTPayloadSchema = z.object({
	userId: z.number().int().positive(),
	email: emailSchema,
	phoneNumber: phoneNumberSchema,
	role: z.string(),
	name: nameSchema,
	iat: z.number().optional(),
	exp: z.number().optional(),
});

// Password change validation
export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: passwordSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Registration validation (with password confirmation)
export const RegisterDataSchema = z
	.object({
		name: nameSchema,
		email: emailSchema,
		phoneNumber: phoneNumberSchema,
		companyName: z.string().nullable().optional(),
		companyPhoneNumber: z.string().nullable().optional(),
		password: passwordSchema,
		confirmPassword: z.string(),
		role: z.string().optional().default("user"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Email verification
export const EmailVerificationSchema = z.object({
	token: z.string().min(1, "Verification token is required"),
	email: emailSchema,
});

// Password reset request
export const PasswordResetRequestSchema = z.object({
	email: emailSchema,
});

// Type inference from Zod schemas
export type CreateUserDataInput = z.infer<typeof CreateUserDataSchema>;
export type UpdateUserDataInput = z.infer<typeof UpdateUserDataSchema>;
export type PasswordResetDataInput = z.infer<typeof PasswordResetDataSchema>;
export type LoginDataInput = z.infer<typeof LoginDataSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type RegisterDataInput = z.infer<typeof RegisterDataSchema>;
export type EmailVerificationInput = z.infer<typeof EmailVerificationSchema>;
export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>;

// Location-related type inference
export type LocationDataInput = z.infer<typeof LocationDataSchema>;
export type LocationPermissionRequestInput = z.infer<typeof LocationPermissionRequestSchema>;
export type LocationUpdateDataInput = z.infer<typeof LocationUpdateDataSchema>;
