import { useAuth } from "../../context/AuthContext";

interface PermissionGuardProps {
	children: React.ReactNode;
	permission: string;
	fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
	children,
	permission,
	fallback = null,
}) => {
	const { hasPermission } = useAuth();

	if (!hasPermission(permission)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

export default PermissionGuard;
