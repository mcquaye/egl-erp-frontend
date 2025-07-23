import React from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const InstallationsPage = () => {
	return (
		<>
			<PageMeta title='Installations' description='ERP - Admin - Dashboard' />
			<PageBreadcrumb pageTitle='My Installations' />
			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'></div>
		</>
	);
};

export default InstallationsPage;
