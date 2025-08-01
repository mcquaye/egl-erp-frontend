import { useGetUsersQuery, useDeleteUserMutation } from "../../redux/api/authApi";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";

export default function UsersList() {
	const navigate = useNavigate();
	const { data: users, isLoading, error } = useGetUsersQuery();
	const [deleteUser] = useDeleteUserMutation();

	// Helper function to format date safely
	const formatDate = (dateString: string) => {
		try {
			if (!dateString) return "N/A";

			// API returns format: "2025-08-01 18:33:32"
			// Convert to ISO format for JavaScript parsing
			const isoString = dateString.replace(" ", "T") + "Z";
			const date = new Date(isoString);

			if (isNaN(date.getTime())) {
				console.warn("Unable to parse date:", dateString);
				return "Invalid Date";
			}

			return date.toLocaleDateString();
		} catch (error) {
			console.error("Date parsing error:", error, dateString);
			return "Invalid Date";
		}
	};

	const handleDeleteUser = async (userId: number, userName: string) => {
		if (
			!window.confirm(
				`Are you sure you want to delete user "${userName}"? This action cannot be undone.`
			)
		) {
			return;
		}

		try {
			await deleteUser(userId).unwrap();
			toast.success(`User "${userName}" deleted successfully`);
		} catch (error: any) {
			console.error("Delete user error:", error);
			const errorMessage = error?.data?.error || "Failed to delete user. Please try again.";
			toast.error(errorMessage);
		}
	};

	if (isLoading) {
		return (
			<>
				<PageMeta title='Users Management' description='Manage system users' />
				<PageBreadcrumb pageTitle='Users' />
				<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
					<div className='flex items-center justify-center h-64'>
						<div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
						<span className='ml-2 text-gray-600 dark:text-gray-400'>Loading users...</span>
					</div>
				</div>
			</>
		);
	}

	if (error) {
		return (
			<>
				<PageMeta title='Users Management' description='Manage system users' />
				<PageBreadcrumb pageTitle='Users' />
				<div className='rounded-2xl border border-red-200 bg-white p-5 dark:border-red-800 dark:bg-white/[0.03] lg:p-6'>
					<div className='text-center text-red-600 dark:text-red-400'>
						<h3 className='text-lg font-semibold mb-2'>Failed to load users</h3>
						<p>There was an error loading the users list. Please try again.</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<PageMeta title='Users Management' description='Manage system users' />
			<PageBreadcrumb pageTitle='Users' />
			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
						System Users ({users?.length || 0})
					</h3>
					<button
						onClick={() => navigate("/dashboard/users/create")}
						className='px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
						Add New User
					</button>
				</div>

				<div className='overflow-x-auto'>
					<table className='w-full text-sm text-left'>
						<thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
							<tr>
								<th scope='col' className='px-6 py-3'>
									ID
								</th>
								<th scope='col' className='px-6 py-3'>
									Name
								</th>
								<th scope='col' className='px-6 py-3'>
									Email
								</th>
								<th scope='col' className='px-6 py-3'>
									Role
								</th>
								<th scope='col' className='px-6 py-3'>
									Phone
								</th>
								<th scope='col' className='px-6 py-3'>
									Created
								</th>
								<th scope='col' className='px-6 py-3'>
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{users?.map((user) => (
								<tr
									key={user.id}
									className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
									<td className='px-6 py-4 font-medium text-gray-900 dark:text-white'>{user.id}</td>
									<td className='px-6 py-4'>
										<div className='flex items-center'>
											<div className='w-8 h-8 mr-3 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center'>
												<span className='text-xs font-medium text-gray-700 dark:text-gray-200'>
													{user.name.charAt(0).toUpperCase()}
												</span>
											</div>
											<span className='text-gray-900 dark:text-gray-100'>{user.name}</span>
										</div>
									</td>
									<td className='px-6 py-4 text-gray-900 dark:text-gray-100'>{user.email}</td>
									<td className='px-6 py-4'>
										<span
											className={`px-2 py-1 text-xs font-medium rounded-full ${
												user.role === "admin"
													? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
													: user.role === "manager"
													? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
													: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
											}`}>
											{user.role === "admin"
												? "Administrator"
												: user.role === "manager"
												? "Manager"
												: "User"}
										</span>
									</td>
									<td className='px-6 py-4 text-gray-900 dark:text-gray-100'>
										{user.phoneNumber || "N/A"}
									</td>
									<td className='px-6 py-4 text-gray-900 dark:text-gray-100'>
										{formatDate(user.created_at)}
									</td>
									<td className='px-6 py-4'>
										<div className='flex space-x-2'>
											<button
												onClick={() => navigate(`/dashboard/users/edit/${user.id}`)}
												className='px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 hover:underline'>
												Edit
											</button>
											<button
												onClick={() => handleDeleteUser(user.id, user.name)}
												className='px-3 py-1 text-xs font-medium text-red-600 hover:text-red-900 dark:text-red-400 hover:underline'>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{users && users.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-gray-500 dark:text-gray-400'>No users found</p>
					</div>
				)}
			</div>
		</>
	);
}
