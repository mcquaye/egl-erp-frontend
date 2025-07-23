import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ForgotPasswordPage";
import NotFound from "./pages/Errors/NotFound";
import AccessDenied from "./pages/Errors/AccessDenied";
import UserProfiles from "./pages/UserProfiles";
import Installations from "./pages/Installations/page";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AuthDemo from "./pages/AuthDemo";
import AppLayout from "./layout/DashboardLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import RoleGuard from "./components/auth/RoleGuard";

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
						<Route path='profile' element={<UserProfiles />} />
						<Route
							path='settings'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<UserProfiles />
								</RoleGuard>
							}
						/>
						<Route path='installations' element={<Installations />} />
						<Route path='my-reports' element={<Blank />} />
						<Route
							path='all-reports'
							element={
								<RoleGuard allowedRoles={["admin"]} fallback={<AccessDenied />}>
									<Blank />
								</RoleGuard>
							}
						/>
						<Route path='create' element={<Blank />} />
						<Route path='scan' element={<Blank />} />
						<Route path='jobs' element={<Blank />} />
						<Route path='auth-demo' element={<AuthDemo />} />
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
