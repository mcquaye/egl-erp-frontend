/**
 * Universal Metadata Stripper
 * Removes metadata from various file types including images, documents, and media files
 */

interface MetadataStripResult {
	file: File;
	originalSize: number;
	newSize: number;
	metadataRemoved: boolean;
	stripMethod: string;
}

interface FileTypeConfig {
	extensions: string[];
	mimeTypes: string[];
	stripMethod: "canvas" | "binary" | "rewrite" | "unsupported";
	description: string;
}

// Configuration for different file types
const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
	jpeg: {
		extensions: ["jpg", "jpeg"],
		mimeTypes: ["image/jpeg"],
		stripMethod: "canvas",
		description: "JPEG images with EXIF data removal",
	},
	png: {
		extensions: ["png"],
		mimeTypes: ["image/png"],
		stripMethod: "canvas",
		description: "PNG images with metadata chunk removal",
	},
	webp: {
		extensions: ["webp"],
		mimeTypes: ["image/webp"],
		stripMethod: "canvas",
		description: "WebP images with metadata removal",
	},
	gif: {
		extensions: ["gif"],
		mimeTypes: ["image/gif"],
		stripMethod: "binary",
		description: "GIF images with comment removal",
	},
	pdf: {
		extensions: ["pdf"],
		mimeTypes: ["application/pdf"],
		stripMethod: "binary",
		description: "PDF documents with metadata removal",
	},
	docx: {
		extensions: ["docx"],
		mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
		stripMethod: "rewrite",
		description: "Word documents with properties removal",
	},
	xlsx: {
		extensions: ["xlsx"],
		mimeTypes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
		stripMethod: "rewrite",
		description: "Excel spreadsheets with properties removal",
	},
	mp3: {
		extensions: ["mp3"],
		mimeTypes: ["audio/mpeg"],
		stripMethod: "binary",
		description: "MP3 audio files with ID3 tag removal",
	},
	mp4: {
		extensions: ["mp4"],
		mimeTypes: ["video/mp4"],
		stripMethod: "unsupported",
		description: "MP4 video files (metadata stripping not supported in browser)",
	},
};

/**
 * Detect file type configuration
 */
const getFileTypeConfig = (file: File): FileTypeConfig | null => {
	const extension = file.name.split(".").pop()?.toLowerCase() || "";

	for (const config of Object.values(FILE_TYPE_CONFIGS)) {
		if (config.extensions.includes(extension) || config.mimeTypes.includes(file.type)) {
			return config;
		}
	}
	return null;
};

/**
 * Strip metadata from images using Canvas API
 */
const stripImageMetadataCanvas = async (file: File): Promise<MetadataStripResult> => {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			try {
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				ctx?.drawImage(img, 0, 0);

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const strippedFile = new File([blob], file.name, {
								type: file.type,
								lastModified: Date.now(),
							});

							resolve({
								file: strippedFile,
								originalSize: file.size,
								newSize: strippedFile.size,
								metadataRemoved: true,
								stripMethod: "canvas",
							});
						} else {
							reject(new Error("Failed to create blob from canvas"));
						}
					},
					file.type,
					0.98
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
 * Strip metadata from PDF files
 */
const stripPdfMetadata = async (file: File): Promise<MetadataStripResult> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				if (reader.result instanceof ArrayBuffer) {
					const data = new Uint8Array(reader.result);
					let content = new TextDecoder("latin1").decode(data);

					// Remove common PDF metadata patterns
					content = content.replace(/\/Title\s*\([^)]*\)/g, "");
					content = content.replace(/\/Author\s*\([^)]*\)/g, "");
					content = content.replace(/\/Subject\s*\([^)]*\)/g, "");
					content = content.replace(/\/Keywords\s*\([^)]*\)/g, "");
					content = content.replace(/\/Creator\s*\([^)]*\)/g, "");
					content = content.replace(/\/Producer\s*\([^)]*\)/g, "");
					content = content.replace(/\/CreationDate\s*\([^)]*\)/g, "");
					content = content.replace(/\/ModDate\s*\([^)]*\)/g, "");

					const strippedData = new TextEncoder().encode(content);
					const strippedFile = new File([strippedData], file.name, {
						type: file.type,
						lastModified: Date.now(),
					});

					resolve({
						file: strippedFile,
						originalSize: file.size,
						newSize: strippedFile.size,
						metadataRemoved: true,
						stripMethod: "binary",
					});
				}
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error("Failed to read PDF file"));
		reader.readAsArrayBuffer(file);
	});
};

/**
 * Strip ID3 tags from MP3 files
 */
const stripMp3Metadata = async (file: File): Promise<MetadataStripResult> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				if (reader.result instanceof ArrayBuffer) {
					const data = new Uint8Array(reader.result);
					let start = 0;
					let end = data.length;

					// Check for ID3v2 tag at beginning
					if (data.length >= 10 && data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
						const size =
							((data[6] & 0x7f) << 21) |
							((data[7] & 0x7f) << 14) |
							((data[8] & 0x7f) << 7) |
							(data[9] & 0x7f);
						start = 10 + size;
					}

					// Check for ID3v1 tag at end
					if (
						data.length >= 128 &&
						data[data.length - 128] === 0x54 &&
						data[data.length - 127] === 0x41 &&
						data[data.length - 126] === 0x47
					) {
						end = data.length - 128;
					}

					const strippedData = data.slice(start, end);
					const strippedFile = new File([strippedData], file.name, {
						type: file.type,
						lastModified: Date.now(),
					});

					resolve({
						file: strippedFile,
						originalSize: file.size,
						newSize: strippedFile.size,
						metadataRemoved: start > 0 || end < data.length,
						stripMethod: "binary",
					});
				}
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error("Failed to read MP3 file"));
		reader.readAsArrayBuffer(file);
	});
};

/**
 * Strip GIF comments
 */
const stripGifMetadata = async (file: File): Promise<MetadataStripResult> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			try {
				if (reader.result instanceof ArrayBuffer) {
					const data = new Uint8Array(reader.result);
					const output = [];
					let i = 0;
					let metadataRemoved = false;

					// Copy GIF header
					if (data.length < 6 || !(data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46)) {
						throw new Error("Invalid GIF file");
					}

					// Copy header (6 bytes)
					for (let j = 0; j < 6; j++) {
						output.push(data[j]);
					}
					i = 6;

					// Process the rest, removing comment extensions
					while (i < data.length) {
						if (data[i] === 0x21 && data[i + 1] === 0xfe) {
							// Comment extension - skip it
							i += 2;
							while (i < data.length && data[i] !== 0x00) {
								i += data[i] + 1;
							}
							i++; // skip the terminator
							metadataRemoved = true;
						} else {
							output.push(data[i]);
							i++;
						}
					}

					const strippedFile = new File([new Uint8Array(output)], file.name, {
						type: file.type,
						lastModified: Date.now(),
					});

					resolve({
						file: strippedFile,
						originalSize: file.size,
						newSize: strippedFile.size,
						metadataRemoved,
						stripMethod: "binary",
					});
				}
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error("Failed to read GIF file"));
		reader.readAsArrayBuffer(file);
	});
};

/**
 * Main metadata stripping function
 */
export const stripFileMetadata = async (file: File): Promise<MetadataStripResult> => {
	const config = getFileTypeConfig(file);

	if (!config) {
		throw new Error(`Unsupported file type: ${file.type}`);
	}

	if (config.stripMethod === "unsupported") {
		throw new Error(
			`Metadata stripping not supported for ${file.type} files in browser environment`
		);
	}

	switch (config.stripMethod) {
		case "canvas":
			return stripImageMetadataCanvas(file);
		case "binary":
			if (file.type === "application/pdf") {
				return stripPdfMetadata(file);
			} else if (file.type === "audio/mpeg") {
				return stripMp3Metadata(file);
			} else if (file.type === "image/gif") {
				return stripGifMetadata(file);
			}
			throw new Error(`Binary stripping not implemented for ${file.type}`);
		case "rewrite":
			throw new Error(`Office document metadata stripping requires specialized libraries`);
		default:
			throw new Error(`Unknown strip method: ${config.stripMethod}`);
	}
};

/**
 * Check if file type is supported for metadata stripping
 */
export const isMetadataStrippingSupported = (file: File): boolean => {
	const config = getFileTypeConfig(file);
	return config !== null && config.stripMethod !== "unsupported";
};

/**
 * Get supported file types
 */
export const getSupportedFileTypes = (): Record<string, FileTypeConfig> => {
	return Object.fromEntries(
		Object.entries(FILE_TYPE_CONFIGS).filter(([_, config]) => config.stripMethod !== "unsupported")
	);
};

/**
 * Detect if file likely contains metadata
 */
export const detectMetadata = async (file: File): Promise<boolean> => {
	const config = getFileTypeConfig(file);
	if (!config) return false;

	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result instanceof ArrayBuffer) {
				const view = new DataView(reader.result);

				try {
					switch (file.type) {
						case "image/jpeg":
							// Look for EXIF marker (0xFFE1)
							for (let i = 0; i < Math.min(view.byteLength - 1, 1000); i++) {
								if (view.getUint8(i) === 0xff && view.getUint8(i + 1) === 0xe1) {
									resolve(true);
									return;
								}
							}
							break;

						case "image/png":
							// Look for text chunks
							for (let i = 8; i < Math.min(view.byteLength - 4, 1000); i++) {
								const chunk = new TextDecoder().decode(
									new Uint8Array(reader.result as ArrayBuffer, i, 4)
								);
								if (["tEXt", "zTXt", "iTXt"].includes(chunk)) {
									resolve(true);
									return;
								}
							}
							break;

						case "audio/mpeg":
							// Look for ID3 tags
							if (
								view.byteLength >= 10 &&
								view.getUint8(0) === 0x49 &&
								view.getUint8(1) === 0x44 &&
								view.getUint8(2) === 0x33
							) {
								resolve(true);
								return;
							}
							break;

						case "application/pdf": {
							// Look for metadata entries
							const content = new TextDecoder("latin1").decode(reader.result as ArrayBuffer);
							if (/\/(Title|Author|Subject|Keywords|Creator|Producer)/i.test(content)) {
								resolve(true);
								return;
							}
							break;
						}
					}
					resolve(false);
				} catch {
					resolve(false);
				}
			} else {
				resolve(false);
			}
		};
		reader.onerror = () => resolve(false);
		reader.readAsArrayBuffer(file);
	});
};

/**
 * Batch strip metadata from multiple files
 */
export const stripMultipleFiles = async (files: File[]): Promise<MetadataStripResult[]> => {
	const results: MetadataStripResult[] = [];

	for (const file of files) {
		try {
			const result = await stripFileMetadata(file);
			results.push(result);
		} catch (error) {
			results.push({
				file,
				originalSize: file.size,
				newSize: file.size,
				metadataRemoved: false,
				stripMethod: "error",
			});
		}
	}

	return results;
};

export type { MetadataStripResult, FileTypeConfig };
