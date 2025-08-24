import { useGetMyJobCardsQuery } from "../../redux/api/jobCardApi";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import { ImEye } from "react-icons/im";
import { Link } from "react-router";
import { JobCard } from "../../types";

export default function MyJobCardsPage() {
	const { user } = useAuth();
	const { data: myJobCards, isLoading, error } = useGetMyJobCardsQuery(user?.id?.toString() || "0");

	const getStatusColor = (status: string): "success" | "warning" | "error" => {
		if (status.includes("COMPLETED") || status.includes("DONE")) return "success";
		if (status.includes("PENDING") || status.includes("IN_PROGRESS")) return "warning";
		if (status.includes("CANCELLED") || status.includes("FAILED")) return "error";
		return "warning";
	};

	if (isLoading) {
		return (
			<div>
				<PageMeta title='My Job Cards' description='ERP - Manager - My Job Cards' />
				<PageBreadcrumb pageTitle='My Job Cards' />
				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='flex items-center justify-center py-12'>
						<div className='text-gray-500'>Loading your job cards...</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div>
				<PageMeta title='My Job Cards' description='ERP - Manager - My Job Cards' />
				<PageBreadcrumb pageTitle='My Job Cards' />
				<div className='rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]'>
					<div className='flex items-center justify-center py-12'>
						<div className='text-red-500'>Error loading your job cards</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageMeta title='My Job Cards' description='ERP - Manager - My Job Cards' />
			<PageBreadcrumb pageTitle='My Job Cards' />

			<div className='rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]'>
				{/* Header */}
				<div className='flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
					<div>
						<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>My Job Cards</h3>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							You have created {myJobCards?.length || 0} job cards
						</p>
					</div>
					<Link
						to='/dashboard/job-cards/create'
						className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
						Create New Job Card
					</Link>
				</div>

				{/* Table */}
				{(myJobCards?.length || 0) === 0 ? (
					<div className='flex items-center justify-center py-12'>
						<div className='text-center'>
							<p className='text-gray-500 dark:text-gray-400 mb-4'>
								You haven\'t created any job cards yet.
							</p>
							<Link
								to='/dashboard/job-cards/create'
								className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>
								Create Your First Job Card
							</Link>
						</div>
					</div>
				) : (
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
										Created At
									</TableCell>
									<TableCell
										isHeader
										className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400'>
										Actions
									</TableCell>
								</TableRow>
							</TableHeader>
							<TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
								{myJobCards?.map((jobCard: JobCard) => (
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
											{jobCard.created_at ? new Date(jobCard.created_at).toLocaleString() : "N/A"}
										</TableCell>
										<TableCell className='px-6 py-4 align-middle flex items-center justify-center whitespace-nowrap'>
											<Link
												to={`/dashboard/job-cards/view/${jobCard.id}`}
												className='text-blue-600 hover:text-blue-800 dark:text-blue-400'>
												<ImEye className='h-5 w-5' />
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
}
