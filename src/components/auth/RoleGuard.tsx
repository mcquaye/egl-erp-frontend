import { useAuth } from "../../context/AuthContext";

interface RoleGuardProps {
	children: React.ReactNode;
	allowedRoles: string | string[];
	fallback?: React.ReactNode;
	requirePermission?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
	children,
	allowedRoles,
	fallback = null,
	requirePermission,
}) => {
	const { hasRole, hasPermission } = useAuth();

	// Check role access
	const hasRoleAccess = hasRole(allowedRoles);

	// Check permission if specified
	const hasPermissionAccess = requirePermission ? hasPermission(requirePermission) : true;

	if (!hasRoleAccess || !hasPermissionAccess) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

export default RoleGuard;
