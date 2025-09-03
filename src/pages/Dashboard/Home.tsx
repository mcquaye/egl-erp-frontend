import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import StatusDonut from "../../components/ecommerce/StatusDonut";
import TopCustomers from "../../components/ecommerce/TopCustomers";
import RegionDistribution from "../../components/ecommerce/RegionDistribution";

import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
	const { hasRole } = useAuth();
	const isPrivileged = hasRole(["admin", "manager"]);

	return (
		<>
			<PageMeta title='Admin Dashboard - ERP Admin' description='...' />
			{isPrivileged ? (
				<div className='grid grid-cols-12 gap-4 md:gap-6'>
					<div className='col-span-12 space-y-6 xl:col-span-7'>
						<EcommerceMetrics />
						<TopCustomers />
						{/* <MonthlySalesChart /> */}
					</div>

					<div className='col-span-12 xl:col-span-5'>
						<RegionDistribution />
						{/* <MonthlyTarget /> */}
					</div>

					<div className='col-span-12'>
						<RecentOrders />
					</div>

					<div className='col-span-12 xl:col-span-5'>
						<StatusDonut />
					</div>
				</div>
			) : (
				// Basic view for regular users
				<div className='grid grid-cols-12 gap-4 md:gap-6'>
					<div className='col-span-12 space-y-6 xl:col-span-7'>
						<RecentOrders />
					</div>

					<div className='col-span-12 xl:col-span-5'>
						<RegionDistribution />
					</div>
				</div>
			)}
		</>
	);
}
