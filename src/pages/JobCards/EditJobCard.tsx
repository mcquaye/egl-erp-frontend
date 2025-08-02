import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetJobCardByIdQuery, useUpdateJobCardMutation } from "../../redux/api/jobCardApi";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAuth } from "../../context/AuthContext";
import { AlertDialog } from "../../components/ui/alert-dialog";
import { useAlert } from "../../hooks/useAlert";

export default function EditJobCardPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { hasRole } = useAuth();

	const { data: jobCard, isLoading, error } = useGetJobCardByIdQuery(id || "", { skip: !id });

	const [updateJobCard, { isLoading: isUpdating }] = useUpdateJobCardMutation();

	// Alert dialog hook
	const { alert, isOpen, alertOptions, handleClose } = useAlert();

	// Form state
	const [formData, setFormData] = useState({
		jobStatus: "",
		assignedTo: "",
		remarks: "",
		gpsLocation: "",
		contactPerson: "",
		contactNumber: "",
		email: "",
	});

	// Redirect if not admin
	if (!hasRole(["admin"])) {
		navigate("/dashboard");
		return null;
	}

	// Populate form when job card data loads
	useEffect(() => {
		if (jobCard) {
			setFormData({
				jobStatus: jobCard.jobStatus || "",
				assignedTo: jobCard.assignedTo || "",
				remarks: jobCard.remarks || "",
				gpsLocation: jobCard.gpsLocation || "",
				contactPerson: jobCard.contactPerson || "",
				contactNumber: jobCard.contactNumber || "",
				email: jobCard.email || "",
			});
		}
	}, [jobCard]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!jobCard) return;

		try {
			// Follow the same pattern as CreateJobCard - send only the form data
			const updatePayload = {
				...formData,
			};

			await updateJobCard({
				id: String(jobCard.id),
				data: updatePayload,
			}).unwrap();

			await alert({
				title: "Success!",
				message: "Job card updated successfully!",
				type: "success",
				buttonText: "OK",
			});
			navigate("/dashboard/job-cards/all");
		} catch (error) {
			console.error("Failed to update job card:", error);
			await alert({
				title: "Error",
				message: "Failed to update job card. Please try again.",
				type: "error",
				buttonText: "OK",
			});
		}
	};

	if (isLoading) {
		return (
			<div>
				<PageMeta title='Edit Job Card' description='ERP - Edit Job Card' />
				<PageBreadcrumb pageTitle='Edit Job Card' />
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
				<PageMeta title='Edit Job Card' description='ERP - Edit Job Card' />
				<PageBreadcrumb pageTitle='Edit Job Card' />
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
			<PageMeta title={`Edit Job Card ${jobCard.jobNumber}`} description='ERP - Edit Job Card' />
			<PageBreadcrumb pageTitle={`Edit Job Card ${jobCard.jobNumber}`} />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
				{/* Header */}
				<div className='border-b border-gray-200 p-6 dark:border-gray-800'>
					<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Edit Job Card</h3>
					<p className='text-sm text-gray-500 dark:text-gray-400'>
						Job Number: {jobCard.jobNumber} | Serial: {jobCard.serialNumber}
					</p>
				</div>

				{/* Non-editable Job Card Information */}
				<div className='border-b border-gray-200 p-6 dark:border-gray-800'>
					<h4 className='font-semibold text-gray-800 dark:text-white mb-4'>Job Card Information</h4>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Customer Name
							</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.customerName}</p>
						</div>
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
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Brand</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.brand}</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Branch</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.branch}</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Created By
							</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.username}</p>
						</div>
					</div>
				</div>

				{/* Editable Form */}
				<div className='p-6'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							{/* Job Status */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Job Status <span className='text-red-500'>*</span>
								</label>
								<select
									name='jobStatus'
									value={formData.jobStatus}
									onChange={handleInputChange}
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
									required>
									<option value=''>Select Status</option>
									<option value='PENDING'>Pending</option>
									<option value='ASSIGNED'>Assigned</option>
									<option value='IN_PROGRESS'>In Progress</option>
									<option value='COMPLETED'>Completed</option>
									<option value='CANCELLED'>Cancelled</option>
									<option value='ON_HOLD'>On Hold</option>
								</select>
							</div>

							{/* Assigned To */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Assigned To
								</label>
								<input
									type='text'
									name='assignedTo'
									value={formData.assignedTo}
									onChange={handleInputChange}
									placeholder='Enter technician name or employee ID'
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								/>
							</div>

							{/* Contact Person */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Contact Person
								</label>
								<input
									type='text'
									name='contactPerson'
									value={formData.contactPerson}
									onChange={handleInputChange}
									placeholder='Enter contact person name'
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								/>
							</div>

							{/* Contact Number */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Contact Number
								</label>
								<input
									type='tel'
									name='contactNumber'
									value={formData.contactNumber}
									onChange={handleInputChange}
									placeholder='Enter contact number'
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								/>
							</div>

							{/* Email */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									Email
								</label>
								<input
									type='email'
									name='email'
									value={formData.email}
									onChange={handleInputChange}
									placeholder='Enter email address'
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								/>
							</div>

							{/* GPS Location */}
							<div>
								<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
									GPS Location
								</label>
								<input
									type='text'
									name='gpsLocation'
									value={formData.gpsLocation}
									onChange={handleInputChange}
									placeholder='Enter GPS coordinates or location details'
									className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								/>
							</div>
						</div>

						{/* Remarks */}
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Remarks
							</label>
							<textarea
								name='remarks'
								value={formData.remarks}
								onChange={handleInputChange}
								placeholder='Enter any remarks or notes...'
								rows={4}
								className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
							/>
						</div>

						{/* Images Section (Read-only) */}
						{(jobCard.serialImage || jobCard.indoorImage || jobCard.outdoorImage) && (
							<div>
								<h4 className='font-semibold text-gray-800 dark:text-white mb-4'>
									Attached Images
								</h4>
								<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
									{jobCard.serialImage && (
										<div>
											<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
												Serial Number Image
											</label>
											<img
												src={jobCard.serialImage}
												alt='Serial Number'
												className='w-full h-32 object-cover rounded-lg border'
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
												className='w-full h-32 object-cover rounded-lg border'
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
												className='w-full h-32 object-cover rounded-lg border'
											/>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className='flex gap-4 pt-4'>
							<button
								type='submit'
								disabled={isUpdating}
								className='rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'>
								{isUpdating ? "Updating..." : "Update Job Card"}
							</button>
							<button
								type='button'
								onClick={() => navigate("/dashboard/job-cards/all")}
								className='rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Alert Dialog */}
			{alertOptions && (
				<AlertDialog
					isOpen={isOpen}
					onClose={handleClose}
					title={alertOptions.title}
					message={alertOptions.message}
					buttonText={alertOptions.buttonText}
					type={alertOptions.type}
				/>
			)}
		</div>
	);
}
