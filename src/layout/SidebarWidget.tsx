import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/button/Button";

export default function SidebarWidget() {
	const { logout } = useAuth();
	const navigate = useNavigate();

	// Handle logout and redirect to home page
	const handleLogout = () => {
		logout();
		navigate("/");
	};
	return (
		<div
			className={`
        mx-auto mt-20 mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}>
			<h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>ERP Admin Dashboard</h3>
			<p className='mb-4 text-gray-500 text-theme-sm dark:text-gray-400'>
				Manage your dashboard here
			</p>
			<Button
				onClick={handleLogout}
				className='flex items-center justify-center p-3 font-medium text-white rounded-lg bg-red-500 text-theme-sm w-full hover:bg-red-600'>
				Logout
			</Button>
			<p className='text-gray-500 text-xs pt-4 pb-2 dark:text-gray-400'>v1.0.0</p>
		</div>
	);
}
