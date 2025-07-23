import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function AccessDenied() {
	const { user } = useAuth();

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
			<div className='max-w-md w-full space-y-8 p-8'>
				<div className='text-center'>
					<div className='mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20'>
						<svg
							className='h-12 w-12 text-red-600 dark:text-red-400'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 15v2m0 0v2m0-2h2m-2 0h-2m9-5a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
					</div>
					<h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-white'>Access Denied</h2>
					<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
						You don't have permission to access this page.
					</p>
					{user && (
						<p className='mt-1 text-xs text-gray-500 dark:text-gray-500'>
							Current role: <span className='font-medium'>{user.role}</span>
						</p>
					)}
				</div>
				<div className='space-y-4'>
					<Link
						to='/dashboard'
						className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
						Go to Dashboard
					</Link>
					<button
						onClick={() => window.history.back()}
						className='w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'>
						Go Back
					</button>
				</div>
			</div>
		</div>
	);
}
