import { useAuth } from "../context/AuthContext";
import RoleGuard from "../components/auth/RoleGuard";
import PermissionGuard from "../components/auth/PermissionGuard";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";

export default function AuthDemo() {
	const { user, hasRole, hasPermission } = useAuth();

	return (
		<div className='p-6 space-y-6'>
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
				<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
					Authentication & Authorization Demo
				</h1>

				{/* Current User Info */}
				<div className='mb-6'>
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
						Current User Information
					</h2>
					<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
						<p>
							<strong>Name:</strong> {user?.name}
						</p>
						<p>
							<strong>Email:</strong> {user?.email}
						</p>
						<p>
							<strong>Role:</strong> {user?.role}
						</p>
						<p>
							<strong>ID:</strong> {user?.id}
						</p>
					</div>
				</div>

				{/* Role-based Content */}
				<div className='mb-6'>
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
						Role-based Content
					</h2>

					<div className='space-y-4'>
						<RoleGuard
							allowedRoles='admin'
							fallback={<p className='text-red-600'>❌ Admin only content (hidden)</p>}>
							<div className='bg-red-50 border border-red-200 rounded-lg p-4'>
								<p className='text-red-800'>
									✅ <strong>Admin Only:</strong> This content is only visible to administrators.
								</p>
							</div>
						</RoleGuard>

						<RoleGuard
							allowedRoles={["admin", "manager"]}
							fallback={<p className='text-orange-600'>❌ Manager+ only content (hidden)</p>}>
							<div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
								<p className='text-orange-800'>
									✅ <strong>Manager+ Only:</strong> This content is visible to managers and admins.
								</p>
							</div>
						</RoleGuard>

						<div className='bg-green-50 border border-green-200 rounded-lg p-4'>
							<p className='text-green-800'>
								✅ <strong>All Users:</strong> This content is visible to all authenticated users.
							</p>
						</div>
					</div>
				</div>

				{/* Permission-based Content */}
				<div className='mb-6'>
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
						Permission-based Content
					</h2>

					<div className='space-y-4'>
						<PermissionGuard
							permission='manage_users'
							fallback={
								<p className='text-red-600'>❌ User management permission required (hidden)</p>
							}>
							<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
								<p className='text-blue-800'>
									✅ <strong>User Management:</strong> You have permission to manage users.
								</p>
							</div>
						</PermissionGuard>

						<PermissionGuard
							permission='view_all_reports'
							fallback={
								<p className='text-purple-600'>❌ View all reports permission required (hidden)</p>
							}>
							<div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
								<p className='text-purple-800'>
									✅ <strong>All Reports:</strong> You can view all system reports.
								</p>
							</div>
						</PermissionGuard>

						<PermissionGuard
							permission='manage_settings'
							fallback={
								<p className='text-indigo-600'>
									❌ Settings management permission required (hidden)
								</p>
							}>
							<div className='bg-indigo-50 border border-indigo-200 rounded-lg p-4'>
								<p className='text-indigo-800'>
									✅ <strong>System Settings:</strong> You can manage system settings.
								</p>
							</div>
						</PermissionGuard>
					</div>
				</div>

				{/* Role and Permission Check Results */}
				<div className='mb-6'>
					<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
						Role & Permission Checks
					</h2>

					<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<h3 className='font-medium mb-2'>Role Checks:</h3>
								<ul className='space-y-1 text-sm'>
									<li>Admin: {hasRole("admin") ? "✅ Yes" : "❌ No"}</li>
									<li>Manager: {hasRole("manager") ? "✅ Yes" : "❌ No"}</li>
									<li>User: {hasRole("user") ? "✅ Yes" : "❌ No"}</li>
									<li>Admin or Manager: {hasRole(["admin", "manager"]) ? "✅ Yes" : "❌ No"}</li>
								</ul>
							</div>
							<div>
								<h3 className='font-medium mb-2'>Permission Checks:</h3>
								<ul className='space-y-1 text-sm'>
									<li>Read: {hasPermission("read") ? "✅ Yes" : "❌ No"}</li>
									<li>Write: {hasPermission("write") ? "✅ Yes" : "❌ No"}</li>
									<li>Delete: {hasPermission("delete") ? "✅ Yes" : "❌ No"}</li>
									<li>Manage Users: {hasPermission("manage_users") ? "✅ Yes" : "❌ No"}</li>
									<li>
										View All Reports: {hasPermission("view_all_reports") ? "✅ Yes" : "❌ No"}
									</li>
									<li>Manage Settings: {hasPermission("manage_settings") ? "✅ Yes" : "❌ No"}</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Change Password Form */}
			<ChangePasswordForm />

			{/* Demo Account Information */}
			<div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
				<h2 className='text-lg font-semibold text-yellow-800 mb-2'>🔑 Demo Account Information</h2>
				<p className='text-yellow-700 mb-4'>
					Try logging out and back in with different demo accounts to see how the content changes:
				</p>
				<div className='space-y-2 text-sm text-yellow-700'>
					<div>
						<strong>Admin:</strong> admin@electrolandgh.com / 00000000 (Full access)
					</div>
					<div>
						<strong>Manager:</strong> manager@electrolandgh.com / manager123 (Limited admin access)
					</div>
					<div>
						<strong>User:</strong> user@electrolandgh.com / user123 (Basic access only)
					</div>
				</div>
			</div>
		</div>
	);
}
