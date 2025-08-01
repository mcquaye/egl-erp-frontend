import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import SignIn from "./pages/AuthPages/SignIn";
import ResetPassword from "./pages/AuthPages/ForgotPasswordPage";
import NotFound from "./pages/Errors/NotFound";
import AccessDenied from "./pages/Errors/AccessDenied";
import UserProfiles from "./pages/UserProfiles";
import Installations from "./pages/Installations/page";
import Blank from "./pages/Blank";
import AuthDemo from "./pages/AuthDemo";
import AppLayout from "./layout/DashboardLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import RoleGuard from "./components/auth/RoleGuard";
import ScanPage from "./pages/Scan/page";
import CreateJobCard from "./pages/JobCards/CreateJobCard";
import AllJobCards from "./pages/JobCards/AllJobCards";
import MyJobCards from "./pages/JobCards/MyJobCards";
import ViewJobCard from "./pages/JobCards/ViewJobCard";
import AssignJobCard from "./pages/JobCards/AssignJobCard";
import EditJobCard from "./pages/JobCards/EditJobCard";
import UsersList from "./components/users/UsersList";
import CreateUser from "./components/users/CreateUser";
import EditUser from "./components/users/EditUser";
import ChangePassword from "./components/users/ChangePassword";

export default function App() {
	return (
		<AuthProvider>
			<Router>
				<ScrollToTop />
				<Routes>
					{/* Public Auth Pages */}
					<Route
						path='/'
						element={
							<PublicRoute>
								<SignIn />
							</PublicRoute>
						}
					/>
					<Route
						path='/signin'
						element={
							<PublicRoute>
								<SignIn />
							</PublicRoute>
						}
					/>
					<Route
						path='/reset-password'
						element={
							<PublicRoute>
								<ResetPassword />
							</PublicRoute>
						}
					/>

					{/* Protected Dashboard Layout */}
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<AppLayout />
							</ProtectedRoute>
						}>
						<Route index element={<Home />} />

						{/* User Management - Admin Only */}
						<Route
							path='users'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<UsersList />
								</RoleGuard>
							}
						/>
						<Route
							path='users/create'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<CreateUser />
								</RoleGuard>
							}
						/>
						<Route
							path='users/edit/:id'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<EditUser />
								</RoleGuard>
							}
						/>
						<Route
							path='change-password'
							element={
								<RoleGuard allowedRoles={["admin", "manager", "user"]} fallback={<AccessDenied />}>
									<ChangePassword />
								</RoleGuard>
							}
						/>
						<Route
							path='users/roles'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Job Cards - Role-based access */}
						<Route
							path='job-cards'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<AllJobCards />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/all'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<AllJobCards />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/create'
							element={
								<RoleGuard allowedRoles={["admin", "manager"]} fallback={<AccessDenied />}>
									<CreateJobCard />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/assign/:id'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<AssignJobCard />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/edit/:id'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<EditJobCard />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/my-jobs'
							element={
								<RoleGuard allowedRoles={["manager"]} fallback={<AccessDenied />}>
									<MyJobCards />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/view'
							element={
								<RoleGuard allowedRoles={["admin", "manager", "user"]} fallback={<AccessDenied />}>
									<ViewJobCard />
								</RoleGuard>
							}
						/>
						<Route
							path='job-cards/view/:id'
							element={
								<RoleGuard allowedRoles={["admin", "manager", "user"]} fallback={<AccessDenied />}>
									<ViewJobCard />
								</RoleGuard>
							}
						/>

						{/* Scan - Admin and Manager access */}
						<Route
							path='scan/qr-code'
							element={
								<RoleGuard allowedRoles={["admin", "manager"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='scan/manual'
							element={
								<RoleGuard allowedRoles={["admin", "manager"]} fallback={<AccessDenied />}>
									<ScanPage />
								</RoleGuard>
							}
						/>
						<Route
							path='scan/batch'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Reports - Role-based access */}
						<Route path='reports/my-reports' element={<Blank />} />
						<Route
							path='reports/job-reports'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='reports/all-reports'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='reports/team-reports'
							element={
								<RoleGuard allowedRoles={["manager"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Downloads - Role-based access */}
						<Route
							path='downloads/job-cards'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='downloads/my-jobs'
							element={
								<RoleGuard allowedRoles={["manager"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='downloads/viewed-card'
							element={
								<RoleGuard allowedRoles={["user"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Messages - Admin and Manager */}
						<Route
							path='messages/to-users'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='messages/to-managers'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='messages/broadcast'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='messages/team'
							element={
								<RoleGuard allowedRoles={["manager"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Settings - Admin and Manager */}
						<Route
							path='settings/system'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route
							path='settings/profile'
							element={
								<RoleGuard allowedRoles={["admin", "manager"]} fallback={<AccessDenied />}>
									<UserProfiles />
								</RoleGuard>
							}
						/>
						<Route
							path='settings/permissions'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Support */}
						<Route path='help' element={<Blank />} />
						<Route path='chat' element={<Blank />} />
						<Route path='contact' element={<Blank />} />
						<Route
							path='status'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Development - Admin Only */}
						<Route
							path='auth-demo'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<AuthDemo />
								</RoleGuard>
							}
						/>
						<Route
							path='test'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>

						{/* Legacy routes */}
						<Route path='installations' element={<Installations />} />
						<Route path='profile' element={<UserProfiles />} />
					</Route>

					<Route
						element={
							<ProtectedRoute>
								<AppLayout />
							</ProtectedRoute>
						}>
						<Route path='/profile' element={<UserProfiles />} />
						<Route path='/chat' element={<Blank />} />
						<Route path='/contact' element={<Blank />} />
					</Route>

					{/* Error Pages */}
					<Route path='/access-denied' element={<AccessDenied />} />
					<Route path='/error-404' element={<NotFound />} />
					<Route path='*' element={<NotFound />} />
				</Routes>
			</Router>

			{/* Toaster for notifications */}
			<Toaster richColors position='top-right' expand={true} />
		</AuthProvider>
	);
}
