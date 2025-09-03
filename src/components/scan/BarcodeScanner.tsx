import React, { useEffect, useRef, useState } from "react";

type ScanMode = "auto" | "manual" | "file";

type ScanResult = {
	text: string;
	image?: string | Blob;
	timestamp: number;
	mode: ScanMode;
};

type Props = {
	onDetected: (result: ScanResult) => void;
	onClose: () => void;
	defaultMode?: ScanMode;
};

export default function BarcodeScanner({ onDetected, onClose, defaultMode = "auto" }: Props) {
	// Device detection
	const getDeviceType = () => {
		const ua = navigator.userAgent;
		if (/android/i.test(ua)) return "Android";
		if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "iOS";
		return "Other";
	};

	const deviceType = getDeviceType();
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const codeReaderRef = useRef<any | null>(null);
	const [libraryLoaded, setLibraryLoaded] = useState(false);
	const [scanMode, setScanMode] = useState<ScanMode>(defaultMode);
	const [error, setError] = useState<string | null>(null);
	const [scanning, setScanning] = useState(false);
	const [cameraStarted, setCameraStarted] = useState(false);
	const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
	const [selectedCamera, setSelectedCamera] = useState<string>("");
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [processingFile, setProcessingFile] = useState(false);
	const scanningRef = useRef<boolean>(false);
	const isActiveRef = useRef<boolean>(true);
	const hasDetectedRef = useRef<boolean>(false);
	const isMountedRef = useRef<boolean>(true);
	const detectionInProgressRef = useRef<boolean>(false);

	// Load ZXing UMD script at runtime and set a flag when ready
	useEffect(() => {
		if ((window as any).BrowserMultiFormatReader || (window as any).ZXing) {
			setLibraryLoaded(true);
			return;
		}

		const script = document.createElement("script");
		script.src = "https://unpkg.com/@zxing/library@latest/umd/index.min.js";
		script.onload = () => {
			console.log("ZXing library loaded successfully");
			setLibraryLoaded(true);
		};
		script.onerror = () => {
			setError("Failed to load barcode scanner library");
		};
		document.head.appendChild(script);

		return () => {
			try {
				document.head.removeChild(script);
			} catch (e) {
				/* ignore */
			}
		};
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			stopCamera();
		};
	}, []);

	const stopCamera = () => {
		console.log("Stopping camera...");

		// Prevent multiple calls
		if (!isActiveRef.current && !videoRef.current?.srcObject) {
			console.log("Camera already stopped, skipping...");
			return;
		}

		scanningRef.current = false;
		isActiveRef.current = false;

		// Reset ZXing reader FIRST to stop continuous decoding
		if (codeReaderRef.current) {
			try {
				console.log("Resetting ZXing reader...");
				codeReaderRef.current.reset();
				console.log("ZXing reader reset successfully");
			} catch (e) {
				console.warn("Error resetting code reader:", e);
			}
			try {
				// Also try to stop decoding if the method exists
				if (typeof codeReaderRef.current.stopContinuousDecode === "function") {
					codeReaderRef.current.stopContinuousDecode();
					console.log("Stopped continuous decode");
				}
			} catch (e) {
				console.warn("Error stopping continuous decode:", e);
			}
			codeReaderRef.current = null;
		}

		// Stop the media tracks immediately
		if (videoRef.current && videoRef.current.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			console.log("Stopping", stream.getTracks().length, "media tracks");
			stream.getTracks().forEach((track) => {
				try {
					console.log("Stopping track:", track.label, "State:", track.readyState);
					track.stop();
					console.log("Track stopped, new state:", track.readyState);
				} catch (e) {
					console.warn("Error stopping track:", e);
				}
			});

			// Clean up video element immediately
			videoRef.current.srcObject = null;
			videoRef.current.style.display = "none";
			try {
				videoRef.current.pause();
				videoRef.current.load(); // Force reload to clear any cached stream
			} catch (e) {
				console.warn("Error pausing/loading video:", e);
			}
		}

		setScanning(false);
		setCameraStarted(false);

		console.log("Camera stop sequence completed");
	};

	useEffect(() => {
		if (scanMode === "file") return; // Don't start camera for file mode
		if (!videoRef.current) return;
		if (!libraryLoaded) return; // wait for ZXing UMD to load

		scanningRef.current = false;
		isActiveRef.current = true;

		const startCamera = async () => {
			try {
				setError(null);
				setCapturedImage(null);
				const video = videoRef.current;
				if (!video) return;

				// Runtime lookup for ZXing globals from the UMD bundle
				const globalAny = window as any;
				const ZX = globalAny.ZXing || globalAny.ZXingBrowser || globalAny;
				const BrowserMultiFormatReader =
					ZX.BrowserMultiFormatReader || globalAny.BrowserMultiFormatReader;
				const DecodeHintType = ZX.DecodeHintType || globalAny.DecodeHintType;
				const BarcodeFormat = ZX.BarcodeFormat || globalAny.BarcodeFormat;

				if (!BrowserMultiFormatReader) {
					setError("Barcode library not available");
					return;
				}

				// Initialize ZXing code reader with optional hints (if available)
				const hints = new Map<any, any>();
				try {
					// Include QR, DataMatrix and common 1D product barcode formats
					const formats = BarcodeFormat
						? [
								// BarcodeFormat.QR_CODE,
								// BarcodeFormat.DATA_MATRIX,
								BarcodeFormat.EAN_13,
								BarcodeFormat.EAN_8,
								// BarcodeFormat.UPC_A,
								// BarcodeFormat.UPC_E,
								// BarcodeFormat.CODE_128,
								// BarcodeFormat.CODE_39,
								// BarcodeFormat.ITF,
								// BarcodeFormat.CODABAR,
								// BarcodeFormat.AZTEC,
								// BarcodeFormat.CODE_93,
								// BarcodeFormat.PDF_417,
								// BarcodeFormat.MAXICODE,
								// BarcodeFormat.RSS_14,
								// BarcodeFormat.RSS_EXPANDED,
								// BarcodeFormat.UPC_EAN_EXTENSION,
								// BarcodeFormat.MSI,
								// BarcodeFormat.PLESSEY,
								// BarcodeFormat.IMB,
								// BarcodeFormat.PHARMACODE,
								// BarcodeFormat.MICRO_QR_CODE,
						  ]
						: [];
					if (formats.length && DecodeHintType) hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
				} catch (e) {
					// ignore hint construction errors
				}

				const codeReader = new BrowserMultiFormatReader(undefined, hints);
				codeReaderRef.current = codeReader;

				// Get video input devices
				try {
					const videoInputDevices = await codeReader.listVideoInputDevices();
					console.log("Available cameras:", videoInputDevices);
					setAvailableCameras(videoInputDevices);

					if (videoInputDevices.length === 0) {
						setError("No cameras found on this device");
						return;
					}

					// Use selected camera or find rear/back camera
					let selectedDeviceId = selectedCamera || videoInputDevices[0].deviceId;
					if (!selectedCamera) {
						const rearCamera = videoInputDevices.find(
							(device: MediaDeviceInfo) =>
								device.label.toLowerCase().includes("back") ||
								device.label.toLowerCase().includes("rear") ||
								device.label.toLowerCase().includes("environment")
						);
						if (rearCamera) {
							selectedDeviceId = rearCamera.deviceId;
							setSelectedCamera(selectedDeviceId);
							console.log("Using rear camera:", rearCamera.label);
						} else {
							setSelectedCamera(videoInputDevices[0].deviceId);
							console.log("Using default camera:", videoInputDevices[0].label);
						}
					}

					setCameraStarted(true);
					if (scanMode === "auto") {
						setScanning(true);
						scanningRef.current = true;
					}

					// Start video stream
					await codeReader.decodeFromVideoDevice(
						selectedDeviceId,
						video,
						(result: any | null, err: any | null) => {
							if (!isActiveRef.current || !isMountedRef.current) return;

							// Only auto-detect in auto mode
							if (
								scanMode === "auto" &&
								scanningRef.current &&
								result &&
								!detectionInProgressRef.current
							) {
								try {
									// Set flag to prevent multiple detections
									detectionInProgressRef.current = true;

									const text =
										typeof result.getText === "function"
											? result.getText()
											: result.text || String(result);
									console.log("Barcode detected:", text);

									// Immediately stop scanning and camera to prevent multiple detections and memory leak
									scanningRef.current = false;
									setScanning(false);
									console.log("Stopping camera after barcode detection...");
									stopCamera();

									// Capture frame when barcode is detected
									const imageData = captureCurrentFrame();

									const scanResult: ScanResult = {
										text,
										image: imageData,
										timestamp: Date.now(),
										mode: "auto",
									};

									// Call onDetected after stopping camera
									onDetected(scanResult);
								} catch (e) {
									console.warn("Error processing scan result:", e);
									detectionInProgressRef.current = false; // Reset flag on error
								}
								return;
							}

							// Suppress not-found errors if possible
							const isNotFound = (err: any) => {
								if (!err) return false;
								const message = err.message || err.toString();
								return (
									err.name === "NotFoundException" ||
									err.constructor?.name === "NotFoundException" ||
									message.includes("No MultiFormat Readers")
								);
							};

							if (err && !isNotFound(err)) {
								console.error("Decode error:", err);
							}
						}
					);

					// Show video
					video.style.display = "block";
				} catch (devicesError) {
					console.error("Error getting video devices:", devicesError);
					let errorMessage = "Failed to access camera devices.";
					if (devicesError instanceof Error) {
						errorMessage += " " + devicesError.message;
					}
					setError(errorMessage);
				}
			} catch (error: any) {
				console.error("Camera error:", error);
				setError("Camera access failed: " + error.message);
			}
		};

		startCamera();

		// Cleanup function
		return () => {
			isActiveRef.current = false;
			stopCamera();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scanMode, selectedCamera, libraryLoaded]); // onDetected intentionally excluded to prevent camera restart

	const captureCurrentFrame = (callback?: (imageData: string) => void) => {
		if (!videoRef.current || !canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		if (!context) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		context.drawImage(video, 0, 0);

		const imageData = canvas.toDataURL("image/jpeg", 0.9);
		setCapturedImage(imageData);

		if (callback) {
			callback(imageData);
		}

		return imageData;
	};

	const handleManualCapture = async () => {
		if (!videoRef.current) return;

		try {
			setError(null);
			const imageData = captureCurrentFrame();

			if (!imageData) {
				setError("Failed to capture image");
				return;
			}

			// Convert base64 to Image for manual decoding
			const img = new Image();
			img.onload = async () => {
				try {
					// Use the existing code reader instance if available or runtime lookup
					const globalAny = window as any;
					const ZX = globalAny.ZXing || globalAny.ZXingBrowser || globalAny;
					const BrowserMultiFormatReader =
						ZX.BrowserMultiFormatReader || globalAny.BrowserMultiFormatReader;
					const codeReader =
						codeReaderRef.current ||
						(BrowserMultiFormatReader ? new BrowserMultiFormatReader() : null);
					if (!codeReader) {
						setError("Barcode library not available");
						return;
					}
					const result = await codeReader.decodeFromImageElement(img);

					const scanResult: ScanResult = {
						text: result.getText(),
						image: imageData,
						timestamp: Date.now(),
						mode: "manual",
					};

					// Stop camera after successful detection
					stopCamera();
					onDetected(scanResult);
				} catch (decodeError) {
					setError("No barcode found in captured image. Try again with better positioning.");
				}
			};

			img.onerror = () => {
				setError("Failed to load captured image");
			};

			img.src = imageData;
		} catch (error) {
			console.error("Manual capture error:", error);
			setError("Failed to capture and process image");
		}
	};

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setProcessingFile(true);
		setError(null);
		setCapturedImage(null);

		try {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				setError("Please select a valid image file");
				return;
			}

			// Create image element from file
			const img = new Image();
			const objectUrl = URL.createObjectURL(file);

			img.onload = async () => {
				try {
					// Use the existing code reader instance if available or runtime lookup
					const globalAny = window as any;
					const ZX = globalAny.ZXing || globalAny.ZXingBrowser || globalAny;
					const BrowserMultiFormatReader =
						ZX.BrowserMultiFormatReader || globalAny.BrowserMultiFormatReader;
					const codeReader =
						codeReaderRef.current ||
						(BrowserMultiFormatReader ? new BrowserMultiFormatReader() : null);
					if (!codeReader) {
						setError("Barcode library not available");
						return;
					}
					const result = await codeReader.decodeFromImageElement(img);

					// Convert file to base64 for display
					const reader = new FileReader();
					reader.onload = (e) => {
						const imageData = e.target?.result as string;
						setCapturedImage(imageData);

						const scanResult: ScanResult = {
							text: result.getText(),
							image: file, // Store the actual file
							timestamp: Date.now(),
							mode: "file",
						};

						onDetected(scanResult);
					};

					reader.readAsDataURL(file);
				} catch (decodeError) {
					console.error("File decode error:", decodeError);
					setError("No barcode found in the selected image. Please try another image.");
				} finally {
					URL.revokeObjectURL(objectUrl);
				}
			};

			img.onerror = () => {
				setError("Failed to load the selected image file");
				URL.revokeObjectURL(objectUrl);
			};

			img.src = objectUrl;
		} catch (error) {
			console.error("File upload error:", error);
			setError("Failed to process the selected file");
		} finally {
			setProcessingFile(false);
		}
	};

	const ensureCodeReader = () => {
		const globalAny = window as any;
		const ZX = globalAny.ZXing || globalAny.ZXingBrowser || globalAny;
		const BrowserMultiFormatReader =
			ZX?.BrowserMultiFormatReader || globalAny?.BrowserMultiFormatReader;
		if (!BrowserMultiFormatReader) throw new Error("Barcode library not available");
		if (!codeReaderRef.current) {
			try {
				codeReaderRef.current = new BrowserMultiFormatReader();
			} catch (e) {
				throw new Error("Failed to construct barcode reader");
			}
		}
		return codeReaderRef.current;
	};

	const retryDecodeCapturedImage = async () => {
		if (!capturedImage) return;
		setProcessingFile(true);
		setError(null);
		try {
			const img = new Image();
			await new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
				img.src = capturedImage as string;
			});
			const codeReader = ensureCodeReader();
			const result = await codeReader.decodeFromImageElement(img);
			const text =
				typeof result.getText === "function" ? result.getText() : result.text || String(result);
			const scanResult: ScanResult = {
				text,
				image: capturedImage as string,
				timestamp: Date.now(),
				mode: scanMode === "file" ? "file" : "manual",
			};
			onDetected(scanResult);
		} catch (e) {
			console.error("Retry decode error:", e);
			setError("No barcode found. Try a different image or better positioning.");
		} finally {
			setProcessingFile(false);
		}
	};

	const handleCancelInput = () => {
		setCapturedImage(null);
		setError(null);
		setProcessingFile(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
		// Stop camera on cancel to prevent leak
		if (videoRef.current && videoRef.current.srcObject) {
			stopCamera();
		}
	};

	const handleClose = () => {
		scanningRef.current = false;
		stopCamera();
		onClose();
	};

	const handleRetry = () => {
		setError(null);
		setCameraStarted(false);
		setCapturedImage(null);
		scanningRef.current = false;
		isActiveRef.current = true;
		hasDetectedRef.current = false;
		detectionInProgressRef.current = false;

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleModeChange = (mode: ScanMode) => {
		setScanMode(mode);
		setError(null);
		setCapturedImage(null);
		scanningRef.current = false;
		hasDetectedRef.current = false;
		detectionInProgressRef.current = false;
		// Stop camera on mode change
		stopCamera();
		if (mode === "auto") {
			setScanning(true);
			scanningRef.current = true;
		} else {
			setScanning(false);
		}
	};

	const getModeInstructions = (mode: ScanMode): string => {
		switch (mode) {
			case "auto":
				return "Point your camera at a barcode - detection happens automatically";
			case "manual":
				return "Position your camera and click capture to scan";
			case "file":
				return "Upload an image file containing a barcode";
		}
	};

	const getCameraStatus = (): string => {
		if (scanMode === "auto" && scanning) return "Auto Scanning...";
		if (scanMode === "manual" && cameraStarted) return "Position barcode and capture";
		if (cameraStarted) return "Camera ready";
		return "Starting camera...";
	};

	const getDetectionMethod = (mode: ScanMode): string => {
		switch (mode) {
			case "auto":
				return "Detection happens automatically";
			case "manual":
				return "Click capture when ready";
			case "file":
				return "Supports JPG, PNG, and other image formats";
		}
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
			<div className='absolute top-2 right-2 text-xs text-gray-500 bg-white/80 rounded px-2 py-1 shadow'>
				Device: {deviceType}
			</div>
			<div className='w-full max-w-5xl bg-white rounded-lg overflow-hidden shadow-lg mx-4 max-h-[90vh] overflow-y-auto'>
				<div className='flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
					<div className='font-medium'>Barcode Scanner</div>
					<div className='flex items-center gap-2'>
						{cameraStarted && (
							<button
								onClick={stopCamera}
								className='px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-sm text-yellow-800 transition-colors font-medium'>
								Stop Camera
							</button>
						)}
						{error && (
							<button
								onClick={handleRetry}
								className='px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm text-blue-700 transition-colors'>
								Retry
							</button>
						)}
						<button
							onClick={handleClose}
							className='px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-700 transition-colors'>
							Close
						</button>
					</div>
				</div>

				{/* Mode Selection */}
				<div className='border-b bg-gray-50/50'>
					<div className='px-4 py-3'>
						<div className='text-sm font-medium text-gray-700 mb-2'>Scanning Mode:</div>
						<div className='flex gap-2'>
							<button
								onClick={() => handleModeChange("auto")}
								className={`px-3 py-1 rounded text-sm transition-colors ${
									scanMode === "auto"
										? "bg-blue-500 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}>
								Auto Scan
							</button>
							<button
								onClick={() => handleModeChange("manual")}
								className={`px-3 py-1 rounded text-sm transition-colors ${
									scanMode === "manual"
										? "bg-blue-500 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}>
								Manual Capture
							</button>
							<button
								onClick={() => handleModeChange("file")}
								className={`px-3 py-1 rounded text-sm transition-colors ${
									scanMode === "file"
										? "bg-blue-500 text-white"
										: "bg-gray-200 text-gray-700 hover:bg-gray-300"
								}`}>
								Upload File
							</button>
						</div>
					</div>
				</div>

				<div className='p-6'>
					{error ? (
						<div className='text-center py-8'>
							<div className='text-red-600 mb-4'>
								<div className='text-lg font-medium'>Scanner Error</div>
								<div className='text-sm'>{error}</div>
							</div>
							<div className='text-xs text-gray-500 space-y-1'>
								<div>• Click "Retry" to try again</div>
								<div>• Make sure you granted camera permission</div>
								<div>• Try refreshing the page if problems persist</div>
								<div>• Ensure camera is not being used by another app</div>
							</div>
						</div>
					) : scanMode === "file" ? (
						<div className='space-y-4'>
							<div className='text-center'>
								<div className='text-lg font-medium text-gray-800 mb-2'>Upload Image File</div>
								<div className='text-sm text-gray-600 mb-4'>
									Select an image file containing a barcode or QR code
								</div>
								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleFileUpload}
									className='hidden'
								/>
								{capturedImage && error ? (
									<div className='space-x-2'>
										<button
											onClick={retryDecodeCapturedImage}
											disabled={processingFile}
											className='px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded'>
											{processingFile ? "Processing..." : "Retry"}
										</button>
										<button
											onClick={handleCancelInput}
											className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'>
											Cancel
										</button>
									</div>
								) : (
									<button
										onClick={() => fileInputRef.current?.click()}
										disabled={processingFile}
										className='px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors'>
										{processingFile ? "Processing..." : "Select Image"}
									</button>
								)}
							</div>
							{capturedImage && (
								<div className='mt-6'>
									<div className='text-center mb-2'>
										<div className='text-sm font-medium text-gray-700'>Uploaded Image:</div>
									</div>
									<div className='flex justify-center'>
										<img
											src={capturedImage}
											alt='Uploaded'
											className='max-w-full max-h-96 rounded border'
										/>
									</div>
								</div>
							)}
						</div>
					) : (
						<div className='space-y-4'>
							{/* Camera Selection */}
							{availableCameras.length > 1 && (
								<div className='flex items-center justify-center gap-2'>
									<label className='text-sm text-gray-600'>Camera:</label>
									<select
										value={selectedCamera}
										onChange={(e) => setSelectedCamera(e.target.value)}
										className='text-sm border rounded px-2 py-1'>
										{availableCameras.map((camera) => (
											<option key={camera.deviceId} value={camera.deviceId}>
												{camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
											</option>
										))}
									</select>
								</div>
							)}

							<div
								className='relative bg-black rounded-lg overflow-hidden mx-auto'
								style={{ maxWidth: "640px" }}>
								<video
									ref={videoRef}
									className='w-full h-auto'
									muted
									playsInline
									autoPlay
									style={{ display: "none" }}
								/>
								{/* Hidden canvas for capturing frames */}
								<canvas ref={canvasRef} className='hidden' />

								{!cameraStarted && (
									<div className='aspect-video flex items-center justify-center text-white'>
										<div className='text-center'>
											<div className='text-lg mb-2'>Starting camera...</div>
											<div className='text-sm opacity-75'>Please grant camera permission</div>
										</div>
									</div>
								)}

								{scanning && cameraStarted && scanMode === "auto" && (
									<div className='absolute inset-0 pointer-events-none'>
										{/* Scanning overlay */}
										<div className='absolute inset-4 border-2 border-green-400 rounded-lg'>
											<div className='absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400'></div>
											<div className='absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400'></div>
											<div className='absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400'></div>
											<div className='absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400'></div>
										</div>
										{/* Scanning line animation */}
										<div className='absolute inset-x-4 top-1/2 h-0.5 bg-red-500 opacity-75'>
											<div className='w-full h-full bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse'></div>
										</div>
									</div>
								)}

								{cameraStarted && scanMode === "manual" && (
									<div className='absolute inset-0 pointer-events-none'>
										{/* Manual mode overlay */}
										<div className='absolute inset-4 border-2 border-blue-400 rounded-lg'>
											<div className='absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400'></div>
											<div className='absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400'></div>
											<div className='absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400'></div>
											<div className='absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400'></div>
										</div>
									</div>
								)}
							</div>

							{/* Manual capture button */}
							{scanMode === "manual" && cameraStarted && (
								<div className='text-center'>
									{capturedImage && error ? (
										<div className='space-x-2'>
											<button
												onClick={retryDecodeCapturedImage}
												disabled={processingFile}
												className='px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded'>
												{processingFile ? "Processing..." : "Retry"}
											</button>
											<button
												onClick={handleCancelInput}
												className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm'>
												Cancel
											</button>
										</div>
									) : (
										<button
											onClick={handleManualCapture}
											className='px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors'>
											📷 Capture & Scan
										</button>
									)}
								</div>
							)}

							{/* Captured image preview */}
							{capturedImage && scanMode === "manual" && (
								<div className='mt-4'>
									<div className='text-center mb-2'>
										<div className='text-sm font-medium text-gray-700'>Captured Frame:</div>
									</div>
									<div className='flex justify-center'>
										<img src={capturedImage} alt='Captured' className='max-w-xs rounded border' />
									</div>
								</div>
							)}

							<div className='text-center space-y-2'>
								<div className='text-lg font-medium text-gray-800'>{getCameraStatus()}</div>
								<div className='text-sm text-gray-600'>{getModeInstructions(scanMode)}</div>
								{selectedCamera && availableCameras.length > 0 && (
									<div className='text-xs text-gray-500'>
										Using:{" "}
										{availableCameras.find((cam) => cam.deviceId === selectedCamera)?.label ||
											"Selected camera"}
									</div>
								)}
								<div className='text-xs text-gray-500 space-y-1'>
									<div>• Hold steady and ensure good lighting</div>
									<div>• Works with UPC, EAN, Code 128, QR codes, and more</div>
									<div>• {getDetectionMethod(scanMode)}</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
