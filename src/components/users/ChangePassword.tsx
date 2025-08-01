import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useChangePasswordMutation } from "../../redux/api/authApi";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface ChangePasswordFormData {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export default function ChangePassword() {
	const navigate = useNavigate();
	const [changePassword, { isLoading }] = useChangePasswordMutation();

	const [formData, setFormData] = useState<ChangePasswordFormData>({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const handleInputChange = (field: keyof ChangePasswordFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<ChangePasswordFormData> = {};

		if (!formData.currentPassword) {
			newErrors.currentPassword = "Current password is required";
		}

		if (!formData.newPassword) {
			newErrors.newPassword = "New password is required";
		} else if (formData.newPassword.length < 6) {
			newErrors.newPassword = "New password must be at least 6 characters long";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your new password";
		} else if (formData.newPassword !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (
			formData.currentPassword &&
			formData.newPassword &&
			formData.currentPassword === formData.newPassword
		) {
			newErrors.newPassword = "New password must be different from current password";
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
			await changePassword({
				currentPassword: formData.currentPassword,
				newPassword: formData.newPassword,
			}).unwrap();

			toast.success("Password changed successfully!");
			navigate(-1); // Go back to previous page
		} catch (error: any) {
			console.error("Change password error:", error);
			const errorMessage = error?.data?.error || "Failed to change password. Please try again.";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	return (
		<>
			<PageMeta title='Change Password' description='Change your account password' />
			<PageBreadcrumb pageTitle='Change Password' />

			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
						Change Password
					</h3>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6 max-w-md'>
					{/* Current Password */}
					<div>
						<Label>
							Current Password <span className='text-red-500'>*</span>
						</Label>
						<div className='relative'>
							<Input
								type={showPasswords.current ? "text" : "password"}
								placeholder='Enter your current password'
								value={formData.currentPassword}
								onChange={(e) => handleInputChange("currentPassword", e.target.value)}
								disabled={isLoading}
								className={errors.currentPassword ? "border-red-500" : ""}
							/>
							<button
								type='button'
								onClick={() => togglePasswordVisibility("current")}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
								{showPasswords.current ? (
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'>
										<path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
										<line x1='1' y1='1' x2='23' y2='23' />
									</svg>
								) : (
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'>
										<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
										<circle cx='12' cy='12' r='3' />
									</svg>
								)}
							</button>
						</div>
						{errors.currentPassword && (
							<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
								{errors.currentPassword}
							</p>
						)}
					</div>

					{/* New Password */}
					<div>
						<Label>
							New Password <span className='text-red-500'>*</span>
						</Label>
						<div className='relative'>
							<Input
								type={showPasswords.new ? "text" : "password"}
								placeholder='Enter your new password'
								value={formData.newPassword}
								onChange={(e) => handleInputChange("newPassword", e.target.value)}
								disabled={isLoading}
								className={errors.newPassword ? "border-red-500" : ""}
							/>
							<button
								type='button'
								onClick={() => togglePasswordVisibility("new")}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
								{showPasswords.new ? (
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'>
										<path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
										<line x1='1' y1='1' x2='23' y2='23' />
									</svg>
								) : (
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'>
										<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
										<circle cx='12' cy='12' r='3' />
									</svg>
								)}
							</button>
						</div>
						{errors.newPassword && (
							<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.newPassword}</p>
						)}
						<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
							Password must be at least 6 characters long
						</p>
					</div>

					{/* Confirm Password */}
					<div>
						<Label>
							Confirm New Password <span className='text-red-500'>*</span>
						</Label>
						<div className='relative'>
							<Input
								type={showPasswords.confirm ? "text" : "password"}
								placeholder='Confirm your new password'
								value={formData.confirmPassword}
								onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
								disabled={isLoading}
								className={errors.confirmPassword ? "border-red-500" : ""}
							/>
							<button
								type='button'
								onClick={() => togglePasswordVisibility("confirm")}
								className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
								{showPasswords.confirm ? (
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'>
										<path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
										<line x1='1' y1='1' x2='23' y2='23' />
									</svg>
								) : (
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'>
										<path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
										<circle cx='12' cy='12' r='3' />
									</svg>
								)}
							</button>
						</div>
						{errors.confirmPassword && (
							<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
								{errors.confirmPassword}
							</p>
						)}
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
									Changing Password...
								</>
							) : (
								"Change Password"
							)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
