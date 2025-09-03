import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useGetStatisticsQuery } from "../../redux/api/jobCardApi";

export default function StatusDonut() {
	const { data: stats, isLoading } = useGetStatisticsQuery();
	const status = stats?.status_distribution || {};

	const labels = Object.keys(status);
	const series = Object.values(status).map((v: any) => Number(v));

	const options: ApexOptions = {
		labels: labels,
		legend: { position: "bottom" },
		colors: ["#10B981", "#F59E0B", "#EF4444", "#6366F1"],
		responsive: [
			{
				breakpoint: 480,
				options: { chart: { width: 200 }, legend: { position: "bottom" } },
			},
		],
	};

	if (isLoading) return <div className='rounded-2xl p-4 bg-white'>Loading...</div>;
	if (!labels.length) return <div className='rounded-2xl p-4 bg-white'>No status data</div>;

	return (
		<div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
			<h3 className='text-sm font-semibold text-gray-800 mb-2'>Status Distribution</h3>
			<Chart options={options} series={series} type='donut' width={300} />
		</div>
	);
}
