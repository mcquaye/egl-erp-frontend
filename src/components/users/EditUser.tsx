import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../redux/api/authApi";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import Label from "../form/Label";
import Input from "../form/input/InputField";

interface EditUserFormData {
	name: string;
	email: string;
	role: "admin" | "manager" | "user";
	phoneNumber: string;
}

export default function EditUser() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const userId = parseInt(id || "0");

	const { data: user, isLoading: isLoadingUser, error: userError } = useGetUserByIdQuery(userId);
	const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

	const [formData, setFormData] = useState<EditUserFormData>({
		name: "",
		email: "",
		role: "user",
		phoneNumber: "",
	});

	const [errors, setErrors] = useState<Partial<EditUserFormData>>({});

	// Update form data when user data is loaded
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name,
				email: user.email,
				role: user.role as "admin" | "manager" | "user",
				phoneNumber: user.phoneNumber || "",
			});
		}
	}, [user]);

	const handleInputChange = (field: keyof EditUserFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<EditUserFormData> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
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
			await updateUser({
				id: userId,
				data: {
					name: formData.name.trim(),
					email: formData.email.trim().toLowerCase(),
					role: formData.role,
					phoneNumber: formData.phoneNumber.trim() || null,
				},
			}).unwrap();

			toast.success("User updated successfully!");
			navigate("/dashboard/users");
		} catch (error: any) {
			console.error("Update user error:", error);
			const errorMessage = error?.data?.error || "Failed to update user. Please try again.";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		navigate("/dashboard/users");
	};

	if (isLoadingUser) {
		return (
			<>
				<PageMeta title='Edit User' description='Edit user information' />
				<PageBreadcrumb pageTitle='Edit User' />
				<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
					<div className='flex items-center justify-center h-64'>
						<div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
						<span className='ml-2 text-gray-600 dark:text-gray-400'>Loading user...</span>
					</div>
				</div>
			</>
		);
	}

	if (userError || !user) {
		return (
			<>
				<PageMeta title='Edit User' description='Edit user information' />
				<PageBreadcrumb pageTitle='Edit User' />
				<div className='rounded-2xl border border-red-200 bg-white p-5 dark:border-red-800 dark:bg-white/[0.03] lg:p-6'>
					<div className='text-center text-red-600 dark:text-red-400'>
						<h3 className='text-lg font-semibold mb-2'>User not found</h3>
						<p>
							The user you're trying to edit doesn't exist or you don't have permission to access
							it.
						</p>
						<button
							onClick={() => navigate("/dashboard/users")}
							className='mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600'>
							Back to Users
						</button>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<PageMeta title='Edit User' description='Edit user information' />
			<PageBreadcrumb pageTitle='Edit User' />

			<div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6'>
				<div className='flex items-center justify-between mb-6'>
					<h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
						Edit User: {user.name}
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
								disabled={isUpdating}
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
								disabled={isUpdating}
								className={errors.email ? "border-red-500" : ""}
							/>
							{errors.email && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.email}</p>
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
								disabled={isUpdating}
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
								disabled={isUpdating}
								className={errors.phoneNumber ? "border-red-500" : ""}
							/>
							{errors.phoneNumber && (
								<p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.phoneNumber}</p>
							)}
						</div>
					</div>

					{/* User Info Display */}
					<div className='p-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800/50 dark:border-gray-700'>
						<h4 className='font-medium text-gray-900 dark:text-gray-100 mb-2'>User Information:</h4>
						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>User ID:</span>
								<span className='ml-2 font-medium'>{user.id}</span>
							</div>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>Created:</span>
								<span className='ml-2 font-medium'>
									{new Date(user.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div>
								<span className='text-gray-500 dark:text-gray-400'>Last Updated:</span>
								<span className='ml-2 font-medium'>
									{new Date(user.updatedAt).toLocaleDateString()}
								</span>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
						<button
							type='button'
							onClick={handleCancel}
							disabled={isUpdating}
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isUpdating}
							className='px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
							{isUpdating ? (
								<>
									<div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block'></div>
									Updating User...
								</>
							) : (
								"Update User"
							)}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
