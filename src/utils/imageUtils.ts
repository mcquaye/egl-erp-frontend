import imageCompression from "browser-image-compression";

// Image compression options
const compressionOptions = {
	maxSizeMB: 0.5, // Maximum size in MB
	maxWidthOrHeight: 1024, // Maximum width or height
	useWebWorker: true,
	fileType: "image/jpeg" as const,
	quality: 0.8, // Quality from 0 to 1
};

/**
 * Compress an image file and convert to base64
 * @param file - The image file to compress
 * @returns Promise<string> - Base64 string of compressed image
 */
export const compressImageToBase64 = async (file: File): Promise<string> => {
	try {
		// Compress the image
		const compressedFile = await imageCompression(file, compressionOptions);

		// Convert to base64
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					resolve(reader.result);
				} else {
					reject(new Error("Failed to convert to base64"));
				}
			};
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(compressedFile);
		});
	} catch (error) {
		console.error("Image compression failed:", error);
		throw new Error("Failed to compress image");
	}
};

/**
 * Generate a short filename for storage
 * @param prefix - Prefix for the filename (e.g., 'serial', 'indoor', 'outdoor', 'signature')
 * @param fileExtension - File extension (default: 'jpg')
 * @returns string - Short filename
 */
export const generateShortFilename = (prefix: string, fileExtension: string = "jpg"): string => {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 6);
	return `${prefix}_${timestamp}_${random}.${fileExtension}`;
};

/**
 * Extract base64 data without the data URL prefix
 * @param dataUrl - Full data URL (data:image/jpeg;base64,...)
 * @returns string - Just the base64 data
 */
export const extractBase64Data = (dataUrl: string): string => {
	const base64Index = dataUrl.indexOf(",");
	return base64Index !== -1 ? dataUrl.substring(base64Index + 1) : dataUrl;
};

/**
 * Get file size in KB from base64 string
 * @param base64String - Base64 string
 * @returns number - Size in KB
 */
export const getBase64SizeInKB = (base64String: string): number => {
	const base64Data = extractBase64Data(base64String);
	const padding = (base64Data.match(/=/g) || []).length;
	const sizeInBytes = (base64Data.length * 3) / 4 - padding;
	return Math.round(sizeInBytes / 1024);
};

/**
 * Validate image file
 * @param file - File to validate
 * @returns boolean - True if valid image
 */
export const validateImageFile = (file: File): boolean => {
	const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
	const maxSize = 10 * 1024 * 1024; // 10MB max before compression

	if (!validTypes.includes(file.type)) {
		throw new Error("Please select a valid image file (JPEG, PNG, or WebP)");
	}

	if (file.size > maxSize) {
		throw new Error("Image file is too large. Please select an image under 10MB");
	}

	return true;
};
