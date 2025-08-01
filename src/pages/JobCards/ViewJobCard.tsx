import { useState } from "react";
import { useGetJobCardByIdQuery } from "../../redux/api/jobCardApi";
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

// Component for users to search and view job cards by ID/Serial
export default function ViewJobCardPage() {
	const { id } = useParams<{ id: string }>();
	const { hasRole } = useAuth();
	const [searchSerial, setSearchSerial] = useState("");
	const [searchMode, setSearchMode] = useState<"id" | "serial">("serial");

	const { data: jobCard, isLoading, error } = useGetJobCardByIdQuery(id || "", { skip: !id });

	const getStatusColor = (status: string): "success" | "warning" | "error" => {
		if (status.includes("COMPLETED") || status.includes("DONE")) return "success";
		if (status.includes("PENDING") || status.includes("IN_PROGRESS")) return "warning";
		if (status.includes("CANCELLED") || status.includes("FAILED")) return "error";
		return "warning";
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchSerial.trim()) {
			// For now, we'll just show an alert. In a real implementation,
			// you'd want to search for job cards by serial number
			alert(`Searching for job cards with serial: ${searchSerial}`);
		}
	};

	// If no ID in URL, show search interface
	if (!id) {
		return (
			<div>
				<PageMeta title='View Job Card' description='ERP - View Job Card' />
				<PageBreadcrumb pageTitle='View Job Card' />

				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='max-w-md mx-auto'>
						<h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-6'>
							Search Job Card
						</h3>

						<div className='mb-4'>
							<div className='flex gap-4 mb-4'>
								<label className='flex items-center'>
									<input
										type='radio'
										name='searchMode'
										value='serial'
										checked={searchMode === "serial"}
										onChange={(e) => setSearchMode(e.target.value as "serial")}
										className='mr-2'
									/>
									Search by Serial Number
								</label>
								<label className='flex items-center'>
									<input
										type='radio'
										name='searchMode'
										value='id'
										checked={searchMode === "id"}
										onChange={(e) => setSearchMode(e.target.value as "id")}
										className='mr-2'
									/>
									Search by Job Card ID
								</label>
							</div>
						</div>

						<form onSubmit={handleSearch} className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									{searchMode === "serial" ? "Serial Number" : "Job Card Number"}
								</label>
								<input
									type='text'
									value={searchSerial}
									onChange={(e) => setSearchSerial(e.target.value)}
									placeholder={
										searchMode === "serial" ? "Enter serial number..." : "Enter job card number..."
									}
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								/>
							</div>
							<button
								type='submit'
								className='w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700'>
								Search Job Card
							</button>
						</form>
					</div>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div>
				<PageMeta title='View Job Card' description='ERP - View Job Card' />
				<PageBreadcrumb pageTitle='View Job Card' />
				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='flex items-center justify-center py-12'>
						<div className='text-gray-500'>Loading job card...</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !jobCard) {
		return (
			<div>
				<PageMeta title='View Job Card' description='ERP - View Job Card' />
				<PageBreadcrumb pageTitle='View Job Card' />
				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='flex items-center justify-center py-12'>
						<div className='text-red-500'>Job card not found</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageMeta title={`Job Card ${jobCard.jobNumber}`} description='ERP - View Job Card' />
			<PageBreadcrumb pageTitle={`Job Card ${jobCard.jobNumber}`} />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
				{/* Header */}
				<div className='flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
					<div>
						<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
							Job Card Details
						</h3>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Job Number: {jobCard.jobNumber}
						</p>
					</div>
					<div className='flex items-center gap-2'>
						<Badge color={getStatusColor(jobCard.jobStatus)}>{jobCard.jobStatus}</Badge>
						{hasRole(["admin"]) && (
							<Link
								to={`/dashboard/job-cards/edit/${jobCard.id}`}
								className='rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700'>
								Edit
							</Link>
						)}
					</div>
				</div>

				{/* Job Card Information */}
				<div className='p-6'>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
						{/* Basic Information */}
						<div className='space-y-4'>
							<h4 className='font-semibold text-gray-800 dark:text-white'>Basic Information</h4>
							<div className='space-y-2'>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Job Date
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(jobCard.jobDate).toLocaleDateString()}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Serial Number
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.serialNumber}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Created By
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.username}</p>
								</div>
							</div>
						</div>

						{/* Customer Information */}
						<div className='space-y-4'>
							<h4 className='font-semibold text-gray-800 dark:text-white'>Customer Information</h4>
							<div className='space-y-2'>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Customer Name
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.customerName}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Contact Person
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.contactPerson || "N/A"}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Contact Number
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.contactNumber || "N/A"}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Email
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.email || "N/A"}</p>
								</div>
							</div>
						</div>

						{/* Product Information */}
						<div className='space-y-4'>
							<h4 className='font-semibold text-gray-800 dark:text-white'>Product Information</h4>
							<div className='space-y-2'>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Item Code
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.itemCode}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Description
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.description}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Brand
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.brand}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Quantity
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.qty}</p>
								</div>
							</div>
						</div>

						{/* Invoice Information */}
						<div className='space-y-4'>
							<h4 className='font-semibold text-gray-800 dark:text-white'>Invoice Information</h4>
							<div className='space-y-2'>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Invoice No
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.invoiceNo}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Invoice Date
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(jobCard.invoiceDate).toLocaleDateString()}
									</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Delivery No
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.deliveryNo}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Delivery Date
									</label>
									<p className='text-gray-900 dark:text-white'>
										{new Date(jobCard.deliveryDate).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>

						{/* Location Information */}
						<div className='space-y-4'>
							<h4 className='font-semibold text-gray-800 dark:text-white'>Location Information</h4>
							<div className='space-y-2'>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										Branch
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.branch}</p>
								</div>
								<div>
									<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										GPS Location
									</label>
									<p className='text-gray-900 dark:text-white'>{jobCard.gpsLocation || "N/A"}</p>
								</div>
							</div>
						</div>
					</div>

					{/* Remarks */}
					{jobCard.remarks && (
						<div className='mt-6'>
							<h4 className='font-semibold text-gray-800 dark:text-white mb-2'>Remarks</h4>
							<div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
								<p className='text-gray-900 dark:text-white'>{jobCard.remarks}</p>
							</div>
						</div>
					)}

					{/* Images */}
					<div className='mt-6'>
						<h4 className='font-semibold text-gray-800 dark:text-white mb-4'>Images</h4>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
							{jobCard.serialImage && (
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Serial Number Image
									</label>
									<img
										src={jobCard.serialImage}
										alt='Serial Number'
										className='w-full h-48 object-cover rounded-lg border'
									/>
								</div>
							)}
							{jobCard.indoorImage && (
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Indoor Scene
									</label>
									<img
										src={jobCard.indoorImage}
										alt='Indoor Scene'
										className='w-full h-48 object-cover rounded-lg border'
									/>
								</div>
							)}
							{jobCard.outdoorImage && (
								<div>
									<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
										Outdoor Scene
									</label>
									<img
										src={jobCard.outdoorImage}
										alt='Outdoor Scene'
										className='w-full h-48 object-cover rounded-lg border'
									/>
								</div>
							)}
						</div>
					</div>

					{/* Signature */}
					{jobCard.signature && (
						<div className='mt-6'>
							<h4 className='font-semibold text-gray-800 dark:text-white mb-2'>Signature</h4>
							<div className='rounded-lg border p-4'>
								<img
									src={jobCard.signature}
									alt='Signature'
									className='max-w-full h-32 object-contain'
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
