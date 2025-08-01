import { useState } from "react";
import { useGetAllJobCardsQuery, useDeleteJobCardMutation } from "../../redux/api/jobCardApi";
import { JobCard } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { EyeIcon, PencilIcon, TrashBinIcon, DownloadIcon } from "../../icons";
import { Link } from "react-router";
import { toast } from "sonner";
import { Modal } from "../../components/ui/modal";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { useConfirm } from "../../hooks/useConfirm";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function AllJobCardsPage() {
	const { data: jobCardsData, isLoading, error } = useGetAllJobCardsQuery();
	const [deleteJobCard] = useDeleteJobCardMutation();

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);

	// Confirm dialog hook
	const { confirm, isOpen, confirmOptions, handleConfirm, handleCancel, loading, setLoading } =
		useConfirm();

	const handleDelete = async (jobCard: JobCard) => {
		const confirmed = await confirm({
			title: "Delete Job Card",
			message: `Are you sure you want to delete job card #${jobCard.jobNumber}? This action cannot be undone.`,
			confirmText: "Delete",
			cancelText: "Cancel",
			type: "danger",
		});

		if (confirmed) {
			try {
				setLoading(true);
				await deleteJobCard(jobCard.id.toString()).unwrap();
				toast.success("Job card deleted successfully");
			} catch (error: any) {
				console.error("Delete job card error:", error);
				toast.error(error?.message || "Failed to delete job card");
			} finally {
				setLoading(false);
			}
		}
	};

	const handleViewModal = (jobCard: JobCard) => {
		setSelectedJobCard(jobCard);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedJobCard(null);
	};

	const handleDownloadPDF = async (jobCard: JobCard) => {
		try {
			// Show generating toast instead of alert
			toast.info("Generating PDF...");

			// Create a temporary div with job card content for PDF
			const tempDiv = document.createElement("div");
			tempDiv.style.padding = "20px";
			tempDiv.style.backgroundColor = "white";
			tempDiv.style.fontFamily = "Arial, sans-serif";
			tempDiv.innerHTML = `
				<div style="text-align: center; margin-bottom: 30px;">
					<h1 style="color: #1f2937; margin-bottom: 10px;">Job Card Report</h1>
					<p style="color: #6b7280; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
				</div>
				
				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">Job Information</h2>
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
						<div><strong>Job Number:</strong> ${jobCard.jobNumber}</div>
						<div><strong>Serial Number:</strong> ${jobCard.serialNumber}</div>
						<div><strong>Status:</strong> ${jobCard.jobStatus}</div>
						<div><strong>Job Date:</strong> ${new Date(jobCard.jobDate).toLocaleDateString()}</div>
					</div>
				</div>

				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">Customer Information</h2>
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
						<div><strong>Customer Name:</strong> ${jobCard.customerName}</div>
						<div><strong>Customer Code:</strong> ${jobCard.customerCode}</div>
						<div><strong>Contact Person:</strong> ${jobCard.contactPerson || "N/A"}</div>
						<div><strong>Contact Number:</strong> ${jobCard.contactNumber || "N/A"}</div>
						<div><strong>Email:</strong> ${jobCard.email || "N/A"}</div>
					</div>
				</div>

				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">Product Information</h2>
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
						<div><strong>Item Code:</strong> ${jobCard.itemCode}</div>
						<div><strong>Brand:</strong> ${jobCard.brand}</div>
						<div><strong>Description:</strong> ${jobCard.description}</div>
						<div><strong>Quantity:</strong> ${jobCard.qty}</div>
						<div><strong>Classification:</strong> ${jobCard.classification}</div>
						<div><strong>Group:</strong> ${jobCard.group}</div>
					</div>
				</div>

				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">Delivery Information</h2>
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
						<div><strong>Invoice No:</strong> ${jobCard.invoiceNo}</div>
						<div><strong>Invoice Date:</strong> ${new Date(jobCard.invoiceDate).toLocaleDateString()}</div>
						<div><strong>Delivery No:</strong> ${jobCard.deliveryNo}</div>
						<div><strong>Delivery Date:</strong> ${new Date(jobCard.deliveryDate).toLocaleDateString()}</div>
					</div>
				</div>

				${
					jobCard.remarks
						? `
				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">Remarks</h2>
					<p style="margin: 0; line-height: 1.5;">${jobCard.remarks}</p>
				</div>
				`
						: ""
				}

				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">System Information</h2>
					<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
						<div><strong>Created By:</strong> ${jobCard.username}</div>
						<div><strong>Branch:</strong> ${jobCard.branch}</div>
						<div><strong>Created At:</strong> ${new Date(jobCard.createdAt).toLocaleDateString()}</div>
					</div>
				</div>

				${
					jobCard.gpsLocation
						? `
				<div style="border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
					<h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">GPS Location</h2>
					<p style="margin: 0;">📍 ${jobCard.gpsLocation}</p>
				</div>
				`
						: ""
				}
			`;

			// Temporarily add to document body
			tempDiv.style.position = "absolute";
			tempDiv.style.left = "-9999px";
			tempDiv.style.width = "800px";
			document.body.appendChild(tempDiv);

			// Generate canvas and PDF
			const canvas = await html2canvas(tempDiv, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				backgroundColor: "#ffffff",
			});

			// Remove temporary div
			document.body.removeChild(tempDiv);

			// Create PDF
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF("p", "mm", "a4");
			const imgWidth = 210; // A4 width in mm
			const pageHeight = 295; // A4 height in mm
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			let heightLeft = imgHeight;

			let position = 0;

			// Add first page
			pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
			heightLeft -= pageHeight;

			// Add additional pages if needed
			while (heightLeft >= 0) {
				position = heightLeft - imgHeight;
				pdf.addPage();
				pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
				heightLeft -= pageHeight;
			}

			// Save PDF
			pdf.save(`job-card-${jobCard.jobNumber}.pdf`);
			toast.success("PDF downloaded successfully!");
		} catch (error) {
			console.error("PDF generation error:", error);
			toast.error("Failed to generate PDF");
		}
	};

	const getStatusColor = (status: string): "success" | "warning" | "error" => {
		// You can customize these status colors based on your job statuses
		if (status.includes("COMPLETED") || status.includes("DONE")) return "success";
		if (status.includes("PENDING") || status.includes("IN_PROGRESS")) return "warning";
		if (status.includes("CANCELLED") || status.includes("FAILED")) return "error";
		return "warning"; // default to warning instead of "default"
	};

	if (isLoading) {
		return (
			<div>
				<PageMeta title='All Job Cards' description='ERP - Admin - All Job Cards' />
				<PageBreadcrumb pageTitle='All Job Cards' />
				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='flex items-center justify-center py-12'>
						<div className='text-gray-500'>Loading job cards...</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div>
				<PageMeta title='All Job Cards' description='ERP - Admin - All Job Cards' />
				<PageBreadcrumb pageTitle='All Job Cards' />
				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='flex items-center justify-center py-12'>
						<div className='text-red-500'>Error loading job cards</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageMeta title='All Job Cards' description='ERP - Admin - All Job Cards' />
			<PageBreadcrumb pageTitle='All Job Cards' />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
				{/* Header */}
				<div className='flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
					<div>
						<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>All Job Cards</h3>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Total: {jobCardsData?.length || 0} job cards
						</p>
					</div>
					<Link
						to='/dashboard/job-cards/create'
						className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
						Create New Job Card
					</Link>
				</div>

				{/* Table */}
				<div className='overflow-x-auto'>
					<Table>
						<TableHeader className='border-b border-gray-100 dark:border-white/[0.05]'>
							<TableRow>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Job Number
								</TableCell>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Customer
								</TableCell>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Serial Number
								</TableCell>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Status
								</TableCell>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Job Date
								</TableCell>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Created By
								</TableCell>
								<TableCell
									isHeader
									className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
									Actions
								</TableCell>
							</TableRow>
						</TableHeader>
						<TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
							{jobCardsData?.map((jobCard: JobCard) => (
								<TableRow key={jobCard.id}>
									<TableCell className='px-6 py-4 whitespace-nowrap'>
										<div className='font-medium text-gray-900 dark:text-white'>
											{jobCard.jobNumber}
										</div>
									</TableCell>
									<TableCell className='px-6 py-4'>
										<div className='text-gray-900 dark:text-white'>{jobCard.customerName}</div>
										<div className='text-sm text-gray-500 dark:text-gray-400'>
											{jobCard.contactNumber}
										</div>
									</TableCell>
									<TableCell className='px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white'>
										{jobCard.serialNumber}
									</TableCell>
									<TableCell className='px-6 py-4 whitespace-nowrap'>
										<Badge color={getStatusColor(jobCard.jobStatus)} size='sm'>
											{jobCard.jobStatus}
										</Badge>
									</TableCell>
									<TableCell className='px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white'>
										{new Date(jobCard.jobDate).toLocaleDateString()}
									</TableCell>
									<TableCell className='px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white'>
										{jobCard.username}
									</TableCell>
									<TableCell className='px-6 py-4 whitespace-nowrap'>
										<div className='flex items-center space-x-2'>
											<button
												onClick={() => handleViewModal(jobCard)}
												className='text-blue-600 hover:text-blue-800 dark:text-blue-400'
												title='View in Modal'>
												<EyeIcon className='h-4 w-4' />
											</button>
											<Link
												to={`/dashboard/job-cards/view/${jobCard.id}`}
												className='text-green-600 hover:text-green-800 dark:text-green-400'
												title='View Full Page'>
												<svg
													className='h-4 w-4'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
													/>
												</svg>
											</Link>
											<button
												onClick={() => handleDownloadPDF(jobCard)}
												className='text-purple-600 hover:text-purple-800 dark:text-purple-400'
												title='Download PDF'>
												<DownloadIcon className='h-4 w-4' />
											</button>
											<Link
												to={`/dashboard/job-cards/edit/${jobCard.id}`}
												className='text-yellow-600 hover:text-yellow-800 dark:text-yellow-400'
												title='Edit Job Card'>
												<PencilIcon className='h-4 w-4' />
											</Link>
											<button
												onClick={() => handleDelete(jobCard)}
												className='text-red-600 hover:text-red-800 dark:text-red-400'
												title='Delete Job Card'>
												<TrashBinIcon className='h-4 w-4' />
											</button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Job Card Modal */}
			<Modal isOpen={isModalOpen} onClose={handleCloseModal} className='max-w-4xl p-6'>
				{selectedJobCard && (
					<div className='max-h-[70vh] overflow-y-auto custom-scrollbar'>
						<div className='flex items-center justify-between mb-6'>
							<h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Job Card Details</h2>
							<button
								onClick={() => handleDownloadPDF(selectedJobCard)}
								className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
								<DownloadIcon className='h-4 w-4' />
								Download PDF
							</button>
						</div>

						{/* Job Information */}
						<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
								Job Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Job Number
									</label>
									<p className='text-gray-900 dark:text-white font-mono'>
										{selectedJobCard.jobNumber}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Serial Number
									</label>
									<p className='text-gray-900 dark:text-white font-mono'>
										{selectedJobCard.serialNumber}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Status
									</label>
									<div className='mt-1'>
										<Badge color={getStatusColor(selectedJobCard.jobStatus)}>
											{selectedJobCard.jobStatus}
										</Badge>
									</div>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Job Date
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(selectedJobCard.jobDate).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>

						{/* Customer Information */}
						<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
								Customer Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Customer Name
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.customerName}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Customer Code
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.customerCode}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Contact Person
									</label>
									<p className='text-gray-900 dark:text-white'>
										{selectedJobCard.contactPerson || "N/A"}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Contact Number
									</label>
									<p className='text-gray-900 dark:text-white'>
										{selectedJobCard.contactNumber || "N/A"}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Email
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.email || "N/A"}</p>
								</div>
							</div>
						</div>

						{/* Product Information */}
						<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
								Product Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Item Code
									</label>
									<p className='text-gray-900 dark:text-white font-mono'>
										{selectedJobCard.itemCode}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Brand
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.brand}</p>
								</div>
								<div className='md:col-span-2'>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Description
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.description}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Quantity
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.qty}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Classification
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.classification}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Group
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.group}</p>
								</div>
							</div>
						</div>

						{/* Delivery Information */}
						<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
								Delivery Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Invoice No
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.invoiceNo}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Invoice Date
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(selectedJobCard.invoiceDate).toLocaleDateString()}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Delivery No
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.deliveryNo}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Delivery Date
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(selectedJobCard.deliveryDate).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>

						{/* Images Section */}
						{(selectedJobCard.serialImage ||
							selectedJobCard.indoorImage ||
							selectedJobCard.outdoorImage ||
							selectedJobCard.signature) && (
							<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
								<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
									Images & Signature
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
									{selectedJobCard.serialImage && (
										<div>
											<label className='text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2'>
												Serial Image
											</label>
											<img
												src={selectedJobCard.serialImage}
												alt='Serial Number'
												className='w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600'
											/>
										</div>
									)}
									{selectedJobCard.indoorImage && (
										<div>
											<label className='text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2'>
												Indoor Scene
											</label>
											<img
												src={selectedJobCard.indoorImage}
												alt='Indoor Scene'
												className='w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600'
											/>
										</div>
									)}
									{selectedJobCard.outdoorImage && (
										<div>
											<label className='text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2'>
												Outdoor Scene
											</label>
											<img
												src={selectedJobCard.outdoorImage}
												alt='Outdoor Scene'
												className='w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600'
											/>
										</div>
									)}
									{selectedJobCard.signature && (
										<div>
											<label className='text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2'>
												Customer Signature
											</label>
											<img
												src={selectedJobCard.signature}
												alt='Signature'
												className='w-full h-32 object-contain rounded border border-gray-200 dark:border-gray-600 bg-white'
											/>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Remarks */}
						{selectedJobCard.remarks && (
							<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
								<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
									Remarks
								</h3>
								<p className='text-gray-900 dark:text-white leading-relaxed'>
									{selectedJobCard.remarks}
								</p>
							</div>
						)}

						{/* GPS Location */}
						{selectedJobCard.gpsLocation && (
							<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6'>
								<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
									GPS Location
								</h3>
								<p className='text-gray-900 dark:text-white font-mono'>
									📍 {selectedJobCard.gpsLocation}
								</p>
							</div>
						)}

						{/* System Information */}
						<div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
								System Information
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Created By
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.username}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Branch
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.branch}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Created At
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(selectedJobCard.createdAt).toLocaleString()}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Updated At
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(selectedJobCard.updatedAt).toLocaleString()}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</Modal>

			{/* Confirm Dialog */}
			{confirmOptions && (
				<ConfirmDialog
					isOpen={isOpen}
					onClose={handleCancel}
					onConfirm={handleConfirm}
					title={confirmOptions.title}
					message={confirmOptions.message}
					confirmText={confirmOptions.confirmText}
					cancelText={confirmOptions.cancelText}
					type={confirmOptions.type}
					loading={loading}
				/>
			)}
		</div>
	);
}
