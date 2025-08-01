import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import InstallationSearch from "../../components/installation/InstallationSearch";
import { InstallationItem } from "../../types";

const ScanPage = () => {
	const handleSearchResults = (results: InstallationItem[]) => {
		console.log("Search results:", results);
		// Handle the search results here if needed
		// For example, you could store them in state, send to parent component, etc.
	};

	return (
		<>
			<PageMeta title='Scan For Installations' description='ERP - Admin - Dashboard' />
			<PageBreadcrumb pageTitle='Installations' />

			<div className='space-y-6'>
				{/* Search Component */}
				<InstallationSearch onResultsFound={handleSearchResults} className='w-full' />

				{/* Additional content can go here */}
				<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
					<div className='text-center py-8'>
						<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
							Manual Installation Search
						</h3>
						<p className='text-gray-600 dark:text-gray-400'>
							Use the search form above to find installation data by serial number.
							<br />
							Results will appear below the search form.
						</p>
					</div>
				</div>
			</div>
		</>
	);
};

export default ScanPage;
