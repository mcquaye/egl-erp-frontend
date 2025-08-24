import { useState } from "react";
import {
	useGetAllJobCardsQuery,
	useGetMyJobCardsQuery,
	useDeleteJobCardMutation,
} from "../../redux/api/jobCardApi";
import { JobCard, User } from "../../types";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon, DownloadIcon } from "../../icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { Link } from "react-router";
import { toast } from "sonner";
import { Modal } from "../../components/ui/modal";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { useConfirm } from "../../hooks/useConfirm";
import { createPDF } from "../../utils/createPDF";
import { useAuth } from "../../context/AuthContext";

export default function AllJobCardsPage() {
	const { user } = useAuth();
	const isAdmin = user?.role === "admin";
	const role = user?.role;
	const canDownload = role === "admin" || role === "manager";
	const canEdit = role === "admin";
	const canDelete = role === "admin" || role === "manager" || role === "user";

	// Only run the query that applies to the current user role
	const {
		data: allJobCardsData,
		isLoading: allLoading,
		error: allError,
	} = useGetAllJobCardsQuery(undefined, { skip: !isAdmin });

	const {
		data: myJobCardsData,
		isLoading: myJobCardsLoading,
		error: myJobCardsError,
	} = useGetMyJobCardsQuery(user?.id?.toString() ?? "", { skip: isAdmin || !user?.id });
	const [deleteJobCard] = useDeleteJobCardMutation();

	// Verify Data To Show
	const jobCardsToShow = isAdmin ? allJobCardsData : myJobCardsData;

	// Compute loading/error from the active query (avoid colliding with confirm hook's `loading`)
	const isQueryLoading = isAdmin ? allLoading : myJobCardsLoading;
	const queryError = isAdmin ? allError : myJobCardsError;

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

	const handleDownloadPDF = (jobCard: JobCard) => {
		createPDF(jobCard);
	};

	const getStatusColor = (status: string): "success" | "warning" | "error" => {
		// You can customize these status colors based on your job statuses
		if (status.includes("COMPLETED") || status.includes("DONE")) return "success";
		if (status.includes("PENDING") || status.includes("IN_PROGRESS")) return "warning";
		if (status.includes("CANCELLED") || status.includes("FAILED")) return "error";
		return "warning"; // default to warning instead of "default"
	};

	if (isQueryLoading) {
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

	if (queryError) {
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
							Total: {allJobCardsData?.pagination.total || 0} job cards
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
							{allJobCardsData?.jobCards.map((jobCard: JobCard) => (
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
										{jobCard.createdBy?.email}
									</TableCell>
									<TableCell className='px-6 py-4 whitespace-nowrap'>
										<div className='flex items-center space-x-2'>
											{/* View in modal - available to all roles */}
											<button
												onClick={() => handleViewModal(jobCard)}
												className='text-blue-600 hover:text-blue-800 dark:text-blue-400'
												title='View in Modal'>
												<HiOutlineDocumentSearch className='h-4 w-4' />
											</button>

											{/* View full page - available to all roles */}
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

											{/* Download - managers & admins */}
											{canDownload && (
												<button
													onClick={() => handleDownloadPDF(jobCard)}
													className='text-purple-600 hover:text-purple-800 dark:text-purple-400'
													title='Download PDF'>
													<DownloadIcon className='h-4 w-4' />
												</button>
											)}

											{/* Edit - admin only */}
											{canEdit && (
												<Link
													to={`/dashboard/job-cards/edit/${jobCard.id}`}
													className='text-yellow-600 hover:text-yellow-800 dark:text-yellow-400'
													title='Edit Job Card'>
													<PencilIcon className='h-4 w-4' />
												</Link>
											)}

											{/* Delete - managers, users, admins */}
											{canDelete && (
												<button
													onClick={() => handleDelete(jobCard)}
													className='text-red-600 hover:text-red-800 dark:text-red-400'
													title='Delete Job Card'>
													<TrashBinIcon className='h-4 w-4' />
												</button>
											)}
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
							<div className='flex items-center gap-2'>
								<button
									onClick={() => handleDownloadPDF(selectedJobCard)}
									className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
									<DownloadIcon className='h-4 w-4' />
									Download PDF
								</button>
								<button
									onClick={handleCloseModal}
									className='p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.03]'
									title='Close modal'>
									<svg
										className='h-5 w-5 text-gray-700 dark:text-gray-200'
										viewBox='0 0 20 20'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'>
										<path
											d='M6 6L14 14M14 6L6 14'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
										/>
									</svg>
								</button>
							</div>
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
									<p className='text-gray-900 dark:text-white'>
										{selectedJobCard?.createdBy?.email}
									</p>
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
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.createdAt}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-500 dark:text-gray-400'>
										Updated At
									</label>
									<p className='text-gray-900 dark:text-white'>{selectedJobCard.updatedAt}</p>
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
