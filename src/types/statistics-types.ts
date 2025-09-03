// Statistics API response types for dashboard

export interface MonthlyTrendItem {
	month: string;
	count: number;
}

export interface TopCustomer {
	customerName: string;
	job_count: number;
}

export interface StatisticsSummary {
	total_job_cards: number;
	completed_job_cards: number;
	pending_job_cards: number;
	in_progress_job_cards: number;
	this_month_job_cards: number;
	monthly_change_percentage: number;
	completion_rate: number;
}

export interface StatisticsData {
	summary: StatisticsSummary;
	status_distribution: Record<string, number>;
	type_distribution: Record<string, number>;
	region_distribution: Record<string, number>;
	monthly_trend: MonthlyTrendItem[];
	top_customers: TopCustomer[];
}

export interface StatisticsResponse {
	success: boolean;
	data: StatisticsData;
	message: string;
	timestamp: string;
}
