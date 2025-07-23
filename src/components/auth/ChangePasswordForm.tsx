import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function ChangePasswordForm() {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const { changePassword, isLoading } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!currentPassword || !newPassword || !confirmPassword) {
			setError("Please fill in all fields");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("New passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setError("New password must be at least 6 characters long");
			return;
		}

		const result = await changePassword(currentPassword, newPassword);

		if (result.success) {
			// Reset form
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} else {
			setError(result.error || "Failed to change password");
		}
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
			<h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>Change Password</h3>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{error && (
					<div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'>
						{error}
					</div>
				)}

				<div>
					<Label>
						Current Password <span className='text-error-500'>*</span>
					</Label>
					<div className='relative'>
						<Input
							type={showPasswords.current ? "text" : "password"}
							placeholder='Enter current password'
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							disabled={isLoading}
						/>
						<button
							type='button'
							onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
							className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'>
							{showPasswords.current ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				<div>
					<Label>
						New Password <span className='text-error-500'>*</span>
					</Label>
					<div className='relative'>
						<Input
							type={showPasswords.new ? "text" : "password"}
							placeholder='Enter new password'
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							disabled={isLoading}
						/>
						<button
							type='button'
							onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
							className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'>
							{showPasswords.new ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				<div>
					<Label>
						Confirm New Password <span className='text-error-500'>*</span>
					</Label>
					<div className='relative'>
						<Input
							type={showPasswords.confirm ? "text" : "password"}
							placeholder='Confirm new password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							disabled={isLoading}
						/>
						<button
							type='button'
							onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
							className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'>
							{showPasswords.confirm ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				<div className='pt-4'>
					<button
						type='submit'
						disabled={isLoading}
						className='flex items-center justify-center px-4 py-2 font-medium text-white rounded-lg bg-blue-500 text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'>
						{isLoading ? (
							<>
								<div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
								Changing Password...
							</>
						) : (
							"Change Password"
						)}
					</button>
				</div>
			</form>
		</div>
	);
}
