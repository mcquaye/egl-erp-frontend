import imageCompression from "browser-image-compression";

// Image compression options
const compressionOptions = {
	maxSizeMB: 0.5, // Maximum size in MB
	maxWidthOrHeight: 1024, // Maximum width or height
	useWebWorker: true,
	fileType: "image/jpeg" as const,
	quality: 0.8, // Quality from 0 to 1
	// Strip metadata during compression
	stripMetadata: true,
};

/**
 * Strip metadata from image using Canvas API
 * @param file - The image file to strip metadata from
 * @returns Promise<File> - New file without metadata
 */
const stripImageMetadataCanvas = async (file: File): Promise<File> => {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			try {
				// Set canvas dimensions to match image
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;

				// Draw image to canvas (this strips metadata)
				ctx?.drawImage(img, 0, 0);

				// Convert canvas back to blob
				canvas.toBlob(
					(blob) => {
						if (blob) {
							const strippedFile = new File([blob], file.name, {
								type: file.type,
								lastModified: Date.now(),
							});
							resolve(strippedFile);
						} else {
							reject(new Error("Failed to create blob from canvas"));
						}
					},
					file.type,
					0.95
				);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = URL.createObjectURL(file);
	});
};

/**
 * Compress an image file, strip metadata, and convert to base64
 * @param file - The image file to compress
 * @param stripMetadata - Whether to strip metadata (default: true)
 * @returns Promise<string> - Base64 string of compressed image
 */
export const compressImageToBase64 = async (
	file: File,
	stripMetadata: boolean = true
): Promise<string> => {
	try {
		let processedFile = file;

		// Strip metadata using canvas method if requested
		if (stripMetadata) {
			processedFile = await stripImageMetadataCanvas(file);
		}

		// Compress the image (browser-image-compression also strips metadata when stripMetadata is true)
		const compressedFile = await imageCompression(processedFile, compressionOptions);

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
 * Strip metadata from image without compression
 * @param file - The image file to strip metadata from
 * @returns Promise<File> - New file without metadata
 */
export const stripImageMetadata = async (file: File): Promise<File> => {
	return stripImageMetadataCanvas(file);
};

/**
 * Check if image contains EXIF data
 * @param file - The image file to check
 * @returns Promise<boolean> - True if EXIF data is found
 */
export const hasImageMetadata = async (file: File): Promise<boolean> => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result instanceof ArrayBuffer) {
				const view = new DataView(reader.result);

				// Check for JPEG EXIF marker (0xFFE1)
				if (file.type === "image/jpeg") {
					for (let i = 0; i < view.byteLength - 1; i++) {
						if (view.getUint8(i) === 0xff && view.getUint8(i + 1) === 0xe1) {
							resolve(true);
							return;
						}
					}
				}

				// For PNG, check for text chunks that might contain metadata
				if (file.type === "image/png") {
					const signature = new Uint8Array(reader.result, 0, 8);
					const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
					const isPng = signature.every((byte, index) => byte === pngSignature[index]);

					if (isPng) {
						// Look for text chunks (tEXt, zTXt, iTXt)
						for (let i = 8; i < view.byteLength - 4; i++) {
							const chunkType = new TextDecoder().decode(new Uint8Array(reader.result, i, 4));
							if (["tEXt", "zTXt", "iTXt"].includes(chunkType)) {
								resolve(true);
								return;
							}
						}
					}
				}

				resolve(false);
			} else {
				resolve(false);
			}
		};
		reader.onerror = () => resolve(false);
		reader.readAsArrayBuffer(file);
	});
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
