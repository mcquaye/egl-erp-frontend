import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
	BoxCubeIcon,
	CalenderIcon,
	ChevronDownIcon,
	GridIcon,
	HorizontaLDots,
	PieChartIcon,
	PlugInIcon,
	UserCircleIcon,
	TaskIcon,
	DownloadIcon,
	EnvelopeIcon,
	DocsIcon, // Using DocsIcon for settings
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
	name: string;
	icon: React.ReactNode;
	path?: string;
	subItems?: {
		name: string;
		path: string;
		pro?: boolean;
		new?: boolean;
		requiredRoles?: string[];
	}[];
	requiredRoles?: string[];
};

const navItems: NavItem[] = [
	{
		name: "Dashboard",
		icon: <GridIcon />,
		path: "/dashboard",
	},
	// JOB CARD MANAGEMENT (Different access levels)
	{
		icon: <TaskIcon />,
		name: "Job Cards",
		subItems: [
			// Admin - Full CRUD access
			{ name: "All Job Cards", path: "/dashboard/job-cards", pro: false, requiredRoles: ["admin"] },
			{
				name: "Create Job Card",
				path: "/dashboard/job-cards/create",
				pro: false,
				requiredRoles: ["admin", "manager"],
			},
			{
				name: "Assign Job Card",
				path: "/dashboard/job-cards/assign",
				pro: false,
				requiredRoles: ["admin"],
			},
			// Manager - Create and view their jobs
			{
				name: "My Job Cards",
				path: "/dashboard/job-cards/my-jobs",
				pro: false,
				requiredRoles: ["manager"],
			},
			// User - View by ID/Serial
			{
				name: "View Job Card",
				path: "/dashboard/job-cards/view",
				pro: false,
				requiredRoles: ["user"],
			},
		],
	},
	// SCAN (Admin and Manager access - for searching job cards by ID)
	{
		icon: <PieChartIcon />,
		name: "Scan",
		requiredRoles: ["admin", "manager"],
		subItems: [
			{
				name: "Scan QR Code",
				path: "/dashboard/scan/qr-code",
				pro: false,
				requiredRoles: ["admin", "manager"],
			},
			{
				name: "Manual ID Search",
				path: "/dashboard/scan/manual",
				pro: false,
				requiredRoles: ["admin", "manager"],
			},
			{ name: "Batch Scan", path: "/dashboard/scan/batch", pro: false, requiredRoles: ["admin"] },
		],
	},
	// REPORTS (Role-based access)
	{
		icon: <CalenderIcon />,
		name: "Reports",
		subItems: [
			// All users can view their own reports
			{ name: "My Reports", path: "/dashboard/reports/my-reports", pro: false },
			// Admin can view all job reports
			{
				name: "All Job Reports",
				path: "/dashboard/reports/job-reports",
				pro: false,
				requiredRoles: ["admin"],
			},
			// Admin can view all system reports
			{
				name: "All Reports",
				path: "/dashboard/reports/all-reports",
				pro: false,
				requiredRoles: ["admin"],
			},
			// Manager can view team reports
			{
				name: "Team Reports",
				path: "/dashboard/reports/team-reports",
				pro: false,
				requiredRoles: ["manager"],
			},
		],
	},
	// DOWNLOADS (Role-based access)
	{
		icon: <DownloadIcon />,
		name: "Downloads",
		subItems: [
			// Admin can download all job cards
			{
				name: "Download Job Cards",
				path: "/dashboard/downloads/job-cards",
				pro: false,
				requiredRoles: ["admin"],
			},
			// Manager can download their created job cards
			{
				name: "My Job Downloads",
				path: "/dashboard/downloads/my-jobs",
				pro: false,
				requiredRoles: ["manager"],
			},
			// User can download viewed job card
			{
				name: "Download Viewed Card",
				path: "/dashboard/downloads/viewed-card",
				pro: false,
				requiredRoles: ["user"],
			},
		],
	},
	// MESSAGING (Admin can send to all, Manager limited)
	{
		icon: <EnvelopeIcon />,
		name: "Messages",
		requiredRoles: ["admin", "manager"],
		subItems: [
			// Admin can message everyone
			{
				name: "Send to Users",
				path: "/dashboard/messages/to-users",
				pro: false,
				requiredRoles: ["admin"],
			},
			{
				name: "Send to Managers",
				path: "/dashboard/messages/to-managers",
				pro: false,
				requiredRoles: ["admin"],
			},
			{
				name: "Broadcast Message",
				path: "/dashboard/messages/broadcast",
				pro: false,
				requiredRoles: ["admin"],
			},
			// Manager can only message their team
			{
				name: "Team Messages",
				path: "/dashboard/messages/team",
				pro: false,
				requiredRoles: ["manager"],
			},
		],
	},
	// INSTALLATIONS (Existing functionality)
	{
		name: "Installations",
		icon: <PlugInIcon />,
		path: "/dashboard/installations",
	},
	// SETTINGS (Admin and Manager access)
	{
		name: "Settings",
		icon: <DocsIcon />,
		requiredRoles: ["admin", "manager"],
		subItems: [
			{
				name: "System Settings",
				path: "/dashboard/settings/system",
				pro: false,
				requiredRoles: ["admin"],
			},
			{
				name: "Profile Settings",
				path: "/dashboard/settings/profile",
				pro: false,
				requiredRoles: ["admin", "manager"],
			},
			{
				name: "Permissions",
				path: "/dashboard/settings/permissions",
				pro: false,
				requiredRoles: ["admin"],
			},
		],
	},
	// ADMIN ONLY - User Management
	{
		icon: <UserCircleIcon />,
		name: "User Management",
		requiredRoles: ["admin"],
		subItems: [
			{ name: "All Users", path: "/dashboard/users", pro: false, requiredRoles: ["admin"] },
			{
				name: "Create User",
				path: "/dashboard/users/create",
				pro: false,
				requiredRoles: ["admin"],
			},
			{ name: "User Roles", path: "/dashboard/users/roles", pro: false, requiredRoles: ["admin"] },
		],
	},
];
const othersItems: NavItem[] = [
	{
		icon: <PieChartIcon />,
		name: "Support",
		subItems: [
			{ name: "Help Center", path: "/dashboard/help", pro: false },
			{ name: "Live Chat", path: "/dashboard/chat", pro: false },
			{ name: "Contact Support", path: "/dashboard/contact", pro: false },
			{ name: "System Status", path: "/dashboard/status", pro: false, requiredRoles: ["admin"] },
		],
	},
	{
		icon: <BoxCubeIcon />,
		name: "Development",
		requiredRoles: ["admin"],
		subItems: [
			{ name: "Auth Demo", path: "/dashboard/auth-demo", pro: false, requiredRoles: ["admin"] },
			{ name: "Test Pages", path: "/dashboard/test", pro: false, requiredRoles: ["admin"] },
		],
	},
];

const AppSidebar: React.FC = () => {
	const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
	const { hasRole, isLoading, user } = useAuth();
	const location = useLocation();

	const [openSubmenu, setOpenSubmenu] = useState<{
		type: "main" | "others";
		index: number;
	} | null>(null);
	const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
	const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// Filter menu items based on user role
	const filterItemsByRole = (items: NavItem[]): NavItem[] => {
		// If user is not loaded yet, show all items to prevent layout shifts
		if (isLoading || !user) {
			return items;
		}

		return items
			.filter((item) => {
				// If no role requirements, show to everyone
				if (!item.requiredRoles) return true;

				// Check if user has required role
				return hasRole(item.requiredRoles);
			})
			.map((item) => ({
				...item,
				subItems: item.subItems?.filter((subItem) => {
					// If no role requirements, show to everyone
					if (!subItem.requiredRoles) return true;

					// Check if user has required role
					return hasRole(subItem.requiredRoles);
				}),
			}));
	};

	const filteredNavItems = useMemo(() => filterItemsByRole(navItems), [user, isLoading]);
	const filteredOthersItems = useMemo(() => filterItemsByRole(othersItems), [user, isLoading]);

	// const isActive = (path: string) => location.pathname === path;
	const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

	useEffect(() => {
		let submenuMatched = false;
		["main", "others"].forEach((menuType) => {
			const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
			items.forEach((nav, index) => {
				if (nav.subItems) {
					nav.subItems.forEach((subItem) => {
						if (isActive(subItem.path)) {
							setOpenSubmenu({
								type: menuType as "main" | "others",
								index,
							});
							submenuMatched = true;
						}
					});
				}
			});
		});

		if (!submenuMatched) {
			setOpenSubmenu(null);
		}
	}, [location, isActive, filteredNavItems, filteredOthersItems]);

	useEffect(() => {
		if (openSubmenu !== null) {
			const key = `${openSubmenu.type}-${openSubmenu.index}`;
			if (subMenuRefs.current[key]) {
				setSubMenuHeight((prevHeights) => ({
					...prevHeights,
					[key]: subMenuRefs.current[key]?.scrollHeight || 0,
				}));
			}
		}
	}, [openSubmenu]);

	const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
		setOpenSubmenu((prevOpenSubmenu) => {
			if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
				return null;
			}
			return { type: menuType, index };
		});
	};

	const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
		<ul className='flex flex-col gap-4'>
			{items.map((nav, index) => (
				<li key={nav.name}>
					{nav.subItems ? (
						<button
							onClick={() => handleSubmenuToggle(index, menuType)}
							className={`menu-item group ${
								openSubmenu?.type === menuType && openSubmenu?.index === index
									? "menu-item-active"
									: "menu-item-inactive"
							} cursor-pointer ${
								!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
							}`}>
							<span
								className={`menu-item-icon-size  ${
									openSubmenu?.type === menuType && openSubmenu?.index === index
										? "menu-item-icon-active"
										: "menu-item-icon-inactive"
								}`}>
								{nav.icon}
							</span>
							{(isExpanded || isHovered || isMobileOpen) && (
								<span className='menu-item-text'>{nav.name}</span>
							)}
							{(isExpanded || isHovered || isMobileOpen) && (
								<ChevronDownIcon
									className={`ml-auto w-5 h-5 transition-transform duration-200 ${
										openSubmenu?.type === menuType && openSubmenu?.index === index
											? "rotate-180 text-brand-500"
											: ""
									}`}
								/>
							)}
						</button>
					) : (
						nav.path && (
							<Link
								to={nav.path}
								className={`menu-item group ${
									isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
								}`}>
								<span
									className={`menu-item-icon-size ${
										isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
									}`}>
									{nav.icon}
								</span>
								{(isExpanded || isHovered || isMobileOpen) && (
									<span className='menu-item-text'>{nav.name}</span>
								)}
							</Link>
						)
					)}
					{nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
						<div
							ref={(el) => {
								subMenuRefs.current[`${menuType}-${index}`] = el;
							}}
							className='overflow-hidden transition-all duration-300'
							style={{
								height:
									openSubmenu?.type === menuType && openSubmenu?.index === index
										? `${subMenuHeight[`${menuType}-${index}`]}px`
										: "0px",
							}}>
							<ul className='mt-2 space-y-1 ml-9'>
								{nav.subItems.map((subItem) => (
									<li key={subItem.name}>
										<Link
											to={subItem.path}
											className={`menu-dropdown-item ${
												isActive(subItem.path)
													? "menu-dropdown-item-active"
													: "menu-dropdown-item-inactive"
											}`}>
											{subItem.name}
											<span className='flex items-center gap-1 ml-auto'>
												{subItem.new && (
													<span
														className={`ml-auto ${
															isActive(subItem.path)
																? "menu-dropdown-badge-active"
																: "menu-dropdown-badge-inactive"
														} menu-dropdown-badge`}>
														new
													</span>
												)}
												{subItem.pro && (
													<span
														className={`ml-auto ${
															isActive(subItem.path)
																? "menu-dropdown-badge-active"
																: "menu-dropdown-badge-inactive"
														} menu-dropdown-badge`}>
														pro
													</span>
												)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</li>
			))}
		</ul>
	);

	return (
		<aside
			className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
			onMouseEnter={() => !isExpanded && setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}>
			<div
				className={`py-8 flex ${
					!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
				}`}>
				<Link to='/'>
					{isExpanded || isHovered || isMobileOpen ? (
						<>
							<img
								className='dark:hidden'
								src='/images/logo/logo-r-b.png'
								alt='Logo'
								width={250}
								height={40}
							/>
							<img
								className='hidden dark:block'
								src='/images/logo/logo-r-w.png'
								alt='Logo'
								width={250}
								height={40}
							/>
						</>
					) : (
						<>
							<img
								className='dark:hidden'
								src='/images/logo/logo-s-b.png'
								alt='Logo'
								width={32}
								height={32}
							/>
							<img
								className='hidden dark:block'
								src='/images/logo/logo-s-w.png'
								alt='Logo'
								width={32}
								height={32}
							/>
						</>
					)}
				</Link>
			</div>
			<div className='flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar'>
				<nav className='mb-6'>
					<div className='flex flex-col gap-4'>
						<div>
							<h2
								className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
									!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
								}`}>
								{isExpanded || isHovered || isMobileOpen ? (
									"Menu"
								) : (
									<HorizontaLDots className='size-6' />
								)}
							</h2>
							{renderMenuItems(filteredNavItems, "main")}
						</div>
						<div className=''>
							<h2
								className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
									!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
								}`}>
								{isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots />}
							</h2>
							{renderMenuItems(filteredOthersItems, "others")}
						</div>
					</div>
				</nav>
				{isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
			</div>
		</aside>
	);
};

export default AppSidebar;
