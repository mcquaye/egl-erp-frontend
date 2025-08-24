import { useState, useRef, useEffect } from "react";

import { Link } from "react-router";
import { useGetInstallationFormQuery } from "../../redux/api/installationApi";
import { useCreateJobCardMutation, useGetAllJobCardsQuery } from "../../redux/api/jobCardApi";
import {
	useGetExistingJobCardsFromOracleQuery,
	useGetJobCardStatusOptionsFromOracleQuery,
} from "../../redux/api/jobCardOracleApi";
import { JobCardCreateRequest } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from "sonner";
import SignatureCanvas from "react-signature-canvas";
import GPSMapComponent from "../../components/Maps/GPSMapComponent";
import {
	compressImageToBase64,
	validateImageFile,
	getBase64SizeInKB,
	hasImageMetadata,
} from "../../utils/imageUtils";
import { isMetadataStrippingSupported, stripFileMetadata } from "../../utils/metaStripper";
import { useAuth } from "../../context/AuthContext";
import BarcodeScanner from "../../components/BarcodeScanner";

export default function CreateJobCardPage() {
	const [serialNumber, setSerialNumber] = useState("");
	const [showScanner, setShowScanner] = useState(false);
	const [searchSerial, setSearchSerial] = useState("");
	const [selectedExistingJobCard, setSelectedExistingJobCard] = useState<any>(null);
	const [showInstallationData, setShowInstallationData] = useState(false);
	const [jobCardData, setJobCardData] = useState<Partial<JobCardCreateRequest>>({
		jobDate: new Date().toISOString().split("T")[0],
	});

	const DEFAULT_CONSENT_MESSAGE = `I hereby confirm that I have purchased one or more Green AC(s) at a reduced purchase price financed through carbon revenues disbursed by the KliK Foundation of Switzerland. In return, I hereby waive my rights to the CO2 emission savings of this AC to the KliK Foundation. I hereby confirm that I did not receive or will apply for any other incentive by any other project funded by carbon or climate finance. I will not move the AC outside of Ghana. In case I sell the AC, I will inform the buyer about this waiver and that it will be passed on automatically to him or her. I agree that my personal data might be used for monitoring purposes and potential periodic monitoring or spot checks during the project period.`;

	// Authenticated User
	const { user } = useAuth();

	// Pagination states
	const [statusPage, setStatusPage] = useState(1);
	const [jobCardsPage, setJobCardsPage] = useState(1);
	const statusItemsPerPage = 6;
	const jobCardsItemsPerPage = 5;

	// Search states
	const [statusSearch, setStatusSearch] = useState("");
	const [jobCardSearch, setJobCardSearch] = useState("");

	// Signature pad ref
	const signaturePadRef = useRef<SignatureCanvas>(null);

	// GPS location handling - Auto-capture on component mount
	const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [locationLoading, setLocationLoading] = useState(false);

	// Auto-capture GPS location on component mount
	useEffect(() => {
		getCurrentLocation();
	}, []);

	// Get all job cards from our MySQL database to check for duplicates
	const { data: allJobCards } = useGetAllJobCardsQuery();

	// API hooks
	const {
		data: installationData,
		isLoading: loadingInstallation,
		error: installationError,
	} = useGetInstallationFormQuery(searchSerial, {
		skip: !searchSerial || !showInstallationData,
	});

	// Get the installation record for easier access
	const installation = showInstallationData ? installationData?.data?.[0] : null;

	// Check for existing job cards in our MySQL database first
	const existingJobCardInMySQL = allJobCards?.jobCards.find(
		(jobCard: any) => jobCard.serialNumber === searchSerial
	);

	// Only fetch Oracle data if no existing job card found in MySQL
	const shouldFetchOracle = searchSerial && !existingJobCardInMySQL;

	// Fetch Oracle data concurrently when installation data is available and no duplicate exists
	const { data: statusOptions, isLoading: loadingStatus } =
		useGetJobCardStatusOptionsFromOracleQuery(undefined, {
			skip: !shouldFetchOracle || !installation, // Only fetch when we have installation data and no duplicate
		});

	const { data: existingJobCards } = useGetExistingJobCardsFromOracleQuery(
		installation?.invoice_date || "",
		{
			skip: !shouldFetchOracle || !installation?.invoice_date, // Only fetch when we have invoice date and no duplicate
		}
	);

	const [createJobCard, { isLoading: creatingJobCard }] = useCreateJobCardMutation();

	// Image loading states
	const [imageLoading, setImageLoading] = useState({
		serial: false,
		indoor: false,
		outdoor: false,
	});

	// File loading states
	const [fileLoading, setFileLoading] = useState({});

	// Handle image compression and upload
	const handleImageUpload = async (file: File, imageType: "serial" | "indoor" | "outdoor") => {
		try {
			// Validate the file first
			validateImageFile(file);

			// Set loading state
			setImageLoading((prev) => ({ ...prev, [imageType]: true }));

			// Compress with metadata stripping and convert to base64
			const compressedBase64 = await compressImageToBase64(file, true); // stripMetadata = true
			const sizeInKB = getBase64SizeInKB(compressedBase64);

			// Update job card data with the compressed image
			const fieldName = `${imageType}Image` as keyof typeof jobCardData;
			setJobCardData((prev) => ({
				...prev,
				[fieldName]: compressedBase64,
			}));

			toast.success(`${imageType} image compressed and added (${sizeInKB}KB)`);
		} catch (error) {
			console.error("Image upload failed:", error);
			toast.error(error instanceof Error ? error.message : "Failed to process image");
		} finally {
			setImageLoading((prev) => ({ ...prev, [imageType]: false }));
		}
	};

	// General file upload handler with metadata stripping
	const handleFileUpload = async (file: File, fieldName: string) => {
		try {
			// Set loading state
			setFileLoading((prev) => ({ ...prev, [fieldName]: true }));

			// Check if metadata stripping is supported for this file type
			const isSupported = isMetadataStrippingSupported(file);
			let processedFile = file;
			let metadataStripped = false;

			if (isSupported) {
				try {
					const result = await stripFileMetadata(file);
					processedFile = result.file;
					metadataStripped = result.metadataRemoved;
				} catch (error) {
					console.warn("Metadata stripping failed, using original file:", error);
				}
			}

			// Convert to base64 for storage
			const base64Data = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result === "string") {
						resolve(reader.result);
					} else {
						reject(new Error("Failed to convert to base64"));
					}
				};
				reader.onerror = () => reject(new Error("Failed to read file"));
				reader.readAsDataURL(processedFile);
			});

			const sizeInKB = Math.round(processedFile.size / 1024);

			// Update data with the processed file
			setJobCardData((prev) => ({
				...prev,
				[fieldName]: base64Data,
			}));

			const metadataMessage = metadataStripped ? " (metadata removed)" : "";
			toast.success(`File uploaded successfully (${sizeInKB}KB)${metadataMessage}`);
		} catch (error) {
			console.error("File upload failed:", error);
			toast.error(error instanceof Error ? error.message : "Failed to process file");
		} finally {
			setFileLoading((prev) => ({ ...prev, [fieldName]: false }));
		}
	};

	// Initialize signature canvas properly
	useEffect(() => {
		const initializeCanvas = () => {
			if (signaturePadRef.current) {
				// Just ensure the signature pad is properly initialized
				// Don't modify canvas dimensions to avoid coordinate issues
				signaturePadRef.current.on();
			}
		};

		// Initialize after a brief delay to ensure DOM is ready
		const timer = setTimeout(initializeCanvas, 150);

		// Handle window resize
		const handleResize = () => {
			const resizeTimer = setTimeout(initializeCanvas, 100);
			return () => clearTimeout(resizeTimer);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const getCurrentLocation = () => {
		setLocationLoading(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const location = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					setCurrentLocation(location);
					setJobCardData((prev) => ({
						...prev,
						gpsLocation: `${location.lat}, ${location.lng}`,
					}));
					setLocationLoading(false);
					toast.success("GPS location captured successfully");
				},
				(error) => {
					console.error("Error getting location:", error);
					setLocationLoading(false);
					let errorMessage = "Failed to get location";
					switch (error.code) {
						case error.PERMISSION_DENIED:
							errorMessage = "Location access denied. Please enable location permissions.";
							break;
						case error.POSITION_UNAVAILABLE:
							errorMessage = "Location information unavailable.";
							break;
						case error.TIMEOUT:
							errorMessage = "Location request timed out.";
							break;
					}
					toast.error(errorMessage);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 300000, // 5 minutes
				}
			);
		} else {
			setLocationLoading(false);
			toast.error("Geolocation is not supported by this browser");
		}
	};

	// Check if all required data is loaded (modified to account for duplicate checking)
	const isDataReady = existingJobCardInMySQL
		? false
		: installation && statusOptions && existingJobCards;

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (serialNumber.trim()) {
			setSearchSerial(serialNumber.trim());
			setShowInstallationData(true);
		}
	};

	const handleSelectExistingJobCard = (jobCard: any) => {
		setSelectedExistingJobCard(jobCard);
		// Pre-fill form with existing job card data
		setJobCardData((prev) => ({
			...prev,
			remarks: jobCard.remarks || "",
			appNumber: jobCard.appNumber || "",
			appDate: jobCard.appDate || "",
			jobDate: jobCard.jobDate || prev.jobDate,
		}));
		toast.success(`Pre-filled form with data from job card: ${jobCard.jobNumber}`);
	};

	const handleClearSelection = () => {
		setSelectedExistingJobCard(null);
		// Reset to default values
		setJobCardData((prev) => ({
			...prev,
			remarks: "",
			appNumber: "",
			appDate: "",
		}));
		toast.info("Cleared pre-filled data");
	};

	const handleCreateJobCard = async (e: React.FormEvent) => {
		e.preventDefault();

		// Auto-capture GPS location if not already captured
		if (!currentLocation) {
			await new Promise<void>((resolve) => {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							const location = {
								lat: position.coords.latitude,
								lng: position.coords.longitude,
							};
							setCurrentLocation(location);
							setJobCardData((prev) => ({
								...prev,
								gpsLocation: `${location.lat}, ${location.lng}`,
							}));
							resolve();
						},
						() => resolve() // Continue even if GPS fails
					);
				} else {
					resolve();
				}
			});
		}

		if (!jobCardData.jobStatus || !jobCardData.jobDate) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!installation) {
			toast.error("Please search for a valid serial number first");
			return;
		}

		// Double-check for duplicate job cards
		if (existingJobCardInMySQL) {
			toast.error(
				`Job card already exists for serial number ${searchSerial} (Job #${existingJobCardInMySQL.jobNumber})`
			);
			return;
		}

		try {
			const payload: JobCardCreateRequest = {
				serialNumber: searchSerial,
				jobDate: jobCardData.jobDate!,
				jobStatus: jobCardData.jobStatus!,
				jobType: jobCardData.jobType || "Commercial",
				jobRegion: jobCardData.jobRegion || "Greater Accra",
				remarks: jobCardData.remarks,
				appNumber: jobCardData.appNumber,
				appDate: jobCardData.appDate,
				gpsLocation: jobCardData.gpsLocation,
				serialImage: jobCardData.serialImage,
				indoorImage: jobCardData.indoorImage,
				outdoorImage: jobCardData.outdoorImage,
				signature: jobCardData.signature,
				wifiConnection: jobCardData.wifiConnection || false,
				consent: jobCardData.consent || false,
				consentMessageOne: jobCardData.consentMessageOne || "N/A",

				// Include installation data from Oracle
				username: installation.username || "Unknown",
				invoiceNo: installation.invoice_no,
				invoiceDate: installation.invoice_date,
				customerName: installation.customer_name,
				customerCode: installation.custcode || "N/A",
				contactPerson: installation.contact_person,
				contactNumber: installation.contact_number,
				email: installation.email,
				itemCode: installation.item_code,
				description: installation.description,
				deliveryNo: installation.delivery_no || "N/A",
				deliveryDate: installation.delivery_date || installation.invoice_date,
				qty: installation.qty?.toString() || "1",
				classification: installation.classification || "N/A",
				group: installation.group || "N/A",
				branch: installation.branch || "N/A",
				brand: installation.brand,
				created_at: new Date(),
				// Union Type
				createdBy: user
					? {
							id: typeof user.id === "number" ? user.id : Number(user.id) || 1,
							name: (user as any).name || user.email || "Admin",
							email: user.email || "admin@egl-com",
					  }
					: { id: 1, name: "Admin", email: "admin@egl-com" },
				assignedTo: user?.id || 1, // Assign to self by default
			};

			await createJobCard(payload).unwrap();
			toast.success("Job card created successfully!");

			// Comprehensive form reset
			setSerialNumber("");
			setSearchSerial("");
			setShowInstallationData(false); // Hide installation data
			setJobCardData({
				jobDate: new Date().toISOString().split("T")[0],
			});
			setCurrentLocation(null);
			setSelectedExistingJobCard(null);

			// Clear search states
			setStatusSearch("");
			setJobCardSearch("");

			// Reset pagination
			setStatusPage(1);
			setJobCardsPage(1);

			// Clear signature pad
			if (signaturePadRef.current) {
				signaturePadRef.current.clear();
			}

			// Reset image loading states
			setImageLoading({
				serial: false,
				indoor: false,
				outdoor: false,
			});

			// Re-capture GPS location for next job card
			getCurrentLocation();

			// Additional success feedback
			setTimeout(() => {
				toast.success("Form cleared and ready for next job card!");
			}, 1000);
		} catch (error: any) {
			console.error("Create job card error:", error);
			toast.error(error?.message || "Failed to create job card");
		}
	};

	return (
		<div>
			<PageMeta title='Create Job Card' description='ERP - Admin - Create Job Card' />
			<PageBreadcrumb pageTitle='Create Job Card' />

			<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
				{/* Serial Number Search */}
				<div className='mb-8'>
					<h3 className='mb-4 text-lg font-semibold text-gray-800 dark:text-white'>
						Search Serial Number
					</h3>
					<form onSubmit={handleSearch} className='flex gap-4'>
						<div className='flex items-center gap-2 flex-1'>
							<input
								type='text'
								value={serialNumber}
								onChange={(e) => setSerialNumber(e.target.value)}
								placeholder='Enter serial number (e.g., 1075E25W451301M04200)'
								className='flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
							/>
							<button
								type='button'
								onClick={() => setShowScanner(true)}
								title='Scan barcode using camera'
								className='inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-white text-sm'>
								Scan
							</button>
						</div>
						<button
							type='submit'
							disabled={loadingInstallation}
							className='rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50'>
							{loadingInstallation ? "Searching..." : "Search"}
						</button>
					</form>

					{showScanner && (
						<BarcodeScanner
							onDetected={(value: string) => {
								setSerialNumber(value);
								setShowScanner(false);
							}}
							onClose={() => setShowScanner(false)}
						/>
					)}
				</div>

				{/* Duplicate Job Card Warning */}
				{searchSerial && existingJobCardInMySQL && (
					<div className='mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'>
						<div className='flex items-center gap-2 mb-3'>
							<svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
								<path
									fillRule='evenodd'
									d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
									clipRule='evenodd'
								/>
							</svg>
							<span className='font-semibold text-red-800 dark:text-red-300'>
								Duplicate Job Card Found!
							</span>
						</div>
						<div className='space-y-2'>
							<p className='text-sm'>
								A job card already exists for serial number{" "}
								<span className='font-mono font-semibold'>{searchSerial}</span>
							</p>
							<div className='bg-red-100 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-700'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
									<div>
										<span className='font-medium'>Job Number:</span>
										<p className='font-mono'>{existingJobCardInMySQL.jobNumber}</p>
									</div>
									<div>
										<span className='font-medium'>Customer:</span>
										<p>{existingJobCardInMySQL.customerName}</p>
									</div>
									<div>
										<span className='font-medium'>Job Date:</span>
										<p>{new Date(existingJobCardInMySQL.jobDate).toLocaleDateString()}</p>
									</div>
									<div>
										<span className='font-medium'>Status:</span>
										<p>{existingJobCardInMySQL.jobStatus}</p>
									</div>
								</div>
							</div>
							<div className='flex items-center justify-between mt-3 pt-3 border-t border-red-200 dark:border-red-700'>
								<p className='text-sm font-medium text-red-800 dark:text-red-300'>
									❌ Cannot create duplicate job card. Please search for a different serial number.
								</p>
								<Link
									to={`/dashboard/job-cards/view/${existingJobCardInMySQL.id}`}
									className='inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'>
									<svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
										/>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
										/>
									</svg>
									View Job Card
								</Link>
							</div>
						</div>
					</div>
				)}

				{/* Loading States */}
				{searchSerial && !existingJobCardInMySQL && (
					<div className='mb-6 rounded-lg bg-blue-50 p-4 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'>
						<div className='flex items-center gap-2 mb-3'>
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
							<span className='font-medium'>Fetching Job Card Data</span>
						</div>

						<div className='space-y-2 text-sm'>
							<div className='flex items-center gap-2'>
								<span
									className={`text-xs px-2 py-1 rounded ${
										loadingInstallation
											? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
											: installation
											? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
											: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
									}`}>
									{loadingInstallation ? "LOADING" : installation ? "SUCCESS" : "FAILED"}
								</span>
								<span>Query 1: Installation data from Oracle workshop database</span>
							</div>

							<div className='flex items-center gap-2'>
								<span
									className={`text-xs px-2 py-1 rounded ${
										loadingStatus
											? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
											: statusOptions
											? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
											: installation
											? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
											: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
									}`}>
									{!installation
										? "WAITING"
										: loadingStatus
										? "LOADING"
										: statusOptions
										? "SUCCESS"
										: "FAILED"}
								</span>
								<span>Query 2: Job status options from Oracle database</span>
							</div>

							<div className='flex items-center gap-2'>
								<span
									className={`text-xs px-2 py-1 rounded ${
										!installation?.invoice_date
											? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
											: existingJobCards !== undefined
											? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
											: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
									}`}>
									{!installation?.invoice_date
										? "WAITING"
										: existingJobCards !== undefined
										? "SUCCESS"
										: "LOADING"}
								</span>
								<span>Query 3: Existing job cards for invoice date</span>
							</div>
						</div>

						{isDataReady && (
							<div className='mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded'>
								<span className='text-green-800 dark:text-green-300 text-sm font-medium'>
									✅ All data loaded successfully! Ready to create job card.
								</span>
							</div>
						)}
					</div>
				)}

				{/* Installation Data Display */}
				{installationError && (
					<div className='mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400'>
						Error loading installation data
					</div>
				)}

				{/* GPS Location Display */}
				<div className='mb-8'>
					<div className='mb-4 flex items-center justify-between'>
						<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
							GPS Location & Map
						</h3>
						<span
							className={`rounded-full px-3 py-1 text-sm font-medium ${
								locationLoading
									? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
									: currentLocation
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
									: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
							}`}>
							{locationLoading
								? "Getting Location..."
								: currentLocation
								? "Located"
								: "Location Required"}
						</span>
					</div>

					{locationLoading && (
						<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
							<div className='flex items-center gap-2'>
								<div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
								<span className='text-gray-700 dark:text-gray-300'>
									Getting your current location for job card...
								</span>
							</div>
						</div>
					)}

					{currentLocation && (
						<div className='space-y-4'>
							<div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
								<div className='flex items-center gap-2 mb-2'>
									<svg className='w-5 h-5 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
										<path
											fillRule='evenodd'
											d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
											clipRule='evenodd'
										/>
									</svg>
									<span className='font-medium text-green-800 dark:text-green-300'>
										Current Location Captured
									</span>
								</div>
								<p className='text-sm text-green-700 dark:text-green-400'>
									📍 Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
								</p>
								<p className='text-xs text-green-600 dark:text-green-500 mt-1'>
									This location will be automatically saved with your job card
								</p>
							</div>

							{/* Inline Map Display */}
							<div className='rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'>
								<h4 className='font-medium text-gray-800 dark:text-white mb-3'>
									Job Site Location
								</h4>
								<div className='rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600'>
									<GPSMapComponent
										lat={currentLocation.lat}
										lng={currentLocation.lng}
										zoom={15}
										height='300px'
									/>
								</div>
								<p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
									📍 Job site location - automatically captured and locked for this job card
								</p>
							</div>
						</div>
					)}

					{!currentLocation && !locationLoading && (
						<div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20'>
							<div className='flex items-center gap-2'>
								<svg className='w-5 h-5 text-yellow-600' fill='currentColor' viewBox='0 0 20 20'>
									<path
										fillRule='evenodd'
										d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
										clipRule='evenodd'
									/>
								</svg>
								<span className='font-medium text-yellow-800 dark:text-yellow-300'>
									Location Required
								</span>
							</div>
							<p className='text-sm text-yellow-700 dark:text-yellow-400 mt-1'>
								GPS location is required for job cards. It will be automatically captured when you
								create a job card.
							</p>
						</div>
					)}
				</div>

				{installation && !existingJobCardInMySQL && (
					<div className='mb-8'>
						<div className='mb-4 flex items-center justify-between'>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
								Installation Information
							</h3>
							<span className='rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300'>
								Found
							</span>
						</div>

						<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
								{/* Customer Information */}
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Customer:</span>
									<p className='text-gray-900 dark:text-white'>{installation.customer_name}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>
										Customer Code:
									</span>
									<p className='text-gray-900 dark:text-white'>{installation.custcode || "N/A"}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>
										Contact Person:
									</span>
									<p className='text-gray-900 dark:text-white'>{installation.contact_person}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Phone:</span>
									<p className='text-gray-900 dark:text-white'>{installation.contact_number}</p>
								</div>
								{installation.email && (
									<div>
										<span className='font-medium text-gray-700 dark:text-gray-300'>Email:</span>
										<p className='text-gray-900 dark:text-white'>{installation.email}</p>
									</div>
								)}

								{/* Invoice Information */}
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Invoice No:</span>
									<p className='text-gray-900 dark:text-white'>{installation.invoice_no}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>
										Invoice Date:
									</span>
									<p className='text-gray-900 dark:text-white'>
										{new Date(installation.invoice_date).toLocaleDateString()}
									</p>
								</div>

								{/* Delivery Information */}
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Delivery No:</span>
									<p className='text-gray-900 dark:text-white'>
										{installation.delivery_no || "N/A"}
									</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>
										Delivery Date:
									</span>
									<p className='text-gray-900 dark:text-white'>
										{installation.delivery_date
											? new Date(installation.delivery_date).toLocaleDateString()
											: "N/A"}
									</p>
								</div>

								{/* Product Information */}
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Item Code:</span>
									<p className='text-gray-900 dark:text-white font-mono'>
										{installation.item_code}
									</p>
								</div>
								<div className='md:col-span-2'>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Description:</span>
									<p className='text-gray-900 dark:text-white'>{installation.description}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Serial No:</span>
									<p className='text-gray-900 dark:text-white font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'>
										{installation.serial_no}
									</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Brand:</span>
									<p className='text-gray-900 dark:text-white'>{installation.brand}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Group:</span>
									<p className='text-gray-900 dark:text-white'>{installation.group || "N/A"}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>
										Classification:
									</span>
									<p className='text-gray-900 dark:text-white'>
										{installation.classification || "N/A"}
									</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Quantity:</span>
									<p className='text-gray-900 dark:text-white'>{installation.qty || "1"}</p>
								</div>

								{/* System Information */}
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Branch:</span>
									<p className='text-gray-900 dark:text-white'>{installation.branch || "N/A"}</p>
								</div>
								<div>
									<span className='font-medium text-gray-700 dark:text-gray-300'>Username:</span>
									<p className='text-gray-900 dark:text-white'>{installation.username}</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Oracle Data Display */}
				{installation && !existingJobCardInMySQL && (
					<div className='mb-8 space-y-6'>
						{/* Job Status Options */}
						<div>
							<div className='mb-4 flex items-center justify-between'>
								<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
									Available Job Status Options
								</h3>
								<span
									className={`rounded-full px-3 py-1 text-sm font-medium ${
										loadingStatus
											? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
											: statusOptions?.data?.length
											? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
											: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
									}`}>
									{loadingStatus ? "Loading..." : `${statusOptions?.data?.length || 0} options`}
								</span>
							</div>

							{loadingStatus ? (
								<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
									<div className='flex items-center gap-2'>
										<div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent'></div>
										<span className='text-gray-700 dark:text-gray-300'>
											Fetching job status options from Oracle...
										</span>
									</div>
								</div>
							) : statusOptions?.data?.length ? (
								<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
									<div className='mb-4'>
										<div className='flex items-center justify-between mb-2'>
											<div className='text-sm text-gray-600 dark:text-gray-400'>
												Click on a status to select it for your job card:
											</div>
											<div className='text-xs text-gray-500 dark:text-gray-400'>
												Total: {statusOptions.data.length} options
											</div>
										</div>

										{/* Search input for status options */}
										<div className='mb-4'>
											<input
												type='text'
												placeholder='Search job status...'
												value={statusSearch}
												onChange={(e) => {
													setStatusSearch(e.target.value);
													setStatusPage(1); // Reset to first page when searching
												}}
												className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
											/>
										</div>
									</div>

									{/* Pagination for status options */}
									{(() => {
										// Filter status options based on search
										const filteredStatuses = statusOptions.data.filter(
											(status: any) =>
												status.status.toLowerCase().includes(statusSearch.toLowerCase()) ||
												status.statusCode.toLowerCase().includes(statusSearch.toLowerCase())
										);

										const totalItems = filteredStatuses.length;
										const totalPages = Math.ceil(totalItems / statusItemsPerPage);
										const startIndex = (statusPage - 1) * statusItemsPerPage;
										const endIndex = startIndex + statusItemsPerPage;
										const currentItems = filteredStatuses.slice(startIndex, endIndex);

										if (filteredStatuses.length === 0 && statusSearch) {
											return (
												<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
													<p>No status options found matching "{statusSearch}"</p>
													<button
														onClick={() => setStatusSearch("")}
														className='mt-2 text-blue-600 hover:text-blue-800 text-sm'>
														Clear search
													</button>
												</div>
											);
										}

										return (
											<>
												<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
													{currentItems.map((status: any, index: number) => (
														<div
															key={startIndex + index}
															onClick={() => {
																setJobCardData((prev) => ({
																	...prev,
																	jobStatus: status.statusCode,
																}));
																toast.success(`Selected status: ${status.status}`);
															}}
															className={`cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800 rounded-md p-3 border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
																jobCardData.jobStatus === status.statusCode
																	? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
																	: "border-gray-200 dark:border-gray-600"
															}`}>
															<div className='font-medium text-gray-900 dark:text-white'>
																{status.status}
															</div>
															<div className='text-sm text-gray-600 dark:text-gray-400 font-mono'>
																Code: {status.statusCode}
															</div>
															{jobCardData.jobStatus === status.statusCode && (
																<div className='mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium'>
																	✓ Selected
																</div>
															)}
														</div>
													))}
												</div>

												{/* Pagination controls for status */}
												{totalPages > 1 && (
													<div className='mt-4 flex justify-between items-center'>
														<div className='text-sm text-gray-600 dark:text-gray-400'>
															Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
															{totalItems} {statusSearch ? "filtered " : ""}status options
														</div>
														<div className='flex gap-2'>
															<button
																onClick={() => setStatusPage((prev) => Math.max(prev - 1, 1))}
																disabled={statusPage === 1}
																className='px-3 py-1 text-sm border rounded dark:text-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700'>
																Previous
															</button>
															<span className='px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-300'>
																{statusPage} of {totalPages}
															</span>
															<button
																onClick={() =>
																	setStatusPage((prev) => Math.min(prev + 1, totalPages))
																}
																disabled={statusPage === totalPages}
																className='px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'>
																Next
															</button>
														</div>
													</div>
												)}
											</>
										);
									})()}
								</div>
							) : (
								<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
									<p className='text-gray-600 dark:text-gray-400'>
										No job status options available
									</p>
								</div>
							)}
						</div>

						{/* Existing Job Cards */}
						<div>
							<div className='mb-4 flex items-center justify-between'>
								<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
									Existing Job Cards for this Invoice Date
								</h3>
								<div className='flex items-center gap-2'>
									{selectedExistingJobCard && (
										<button
											onClick={handleClearSelection}
											className='rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'>
											Clear Selection
										</button>
									)}
									<span
										className={`rounded-full px-3 py-1 text-sm font-medium ${
											!installation?.invoice_date
												? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
												: existingJobCards?.data?.length
												? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
												: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
										}`}>
										{!installation?.invoice_date
											? "Waiting for invoice date"
											: `${existingJobCards?.data?.length || 0} found`}
									</span>
								</div>
							</div>

							{!installation?.invoice_date ? (
								<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
									<p className='text-gray-600 dark:text-gray-400'>
										Invoice date required to check for existing job cards
									</p>
								</div>
							) : existingJobCards?.data?.length ? (
								<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
									<div className='mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md'>
										<p className='text-yellow-800 dark:text-yellow-300 text-sm font-medium'>
											⚠️ Found {existingJobCards.data.length} existing job card(s) for this invoice
											date. Click on any job card below to copy its data to the form.
										</p>
									</div>

									{selectedExistingJobCard && (
										<div className='mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md'>
											<p className='text-blue-800 dark:text-blue-300 text-sm font-medium'>
												✓ Selected: {selectedExistingJobCard.jobNumber} - Data copied to form
											</p>
										</div>
									)}

									{/* Search input for existing job cards */}
									<div className='mb-4'>
										<input
											type='text'
											placeholder='Search existing job cards by job number, app number, remarks...'
											value={jobCardSearch}
											onChange={(e) => {
												setJobCardSearch(e.target.value);
												setJobCardsPage(1); // Reset to first page when searching
											}}
											className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
										/>
									</div>

									<div className='space-y-2'>
										{(() => {
											// Filter job cards based on search
											const filteredJobCards = existingJobCards.data.filter((job: any) => {
												const searchTerm = jobCardSearch.toLowerCase();
												return (
													job.jobNumber?.toLowerCase().includes(searchTerm) ||
													job.appNumber?.toLowerCase().includes(searchTerm) ||
													job.remarks?.toLowerCase().includes(searchTerm) ||
													job.jobDate?.toLowerCase().includes(searchTerm)
												);
											});

											if (filteredJobCards.length === 0 && jobCardSearch) {
												return (
													<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
														<p>No job cards found matching "{jobCardSearch}"</p>
														<button
															onClick={() => setJobCardSearch("")}
															className='mt-2 text-blue-600 hover:text-blue-800 text-sm'>
															Clear search
														</button>
													</div>
												);
											}

											const totalItems = filteredJobCards.length;
											const totalPages = Math.ceil(totalItems / jobCardsItemsPerPage);
											const startIndex = (jobCardsPage - 1) * jobCardsItemsPerPage;
											const endIndex = startIndex + jobCardsItemsPerPage;
											const currentItems = filteredJobCards.slice(startIndex, endIndex);

											return (
												<>
													{currentItems.map((job: any, index: number) => (
														<div
															key={startIndex + index}
															onClick={() => handleSelectExistingJobCard(job)}
															className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
																selectedExistingJobCard?.jobNumber === job.jobNumber
																	? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
																	: "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
															}`}>
															<div className='flex items-center justify-between'>
																<div className='flex-1'>
																	<div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
																		<div>
																			<span className='font-medium text-gray-700 dark:text-gray-300'>
																				Job Number:
																			</span>
																			<p className='text-gray-900 dark:text-white font-mono'>
																				{job.jobNumber}
																			</p>
																		</div>
																		<div>
																			<span className='font-medium text-gray-700 dark:text-gray-300'>
																				Job Date:
																			</span>
																			<p className='text-gray-900 dark:text-white'>{job.jobDate}</p>
																		</div>
																		<div>
																			<span className='font-medium text-gray-700 dark:text-gray-300'>
																				App Number:
																			</span>
																			<p className='text-gray-900 dark:text-white'>
																				{job.appNumber || "N/A"}
																			</p>
																		</div>
																	</div>
																	<div className='mt-2'>
																		<span className='font-medium text-gray-700 dark:text-gray-300'>
																			Remarks:
																		</span>
																		<p className='text-gray-900 dark:text-white'>
																			{job.remarks || "No remarks"}
																		</p>
																	</div>
																</div>
																<div
																	className={`ml-4 flex h-6 w-6 items-center justify-center rounded-full ${
																		selectedExistingJobCard?.jobNumber === job.jobNumber
																			? "bg-blue-500 text-white"
																			: "border-2 border-gray-300 dark:border-gray-600"
																	}`}>
																	{selectedExistingJobCard?.jobNumber === job.jobNumber && (
																		<svg
																			className='h-4 w-4'
																			fill='currentColor'
																			viewBox='0 0 20 20'>
																			<path
																				fillRule='evenodd'
																				d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
																				clipRule='evenodd'
																			/>
																		</svg>
																	)}
																</div>
															</div>
														</div>
													))}

													{/* Pagination controls for job cards */}
													{totalPages > 1 && (
														<div className='mt-4 flex justify-between items-center pt-4 border-t dark:border-gray-600'>
															<div className='text-sm text-gray-600 dark:text-gray-400'>
																Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
																{totalItems} {jobCardSearch ? "filtered " : ""}job cards
															</div>
															<div className='flex gap-2'>
																<button
																	onClick={() => setJobCardsPage((prev) => Math.max(prev - 1, 1))}
																	disabled={jobCardsPage === 1}
																	className='px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200'>
																	Previous
																</button>
																<span className='px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-300'>
																	{jobCardsPage} of {totalPages}
																</span>
																<button
																	onClick={() =>
																		setJobCardsPage((prev) => Math.min(prev + 1, totalPages))
																	}
																	disabled={jobCardsPage === totalPages}
																	className='px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200'>
																	Next
																</button>
															</div>
														</div>
													)}
												</>
											);
										})()}
									</div>
								</div>
							) : (
								<div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
									<div className='p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md'>
										<p className='text-green-800 dark:text-green-300 text-sm font-medium'>
											✅ No existing job cards found for this invoice date - safe to create new job
											card
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Data Summary */}
				{installation && isDataReady && !existingJobCardInMySQL && (
					<div className='mb-8 rounded-lg bg-green-50 p-4 dark:bg-green-900/20'>
						<h3 className='mb-2 text-lg font-semibold text-green-800 dark:text-green-400'>
							✅ All Data Loaded Successfully
						</h3>
						<div className='text-sm text-green-700 dark:text-green-300'>
							<div>📋 Installation found: {installation.customer_name}</div>
							<div>🔧 Status options: {statusOptions?.data?.length || 0} available</div>
							<div>📄 Existing job cards: {existingJobCards?.data?.length || 0} found</div>
						</div>
					</div>
				)}

				{/* Job Card Creation Form */}
				{installation && isDataReady && !existingJobCardInMySQL && (
					<div>
						<h3 className='mb-4 text-lg font-semibold text-gray-800 dark:text-white'>
							Create Job Card
						</h3>
						<form onSubmit={handleCreateJobCard} className='space-y-6'>
							<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Job Date *
									</label>
									<input
										type='date'
										required
										value={jobCardData.jobDate || ""}
										onChange={(e) =>
											setJobCardData((prev) => ({ ...prev, jobDate: e.target.value }))
										}
										disabled
										className='mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										Job Status *
									</label>
									<select
										disabled
										required
										value={jobCardData.jobStatus || ""}
										onChange={(e) =>
											setJobCardData((prev) => ({ ...prev, jobStatus: e.target.value }))
										}
										className='mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
										<option value=''>Select Status</option>
										{loadingStatus ? (
											<option>Loading...</option>
										) : (
											statusOptions?.data?.map((status: any, index: number) => (
												<option key={index} value={status.statusCode}>
													{status.status}
												</option>
											))
										)}
									</select>
								</div>
							</div>

							{/* Show selected job card info */}
							{selectedExistingJobCard && (
								<div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
									<div className='flex items-center justify-between'>
										<div>
											<h4 className='font-medium text-blue-900 dark:text-blue-300'>
												Data copied from: {selectedExistingJobCard.jobNumber}
											</h4>
											<p className='text-sm text-blue-700 dark:text-blue-400'>
												Form fields have been pre-filled with this job card's data
											</p>
										</div>
										<button
											type='button'
											onClick={handleClearSelection}
											className='rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-800 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700'>
											Clear
										</button>
									</div>
								</div>
							)}

							<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										App Number
									</label>
									<input
										disabled
										type='text'
										value={jobCardData.appNumber || ""}
										onChange={(e) =>
											setJobCardData((prev) => ({ ...prev, appNumber: e.target.value }))
										}
										placeholder='Enter application number'
										className='mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
										App Date
									</label>
									<input
										disabled
										type='date'
										value={jobCardData.appDate || ""}
										onChange={(e) =>
											setJobCardData((prev) => ({ ...prev, appDate: e.target.value }))
										}
										className='mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
									/>
								</div>
							</div>

							{/* Job Type */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									Job Type
								</label>
								<select
									required
									value={jobCardData.jobType || ""}
									onChange={(e) =>
										setJobCardData((prev) => ({
											...prev,
											jobType: e.target.value as JobCardCreateRequest["jobType"],
										}))
									}
									className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
									<option value=''>Select Type</option>
									<option value='Commercial'>Commercial</option>
									<option value='Residential'>Residential</option>
									<option value='Industrial'>Industrial</option>
									<option value='Government'>Government</option>
									<option value='Maintenance'>Maintenance</option>
									{/* Add more types as needed */}
								</select>
							</div>

							{/* Wifi Connection */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									WiFi Connection
								</label>
								<select
									required
									value={jobCardData.wifiConnection ? "true" : "false"}
									onChange={(e) =>
										setJobCardData((prev) => ({
											...prev,
											wifiConnection: e.target.value === "true",
										}))
									}
									className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
									<option value='false'>No</option>
									<option value='true'>Yes</option>
								</select>
							</div>

							{/* Job Region */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									Job Region
								</label>
								<select
									required
									value={jobCardData.jobRegion || ""}
									onChange={(e) =>
										setJobCardData((prev) => ({
											...prev,
											jobRegion: e.target.value as JobCardCreateRequest["jobRegion"],
										}))
									}
									className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'>
									<option value=''>Select a region</option>
									<option value='Ahafo'>Ahafo</option>
									<option value='Ashanti'>Ashanti</option>
									<option value='Bono'>Bono</option>
									<option value='Bono East'>Bono East</option>
									<option value='Central'>Central</option>
									<option value='Eastern'>Eastern</option>
									<option value='Greater Accra'>Greater Accra</option>
									<option value='Northern'>Northern</option>
									<option value='North East'>North East</option>
									<option value='Oti'>Oti</option>
									<option value='Savannah'>Savannah</option>
									<option value='Upper East'>Upper East</option>
									<option value='Upper West'>Upper West</option>
									<option value='Volta'>Volta</option>
									<option value='Western'>Western</option>
									<option value='Western North'>Western North</option>
								</select>
							</div>

							{/* Installation Images Section */}
							<div className='space-y-4'>
								<h4 className='text-lg font-medium text-gray-800 dark:text-white'>
									Installation Images
								</h4>
								<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
									<div>
										<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
											Serial Number Image
										</label>
										<input
											type='file'
											accept='image/*'
											capture='environment'
											disabled={imageLoading.serial}
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													handleImageUpload(file, "serial");
												}
											}}
											className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 disabled:opacity-50'
										/>
										{imageLoading.serial && (
											<div className='flex items-center gap-2 mt-2 text-xs text-blue-600'>
												<div className='w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
												<span>Compressing image...</span>
											</div>
										)}
										{jobCardData.serialImage && !imageLoading.serial && (
											<div className='text-xs text-green-600 mt-1'>
												✓ Serial image ready ({getBase64SizeInKB(jobCardData.serialImage)}KB)
											</div>
										)}
										<p className='text-xs text-gray-500 mt-1'>
											📷 Camera will open automatically on mobile devices. If camera shows black
											screen, try:
											<br />• Allow camera permissions
											<br />• Try switching between front/back camera
											<br />• Restart the browser
										</p>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
											Indoor Scene Image
										</label>
										<input
											type='file'
											accept='image/*'
											capture='environment'
											disabled={imageLoading.indoor}
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													handleImageUpload(file, "indoor");
												}
											}}
											className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 disabled:opacity-50'
										/>
										{imageLoading.indoor && (
											<div className='flex items-center gap-2 mt-2 text-xs text-blue-600'>
												<div className='w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
												<span>Compressing image...</span>
											</div>
										)}
										{jobCardData.indoorImage && !imageLoading.indoor && (
											<div className='text-xs text-green-600 mt-1'>
												✓ Indoor image ready ({getBase64SizeInKB(jobCardData.indoorImage)}KB)
											</div>
										)}
										<p className='text-xs text-gray-500 mt-1'>
											📷 Take photo of indoor installation. For best results, ensure good lighting
											and stable device.
										</p>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
											Outdoor Scene Image
										</label>
										<input
											type='file'
											accept='image/*'
											capture='environment'
											disabled={imageLoading.outdoor}
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													handleImageUpload(file, "outdoor");
												}
											}}
											className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 disabled:opacity-50'
										/>
										{imageLoading.outdoor && (
											<div className='flex items-center gap-2 mt-2 text-xs text-blue-600'>
												<div className='w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
												<span>Compressing image...</span>
											</div>
										)}
										{jobCardData.outdoorImage && !imageLoading.outdoor && (
											<div className='text-xs text-green-600 mt-1'>
												✓ Outdoor image ready ({getBase64SizeInKB(jobCardData.outdoorImage)}KB)
											</div>
										)}
										<p className='text-xs text-gray-500 mt-1'>
											📷 Take photo of outdoor installation
										</p>
									</div>
								</div>
							</div>

							{/* Consent Checkbox and Message for R290 installations */}
							{jobCardData.jobStatus === "H024" && (
								<div className='space-y-4'>
									<div>
										<label className='inline-flex items-center'>
											<input
												type='checkbox'
												checked={!!jobCardData.consent}
												onChange={(e) =>
													setJobCardData((prev) => ({
														...prev,
														consent: e.target.checked,
														consentMessageOne: e.target.checked
															? prev.consentMessageOne || DEFAULT_CONSENT_MESSAGE
															: "", // clear on uncheck
													}))
												}
												className='form-checkbox h-5 w-5 text-blue-600'
											/>
											<span className='ml-2 text-sm text-gray-700 dark:text-gray-300'>
												I confirm consent for R290 installation
											</span>
										</label>
									</div>
									{jobCardData.consent && (
										<div>
											<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
												Consent Message One
											</label>
											<textarea
												readOnly
												value={jobCardData.consentMessageOne || DEFAULT_CONSENT_MESSAGE}
												className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-100 text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
												rows={6}
											/>
										</div>
									)}
								</div>
							)}

							{/* Additional Notes merged with Remarks */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									Remarks & Additional Notes
								</label>
								<textarea
									value={jobCardData.remarks || ""}
									onChange={(e) => setJobCardData((prev) => ({ ...prev, remarks: e.target.value }))}
									rows={4}
									className='mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
									placeholder='Enter any remarks, notes, or observations for this job card...'
								/>
							</div>

							{/* Customer Signature Section */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Customer Signature
								</label>
								<div className='border border-gray-300 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'>
									<div className='mb-4'>
										<div className='border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-600 overflow-hidden'>
											<SignatureCanvas
												ref={signaturePadRef}
												penColor='#000000'
												canvasProps={{
													width: 1000,
													height: 200,
													className: "signature-canvas",
													style: {
														height: "200px",
														maxWidth: "100%",
														display: "block",
														touchAction: "none",
														userSelect: "none",
														WebkitUserSelect: "none",
														MozUserSelect: "none",
														msUserSelect: "none",
														border: "1px solid #e5e7eb",
														borderRadius: "4px",
													},
												}}
												backgroundColor='#ffffff'
												dotSize={3}
												minWidth={2}
												maxWidth={4}
												throttle={8}
												velocityFilterWeight={0.7}
												onBegin={() => {
													console.log("Drawing started");
												}}
												onEnd={() => {
													console.log("Drawing ended");
												}}
											/>
										</div>
									</div>
									<div className='flex gap-2'>
										<button
											type='button'
											onClick={() => {
												if (signaturePadRef.current) {
													try {
														// Clear the signature
														signaturePadRef.current.clear();

														// Reset the form data
														setJobCardData((prev) => ({ ...prev, signature: "" }));

														// Force the signature pad to restart event listeners
														signaturePadRef.current.off();
														setTimeout(() => {
															if (signaturePadRef.current) {
																signaturePadRef.current.on();
															}
														}, 50);

														toast.info("Signature cleared - ready for new signature");
													} catch (error) {
														console.error("Error clearing signature:", error);
														toast.error("Error clearing signature");
													}
												} else {
													toast.error("Signature pad not ready");
												}
											}}
											className='px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600'>
											Clear
										</button>
										<button
											type='button'
											onClick={() => {
												if (signaturePadRef.current) {
													// Check if there's actually any drawing
													if (!signaturePadRef.current.isEmpty()) {
														try {
															// Use PNG format for better quality and transparency support
															const signatureData = signaturePadRef.current.toDataURL(
																"image/png",
																1.0
															);

															// Validate the signature data
															if (signatureData && signatureData.length > 100) {
																setJobCardData((prev) => ({ ...prev, signature: signatureData }));
																const sizeInKB = getBase64SizeInKB(signatureData);
																toast.success(`Signature captured! (${sizeInKB}KB)`);
																console.log(
																	"Signature saved successfully:",
																	signatureData.substring(0, 50) + "..."
																);
															} else {
																console.error("Invalid signature data generated");
																toast.error("Invalid signature. Please try drawing again.");
															}
														} catch (error) {
															console.error("Error saving signature:", error);
															toast.error("Error saving signature. Please try again.");
														}
													} else {
														toast.error("Please provide a signature first");
													}
												} else {
													toast.error("Signature pad not ready");
												}
											}}
											className='px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'>
											Save Signature
										</button>
									</div>
									<p className='text-xs text-gray-500 mt-2'>
										✏️ Draw customer signature above, then click "Save Signature"
										<br />• For best results on mobile: use finger or stylus
										<br />• Ensure touch is working properly before signing
									</p>
									{jobCardData.signature && (
										<div className='mt-2 text-xs text-green-600 dark:text-green-400'>
											✓ Signature captured successfully ({getBase64SizeInKB(jobCardData.signature)}
											KB)
										</div>
									)}
								</div>
							</div>

							{/* Form Actions */}
							<div className='flex gap-4 pt-6 border-t dark:border-gray-600'>
								<button
									type='submit'
									disabled={creatingJobCard || !isDataReady}
									className='flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
									{creatingJobCard ? "Creating Job Card..." : "Create Job Card"}
								</button>
								<button
									type='button'
									onClick={() => {
										setSerialNumber("");
										setSearchSerial("");
										setJobCardData({
											jobDate: new Date().toISOString().split("T")[0],
										});
										setSelectedExistingJobCard(null);
										setCurrentLocation(null);
										// Re-capture GPS location
										getCurrentLocation();
									}}
									className='px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'>
									Clear Form
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
