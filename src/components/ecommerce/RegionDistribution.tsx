import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useGetStatisticsQuery } from "../../redux/api/jobCardApi";

export default function RegionDistribution() {
	const { data: stats, isLoading } = useGetStatisticsQuery();

	const regions = stats?.region_distribution || {};

	const labels = Object.keys(regions);
	// ApexCharts expects series as an array of objects: [{ name: string, data: number[] }]
	const numericValues = labels.map((k) => Number((regions as any)[k] ?? 0));
	const series = [{ name: "Jobs", data: numericValues }];

	const options: ApexOptions = {
		chart: { type: "bar" },
		plotOptions: { bar: { horizontal: true } },
		colors: ["#6366F1"],
		xaxis: { categories: labels },
	};

	if (isLoading) return <div className='rounded-2xl p-4 bg-white'>Loading...</div>;
	if (!labels.length) return <div className='rounded-2xl p-4 bg-white'>No region data</div>;

	return (
		<div className='rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]'>
			<h3 className='text-sm font-semibold text-gray-800 mb-2'>Region Distribution</h3>
			<Chart options={options} series={series} type='bar' height={250} />
		</div>
	);
}
