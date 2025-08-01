import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreateUserMutation } from "../../redux/api/authApi";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface CreateUserFormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	role: "admin" | "manager" | "user";
	phoneNumber: string;
}

export default function CreateUser() {
	const navigate = useNavigate();
	const [registerUser, { isLoading }] = useCreateUserMutation();

	const [formData, setFormData] = useState<CreateUserFormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "user",
		phoneNumber: "",
	});

	const [errors, setErrors] = useState<Partial<CreateUserFormData>>({});

	const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<CreateUserFormData> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters long";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
			newErrors.phoneNumber = "Please enter a valid phone number";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			await registerUser({
				name: formData.name.trim(),
				email: formData.email.trim().toLowerCase(),
				password: formData.password,
				role: formData.role,
				phoneNumber: formData.phoneNumber.trim() || null,
			}).unwrap();

			toast.success("User created successfully!");
			navigate("/dashboard/users");
		} catch (error: any) {
			console.error("Create user error:", error);
			const errorMessage = error?.data?.error || "Failed to create user. Please try again.";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		navigate("/dashboard/users");
	};

	return (
		<>
			<PageMeta title='Create New User' description='Add a new user to the system' />
			<PageBreadcrumb pageTitle='Create User' />

			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
						Create New User
					</h3>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Name Field */}
						<div>
							<Label>
								Full Name <span className='text-red-500'>*</span>
							</Label>
							<Input
								type='text'
								placeholder='Enter full name'
								value={formData.name}
								onChange={(e) => handleInputChange("name", e.target.value)}
								disabled={isLoading}
								className={errors.name ? "border-red-500" : ""}
							/>
							{errors.name && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.name}</p>
							)}
						</div>

						{/* Email Field */}
						<div>
							<Label>
								Email Address <span className='text-red-500'>*</span>
							</Label>
							<Input
								type='email'
								placeholder='Enter email address'
								value={formData.email}
								onChange={(e) => handleInputChange("email", e.target.value)}
								disabled={isLoading}
								className={errors.email ? "border-red-500" : ""}
							/>
							{errors.email && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.email}</p>
							)}
						</div>

						{/* Password Field */}
						<div>
							<Label>
								Password <span className='text-red-500'>*</span>
							</Label>
							<Input
								type='password'
								placeholder='Enter password'
								value={formData.password}
								onChange={(e) => handleInputChange("password", e.target.value)}
								disabled={isLoading}
								className={errors.password ? "border-red-500" : ""}
							/>
							{errors.password && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.password}</p>
							)}
						</div>

						{/* Confirm Password Field */}
						<div>
							<Label>
								Confirm Password <span className='text-red-500'>*</span>
							</Label>
							<Input
								type='password'
								placeholder='Confirm password'
								value={formData.confirmPassword}
								onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
								disabled={isLoading}
								className={errors.confirmPassword ? "border-red-500" : ""}
							/>
							{errors.confirmPassword && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
									{errors.confirmPassword}
								</p>
							)}
						</div>

						{/* Role Field */}
						<div>
							<Label>
								User Role <span className='text-red-500'>*</span>
							</Label>
							<select
								value={formData.role}
								onChange={(e) =>
									handleInputChange("role", e.target.value as "admin" | "manager" | "user")
								}
								disabled={isLoading}
								className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'>
								<option value='user'>User</option>
								<option value='manager'>Manager</option>
								<option value='admin'>Administrator</option>
							</select>
						</div>

						{/* Phone Number Field */}
						<div>
							<Label>Phone Number</Label>
							<Input
								type='tel'
								placeholder='Enter phone number (optional)'
								value={formData.phoneNumber}
								onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
								disabled={isLoading}
								className={errors.phoneNumber ? "border-red-500" : ""}
							/>
							{errors.phoneNumber && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.phoneNumber}</p>
							)}
						</div>
					</div>

					{/* Role Description */}
					<div className='p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800'>
						<h4 className='font-medium text-blue-900 dark:text-blue-100 mb-2'>Role Permissions:</h4>
						<ul className='text-sm text-blue-800 dark:text-blue-200 space-y-1'>
							{formData.role === "admin" && (
								<>
									<li>• Full system access and user management</li>
									<li>• Can create, edit, delete, and assign job cards</li>
									<li>• Access to all reports and system settings</li>
								</>
							)}
							{formData.role === "manager" && (
								<>
									<li>• Can create and view own job cards</li>
									<li>• Access to team reports and management</li>
									<li>• Limited user management permissions</li>
								</>
							)}
							{formData.role === "user" && (
								<>
									<li>• View-only access to job cards</li>
									<li>• Can view own reports</li>
									<li>• Basic system access</li>
								</>
							)}
						</ul>
					</div>

					{/* Action Buttons */}
					<div className='flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
						<button
							type='button'
							onClick={handleCancel}
							disabled={isLoading}
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isLoading}
							className='px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isLoading ? (
								<>
									<div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block'></div>
									Creating User...
								</>
							) : (
								"Create User"
							)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
