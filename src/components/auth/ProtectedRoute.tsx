import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to='/signin' state={{ from: location }} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
