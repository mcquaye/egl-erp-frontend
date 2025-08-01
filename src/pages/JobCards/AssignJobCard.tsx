import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetJobCardByIdQuery, useAssignJobCardMutation } from "../../redux/api/jobCardApi";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function AssignJobCardPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { hasRole } = useAuth();
	const [assignedTo, setAssignedTo] = useState("");
	const [notes, setNotes] = useState("");

	const { data: jobCard, isLoading, error } = useGetJobCardByIdQuery(id || "", { skip: !id });

	const [assignJobCard, { isLoading: isUpdating }] = useAssignJobCardMutation();

	// Redirect if not admin
	if (!hasRole(["admin"])) {
		navigate("/dashboard");
		return null;
	}

	const getStatusColor = (status: string): "success" | "warning" | "error" => {
		if (status.includes("COMPLETED") || status.includes("DONE")) return "success";
		if (status.includes("PENDING") || status.includes("IN_PROGRESS")) return "warning";
		if (status.includes("CANCELLED") || status.includes("FAILED")) return "error";
		return "warning";
	};

	const handleAssign = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!assignedTo.trim()) {
			alert("Please enter who to assign this job card to");
			return;
		}

		if (!jobCard) return;

		try {
			await assignJobCard({
				id: id!,
				assignedTo: assignedTo.trim(),
			}).unwrap();

			toast.success("Job card assigned successfully!");
			navigate("/dashboard/job-cards/all");
		} catch (error: any) {
			console.error("Failed to assign job card:", error);
			toast.error(error?.message || "Failed to assign job card. Please try again.");
		}
	};

	if (isLoading) {
		return (
			<div>
				<PageMeta title='Assign Job Card' description='ERP - Assign Job Card' />
				<PageBreadcrumb pageTitle='Assign Job Card' />
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
				<PageMeta title='Assign Job Card' description='ERP - Assign Job Card' />
				<PageBreadcrumb pageTitle='Assign Job Card' />
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
			<PageMeta
				title={`Assign Job Card ${jobCard.jobNumber}`}
				description='ERP - Assign Job Card'
			/>
			<PageBreadcrumb pageTitle={`Assign Job Card ${jobCard.jobNumber}`} />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
				{/* Header */}
				<div className='border-b border-gray-200 p-6 dark:border-gray-800'>
					<div className='flex items-center justify-between'>
						<div>
							<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
								Assign Job Card
							</h3>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Job Number: {jobCard.jobNumber}
							</p>
						</div>
						<Badge color={getStatusColor(jobCard.jobStatus)}>{jobCard.jobStatus}</Badge>
					</div>
				</div>

				{/* Job Card Summary */}
				<div className='border-b border-gray-200 p-6 dark:border-gray-800'>
					<h4 className='font-semibold text-gray-800 dark:text-white mb-4'>Job Card Summary</h4>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Customer Name
							</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.customerName}</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Serial Number
							</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.serialNumber}</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Item Code
							</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.itemCode}</p>
						</div>
						<div>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>Branch</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.branch}</p>
						</div>
					</div>

					{jobCard.description && (
						<div className='mt-4'>
							<label className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Description
							</label>
							<p className='text-gray-900 dark:text-white'>{jobCard.description}</p>
						</div>
					)}
				</div>

				{/* Assignment Form */}
				<div className='p-6'>
					<form onSubmit={handleAssign} className='space-y-6'>
						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Assign To <span className='text-red-500'>*</span>
							</label>
							<input
								type='text'
								value={assignedTo}
								onChange={(e) => setAssignedTo(e.target.value)}
								placeholder='Enter technician name or employee ID'
								className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
								required
							/>
							<p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
								Enter the name or employee ID of the person you want to assign this job card to
							</p>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
								Assignment Notes
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder='Add any special instructions or notes for the assignee...'
								rows={4}
								className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
							/>
							<p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
								Optional: Add any special instructions, priority level, or important notes
							</p>
						</div>

						{/* Current Assignment Status */}
						{jobCard.assignedTo && (
							<div className='rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20'>
								<h5 className='font-medium text-yellow-800 dark:text-yellow-200 mb-2'>
									Current Assignment
								</h5>
								<p className='text-yellow-700 dark:text-yellow-300'>
									This job card is currently assigned to: <strong>{jobCard.assignedTo}</strong>
								</p>
								<p className='text-sm text-yellow-600 dark:text-yellow-400 mt-1'>
									Proceeding will reassign this job card to a new person.
								</p>
							</div>
						)}

						{/* Action Buttons */}
						<div className='flex gap-4 pt-4'>
							<button
								type='submit'
								disabled={isUpdating || !assignedTo.trim()}
								className='rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'>
								{isUpdating ? "Assigning..." : "Assign Job Card"}
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
		</div>
	);
}
