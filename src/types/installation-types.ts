// Installation-related types and interfaces

import { z } from "zod";

// ========== INSTALLATION DATA INTERFACES ==========

export interface InstallationItem {
	username: string;
	invoice_no: string;
	invoice_date: string; // YYYY-MM-DD format
	customer_name: string;
	custcode: string;
	contact_person: string;
	contact_number: string;
	email: string;
	item_code: string;
	description: string;
	serial_no: string;
	delivery_no: string;
	delivery_date: string; // YYYY-MM-DD format
	qty: number;
	classification: string;
	group: string;
	branch: string;
	brand: string;
	comp_code: string;
}

export interface InstallationFormResponse {
	serialnum: string;
	data: InstallationItem[];
	error: string | null;
	timestamp: string; // YYYY-MM-DD HH:mm:ss
}

export interface InstallationSubmitResponse {
	message: string;
	data: Record<string, any>; // Echo of submitted data
	timestamp: string; // YYYY-MM-DD HH:mm:ss
}

export interface InstallationSubmitResponse {
	message: string;
	data: Record<string, any>; // Echo of submitted data
	timestamp: string; // YYYY-MM-DD HH:mm:ss
}

// ========== JOB CARD INTERFACES ==========

export interface JobCard {
	id: number;
	jobNumber: string;
	jobDate: string; // YYYY-MM-DD format
	serialNumber: string;

	// Original invoice/installation data
	username: string;
	invoiceNo: string;
	invoiceDate: string; // YYYY-MM-DD format
	customerName: string;
	customerCode: string;
	contactPerson?: string;
	contactNumber?: string;
	email?: string;
	itemCode: string;
	description: string;
	deliveryNo: string;
	deliveryDate: string; // YYYY-MM-DD format
	qty: string;
	classification: string;
	group: string;
	branch: string;
	brand: string;

	// Job card specific data
	jobStatus: string;
	assignedTo?: string; // Person assigned to handle the job card
	remarks?: string;
	appNumber?: string;
	appDate?: string; // YYYY-MM-DD format
	gpsLocation?: string;

	// Installation images
	serialImage?: string; // URL to serial number image
	indoorImage?: string; // URL to indoor scene image
	outdoorImage?: string; // URL to outdoor scene image
	signature?: string; // Base64 encoded signature

	// User who created the job card
	createdBy: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
}

export interface JobCardCreateRequest {
	// Core job card data
	serialNumber: string;
	jobDate: string; // YYYY-MM-DD format
	jobStatus: string;
	remarks?: string;
	appNumber?: string;
	appDate?: string; // YYYY-MM-DD format
	gpsLocation?: string;
	serialImage?: string;
	indoorImage?: string;
	outdoorImage?: string;
	signature?: string;

	// Installation data from Oracle (copied to MySQL for job card)
	username?: string;
	invoiceNo?: string;
	invoiceDate?: string;
	customerName?: string;
	customerCode?: string;
	contactPerson?: string;
	contactNumber?: string;
	email?: string;
	itemCode?: string;
	description?: string;
	deliveryNo?: string;
	deliveryDate?: string;
	qty?: string;
	classification?: string;
	group?: string;
	branch?: string;
	brand?: string;
	createdBy?: number;
}

export interface JobCardResponse {
	message: string;
	data: JobCard;
	timestamp: string;
}

export interface JobCardListResponse {
	message: string;
	data: JobCard[];
	total: number;
	page: number;
	limit: number;
	timestamp: string;
}

export interface JobCardStatusOption {
	statusCode: string;
	status: string;
}

export interface JobCardStatusResponse {
	message: string;
	data: JobCardStatusOption[];
	timestamp: string;
}

export interface ExistingJobCard {
	jobNumber: string;
	jobDate: string; // YYYY-MM-DD format
	remarks?: string;
	appNumber?: string;
	appDate?: string; // YYYY-MM-DD format
}

export interface ExistingJobCardsResponse {
	message: string;
	data: ExistingJobCard[];
	timestamp: string;
}

export interface InstallationSubmitRequest {
	serialnum: string;
	technician_name: string;
	installation_date: string;
	installation_notes?: string;
	customer_signature?: string;
	images?: string[]; // Base64 encoded images or URLs
	gps_coordinates?: {
		latitude: number;
		longitude: number;
		accuracy?: number;
	};
	installation_status: "completed" | "partial" | "failed";
}

// ========== ZOD VALIDATION SCHEMAS ==========

// Installation item validation
export const InstallationItemSchema = z.object({
	username: z.string().min(1, "Username is required"),
	invoice_no: z.string().min(1, "Invoice number is required"),
	invoice_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
	customer_name: z.string().min(1, "Customer name is required"),
	custcode: z.string().min(1, "Customer code is required"),
	contact_person: z.string().min(1, "Contact person is required"),
	contact_number: z.string().min(1, "Contact number is required"),
	email: z.string().email("Invalid email format"),
	item_code: z.string().min(1, "Item code is required"),
	description: z.string().min(1, "Description is required"),
	serial_no: z.string().min(1, "Serial number is required"),
	delivery_no: z.string().min(1, "Delivery number is required"),
	delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
	qty: z.number().positive("Quantity must be positive"),
	classification: z.string().min(1, "Classification is required"),
	group: z.string().min(1, "Group is required"),
	branch: z.string().min(1, "Branch is required"),
	brand: z.string().min(1, "Brand is required"),
	comp_code: z.string().min(1, "Company code is required"),
});

// Installation form response validation
export const InstallationFormResponseSchema = z.object({
	serialnum: z.string().min(1, "Serial number is required"),
	data: z.array(InstallationItemSchema),
	error: z.string().nullable(),
	timestamp: z.string(),
});

// Installation submit request validation
export const InstallationSubmitRequestSchema = z.object({
	serialnum: z.string().min(1, "Serial number is required"),
	technician_name: z.string().min(2, "Technician name must be at least 2 characters"),
	installation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
	installation_notes: z.string().optional(),
	customer_signature: z.string().optional(),
	images: z.array(z.string()).optional(),
	gps_coordinates: z
		.object({
			latitude: z.number().min(-90).max(90),
			longitude: z.number().min(-180).max(180),
			accuracy: z.number().positive().optional(),
		})
		.optional(),
	installation_status: z.enum(["completed", "partial", "failed"]),
});

// Job card validation schemas
export const JobCardCreateRequestSchema = z.object({
	serialNumber: z.string().min(1, "Serial number is required"),
	jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
	jobStatus: z.string().min(1, "Job status is required"),
	remarks: z.string().optional(),
	appNumber: z.string().optional(),
	appDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
		.optional(),
	gpsLocation: z.string().optional(),
	serialImage: z.string().optional(),
	indoorImage: z.string().optional(),
	outdoorImage: z.string().optional(),
	signature: z.string().optional(),
});

export const JobCardSchema = z.object({
	id: z.number(),
	jobNumber: z.string(),
	jobDate: z.string(),
	serialNumber: z.string(),
	username: z.string(),
	invoiceNo: z.string(),
	invoiceDate: z.string(),
	customerName: z.string(),
	customerCode: z.string(),
	contactPerson: z.string().optional(),
	contactNumber: z.string().optional(),
	email: z.string().optional(),
	itemCode: z.string(),
	description: z.string(),
	deliveryNo: z.string(),
	deliveryDate: z.string(),
	qty: z.string(),
	classification: z.string(),
	group: z.string(),
	branch: z.string(),
	brand: z.string(),
	jobStatus: z.string(),
	remarks: z.string().optional(),
	appNumber: z.string().optional(),
	appDate: z.string().optional(),
	gpsLocation: z.string().optional(),
	serialImage: z.string().optional(),
	indoorImage: z.string().optional(),
	outdoorImage: z.string().optional(),
	signature: z.string().optional(),
	createdBy: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const JobCardStatusOptionSchema = z.object({
	statusCode: z.string(),
	status: z.string(),
});

export const ExistingJobCardSchema = z.object({
	jobNumber: z.string(),
	jobDate: z.string(),
	remarks: z.string().optional(),
	appNumber: z.string().optional(),
	appDate: z.string().optional(),
});

// GPS coordinates validation
export const GPSCoordinatesSchema = z.object({
	latitude: z
		.number()
		.min(-90, "Latitude must be between -90 and 90")
		.max(90, "Latitude must be between -90 and 90"),
	longitude: z
		.number()
		.min(-180, "Longitude must be between -180 and 180")
		.max(180, "Longitude must be between -180 and 180"),
	accuracy: z.number().positive("Accuracy must be positive").optional(),
	timestamp: z.date().optional(),
});

// Serial number validation
export const SerialNumberSchema = z
	.string()
	.min(1, "Serial number is required")
	.max(50, "Serial number must not exceed 50 characters")
	.regex(
		/^[A-Z0-9-_]+$/i,
		"Serial number can only contain letters, numbers, hyphens, and underscores"
	);

// ========== TYPE INFERENCE FROM ZOD SCHEMAS ==========

export type InstallationItemInput = z.infer<typeof InstallationItemSchema>;
export type InstallationFormResponseInput = z.infer<typeof InstallationFormResponseSchema>;
export type InstallationSubmitRequestInput = z.infer<typeof InstallationSubmitRequestSchema>;
export type GPSCoordinatesInput = z.infer<typeof GPSCoordinatesSchema>;
export type SerialNumberInput = z.infer<typeof SerialNumberSchema>;

// Job card type inference
export type JobCardInput = z.infer<typeof JobCardSchema>;
export type JobCardCreateRequestInput = z.infer<typeof JobCardCreateRequestSchema>;
export type JobCardStatusOptionInput = z.infer<typeof JobCardStatusOptionSchema>;
export type ExistingJobCardInput = z.infer<typeof ExistingJobCardSchema>;

// ========== INSTALLATION STATE TYPES ==========

export interface InstallationState {
	currentInstallation: {
		serialnum: string | null;
		data: InstallationItem[];
		error: string | null;
		timestamp: string | null;
	};
	submissionHistory: Array<{
		id: string;
		serialnum: string;
		data: Record<string, any>;
		timestamp: string;
		status: "completed" | "partial" | "failed";
	}>;
	isLoading: boolean;
	lastSearchedSerial: string | null;
	currentLocation: {
		latitude: number | null;
		longitude: number | null;
		accuracy: number | null;
		timestamp: Date | null;
	};
}
