import { useGetStatisticsQuery } from "../../redux/api/jobCardApi";

export default function StatsSummary() {
	const { data: stats, isLoading } = useGetStatisticsQuery();

	const summary = stats?.summary;

	const cards = [
		{ title: "Total", value: summary?.total_job_cards ?? 0 },
		{ title: "Completed", value: summary?.completed_job_cards ?? 0 },
		{ title: "Pending", value: summary?.pending_job_cards ?? 0 },
		{ title: "In progress", value: summary?.in_progress_job_cards ?? 0 },
	];

	return (
		<div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
			{cards.map((c) => (
				<div
					key={c.title}
					className='rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]'>
					<p className='text-sm text-gray-500'>{c.title}</p>
					<p className='mt-2 text-2xl font-semibold text-gray-800'>{isLoading ? "—" : c.value}</p>
				</div>
			))}
			<div className='rounded-2xl border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-white/[0.03]'>
				<p className='text-sm text-gray-500'>Completion Rate</p>
				<p className='mt-2 text-2xl font-semibold text-gray-800'>
					{isLoading ? "—" : `${summary?.completion_rate ?? 0}%`}
				</p>
			</div>
		</div>
	);
}
