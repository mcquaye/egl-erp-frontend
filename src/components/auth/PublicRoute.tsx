import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface PublicRouteProps {
	children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
			</div>
		);
	}

	// Redirect to dashboard if already authenticated
	if (isAuthenticated) {
		return <Navigate to='/dashboard' replace />;
	}

	return <>{children}</>;
};

export default PublicRoute;
