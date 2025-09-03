import { useGetStatisticsQuery } from "../../redux/api/jobCardApi";
import Badge from "../ui/badge/Badge";

export default function TopCustomers() {
	const { data: stats, isLoading } = useGetStatisticsQuery();
	const top = stats?.top_customers ?? [];

	if (isLoading) return <div className='rounded-2xl p-4 bg-white'>Loading...</div>;
	if (!top.length) return <div className='rounded-2xl p-4 bg-white'>No top customers</div>;

	return (
		<div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
			<h3 className='text-sm font-semibold text-gray-800 mb-2'>Top Customers</h3>
			<ul className='space-y-3'>
				{top.map((c: any, idx: number) => (
					<li key={idx} className='flex items-center justify-between'>
						<div>
							<p className='font-medium text-gray-800'>{c.customerName}</p>
							<p className='text-xs text-gray-500'>{c.job_count} jobs</p>
						</div>
						<Badge color='success'>{c.job_count}</Badge>
					</li>
				))}
			</ul>
		</div>
	);
}
