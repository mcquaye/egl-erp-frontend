import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useGetProfileQuery, useUpdateProfileMutation } from "../../redux/api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function UserInfoCard() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: profileData, isLoading, error } = useGetProfileQuery();
	const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
	const { isOpen, openModal, closeModal } = useModal();

	// Use profile data from API if available, fallback to auth context
	const currentUser = profileData || user;

	// Hide Edit User Profile From Base Users
	const isBaseUser = currentUser?.role === "user";

	// Form state
	const [formData, setFormData] = useState({
		name: currentUser?.name || "",
		email: currentUser?.email || "",
		phoneNumber: currentUser?.phoneNumber || "",
		companyName: currentUser?.companyName || "",
		companyPhoneNumber: currentUser?.companyPhoneNumber || "",
	});

	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Update form data when user data changes
	React.useEffect(() => {
		if (currentUser) {
			setFormData({
				name: currentUser.name || "",
				email: currentUser.email || "",
				phoneNumber: currentUser.phoneNumber || "",
				companyName: currentUser.companyName || "",
				companyPhoneNumber: currentUser.companyPhoneNumber || "",
			});
		}
	}, [currentUser]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (formErrors[field]) {
			setFormErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		if (!formData.name.trim()) {
			errors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			errors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = "Please enter a valid email address";
		}

		if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
			errors.phoneNumber = "Please enter a valid phone number";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			await updateProfile({
				name: formData.name.trim(),
				email: formData.email.trim().toLowerCase(),
				phoneNumber: formData.phoneNumber.trim() || null,
			}).unwrap();

			toast.success("Profile updated successfully!");
			closeModal();
		} catch (error: any) {
			console.error("Update profile error:", error);
			const errorMessage = error?.data?.error || "Failed to update profile. Please try again.";
			toast.error(errorMessage);
		}
	};

	if (isLoading) {
		return (
			<div className='p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6'>
				<div className='flex items-center justify-center h-32'>
					<div className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
					<span className='ml-2 text-gray-600 dark:text-gray-400'>Loading profile...</span>
				</div>
			</div>
		);
	}

	if (error || !currentUser) {
		return (
			<div className='p-5 border border-red-200 rounded-2xl dark:border-red-800 lg:p-6'>
				<div className='text-center text-red-600 dark:text-red-400'>
					Failed to load profile information
				</div>
			</div>
		);
	}

	// Split the name into first and last name
	const nameParts = currentUser.name.split(" ");
	const firstName = nameParts[0] || "";
	const lastName = nameParts.slice(1).join(" ") || "";

	return (
		<div className='p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6'>
			<div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
				<div>
					<h4 className='text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6'>
						Personal Information
					</h4>

					<div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32'>
						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>
								First Name
							</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>{firstName}</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>
								Last Name
							</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{lastName || "N/A"}
							</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>
								Email address
							</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{currentUser.email}
							</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>Phone</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{currentUser.phoneNumber || "Not provided"}
							</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>
								Company Name
							</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{currentUser.companyName || "Not provided"}
							</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>
								Company Phone Number
							</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{currentUser.companyPhoneNumber || "Not provided"}
							</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>Role</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{currentUser.role === "admin"
									? "Administrator"
									: currentUser.role === "manager"
									? "Manager"
									: "User"}
							</p>
						</div>

						<div>
							<p className='mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400'>Status</p>
							<p className='text-sm font-medium text-gray-800 dark:text-white/90'>
								{currentUser.role === "admin"
									? "System Administrator"
									: currentUser.role === "manager"
									? "Team Manager"
									: "Team Member"}
							</p>
						</div>
					</div>
				</div>

				<div className='flex flex-col gap-3 w-full lg:w-auto lg:flex-row items-center'>
					{/* Info message for base users */}
					{isBaseUser && (
						<p className='mb-3 text-sm text-gray-500 dark:text-gray-400'>
							Contact your Manager / Admin to update your profile details.
						</p>
					)}

					{/* Hide Edit Profile Button for Base Users */}
					{!isBaseUser && (
						<button
							onClick={openModal}
							className='flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto'>
							<svg
								className='fill-current'
								width='18'
								height='18'
								viewBox='0 0 18 18'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'>
								<path
									fillRule='evenodd'
									clipRule='evenodd'
									d='M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z'
									fill=''
								/>
							</svg>
							Edit Profile
						</button>
					)}

					<button
						onClick={() => navigate("/dashboard/change-password")}
						className='flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-100 hover:text-blue-800 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 lg:inline-flex lg:w-auto'>
						<svg
							className='fill-current'
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								fillRule='evenodd'
								clipRule='evenodd'
								d='M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10H19C20.1046 10 21 10.8954 21 12V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V12C3 10.8954 3.89543 10 5 10H6ZM8 8V10H16V8C16 6.89543 15.1046 6 14 6H10C8.89543 6 8 6.89543 8 8ZM12 13C11.4477 13 11 13.4477 11 14V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V14C13 13.4477 12.5523 13 12 13Z'
								fill=''
							/>
						</svg>
						Change Password
					</button>
				</div>
			</div>

			<Modal isOpen={isOpen} onClose={closeModal} className='max-w-[700px] m-4'>
				<div className='no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11'>
					<div className='px-2 pr-14'>
						<h4 className='mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90'>
							Edit Personal Information
						</h4>
						<p className='mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7'>
							Update your details to keep your profile up-to-date.
						</p>
					</div>
					<form className='flex flex-col'>
						<div className='custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3'>
							<div className='mt-7'>
								<h5 className='mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6'>
									Personal Information
								</h5>

								<div className='grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2'>
									<div className='col-span-2'>
										<Label>
											Full Name <span className='text-red-500'>*</span>
										</Label>
										<Input
											type='text'
											value={formData.name}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleInputChange("name", e.target.value)
											}
											disabled={isUpdating}
											placeholder='Enter your full name'
										/>
										{formErrors.name && (
											<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
												{formErrors.name}
											</p>
										)}
									</div>

									<div className='col-span-2'>
										<Label>
											Email Address <span className='text-red-500'>*</span>
										</Label>
										<Input
											type='email'
											value={formData.email}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleInputChange("email", e.target.value)
											}
											disabled={isUpdating}
											placeholder='Enter your email address'
										/>
										{formErrors.email && (
											<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
												{formErrors.email}
											</p>
										)}
									</div>

									<div className='col-span-2'>
										<Label>Phone Number</Label>
										<Input
											type='tel'
											value={formData.phoneNumber}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleInputChange("phoneNumber", e.target.value)
											}
											disabled={isUpdating}
											placeholder='Enter your phone number (optional)'
										/>
										{formErrors.phoneNumber && (
											<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
												{formErrors.phoneNumber}
											</p>
										)}
									</div>

									<div className='col-span-2'>
										<Label>Company Name</Label>
										<Input
											type='text'
											value={formData.companyName}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleInputChange("companyName", e.target.value)
											}
											disabled={isUpdating}
											placeholder='Enter your company name (optional)'
										/>
										{formErrors.companyName && (
											<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
												{formErrors.companyName}
											</p>
										)}
									</div>

									<div className='col-span-2'>
										<Label>Company Phone Number</Label>
										<Input
											type='tel'
											value={formData.companyPhoneNumber}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												handleInputChange("companyPhoneNumber", e.target.value)
											}
											disabled={isUpdating}
											placeholder='Enter your company phone number (optional)'
										/>
										{formErrors.companyPhoneNumber && (
											<p className='mt-1 text-sm text-red-600 dark:text-red-400'>
												{formErrors.companyPhoneNumber}
											</p>
										)}
									</div>

									<div className='col-span-2'>
										<div className='p-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800/50 dark:border-gray-700'>
											<Label>Current Role</Label>
											<p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
												{currentUser?.role === "admin"
													? "System Administrator"
													: currentUser?.role === "manager"
													? "Team Manager"
													: "Team Member"}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
												Contact an administrator to change your role
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='flex items-center gap-3 px-2 mt-6 lg:justify-end'>
							<button
								type='button'
								onClick={closeModal}
								disabled={isUpdating}
								className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'>
								Cancel
							</button>
							<button
								type='button'
								onClick={handleSave}
								disabled={isUpdating}
								className='px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{isUpdating ? (
									<>
										<div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin inline-block'></div>
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</button>
						</div>
					</form>
				</div>
			</Modal>
		</div>
	);
}
