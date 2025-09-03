import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import { useGetStatisticsQuery } from "../../redux/api/jobCardApi";

// Note: `useGetStatisticsQuery` returns the typed `StatisticsData` after transformResponse

export default function EcommerceMetrics() {
	const { data: stats } = useGetStatisticsQuery();

	const monthlyChange = stats?.summary?.monthly_change_percentage ?? 0;
	const completionRate = stats?.summary?.completion_rate ?? 0;
	const changeIsPositive = monthlyChange >= 0;
	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6'>
			{/* <!-- Metric Item Start --> */}
			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
				<div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
					<GroupIcon className='text-gray-800 size-6 dark:text-white/90' />
				</div>

				<div className='flex items-end justify-between mt-5'>
					<div>
						<span className='text-sm text-gray-500 dark:text-gray-400'>Installations</span>
						<h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
							{stats?.summary?.total_job_cards}
						</h4>
					</div>
					<Badge color={changeIsPositive ? "success" : "error"}>
						{changeIsPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
						{typeof monthlyChange === "number" ? `${monthlyChange}%` : "-"}
					</Badge>
				</div>
			</div>
			{/* <!-- Metric Item End --> */}

			{/* <!-- Metric Item Start --> */}
			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6'>
				<div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800'>
					<BoxIconLine className='text-gray-800 size-6 dark:text-white/90' />
				</div>
				<div className='flex items-end justify-between mt-5'>
					<div>
						<span className='text-sm text-gray-500 dark:text-gray-400'>Orders</span>
						<h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
							{stats?.summary?.completed_job_cards ?? "5,359"}
						</h4>
					</div>

					<Badge color='primary'>{completionRate}%</Badge>
				</div>
			</div>
			{/* <!-- Metric Item End --> */}
		</div>
	);
}
