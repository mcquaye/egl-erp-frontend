import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import InstallationSearch from "../../components/installation/InstallationSearch";

export default function InstallationsPage() {
	return (
		<>
			<PageMeta title='Installations' description='ERP - Admin - Dashboard' />
			<PageBreadcrumb pageTitle='My Installations' />
			<div className='space-y-6'>
				<InstallationSearch />
			</div>
		</>
	);
}
