interface ImageUploadOptions {
	stripMetadata?: boolean;
	showMetadataInfo?: boolean;
	compressionQuality?: number;
}

interface FileUploadOptions {
	stripMetadata?: boolean;
	showMetadataInfo?: boolean;
	maxFileSize?: number; // in MB
	allowedTypes?: string[];
}

interface FileUploadResult {
	success: boolean;
	file?: File;
	base64?: string;
	originalSize: number;
	finalSize: number;
	metadataStripped: boolean;
	sizeReduction: number;
	error?: string;
}

export type { ImageUploadOptions, FileUploadOptions, FileUploadResult };
