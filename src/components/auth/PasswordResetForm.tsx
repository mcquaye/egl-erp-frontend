import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";

export default function PasswordResetForm() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { resetPassword, isLoading } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email) {
			setError("Please enter your email address");
			return;
		}

		const result = await resetPassword(email);

		if (result.success) {
			setIsSubmitted(true);
		} else {
			setError(result.error || "Failed to send reset email");
		}
	};

	if (isSubmitted) {
		return (
			<div className='flex flex-col flex-1'>
				<div className='w-full max-w-md pt-10 mx-auto'></div>
				<div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
					<div>
						<div className='mb-5 sm:mb-8'>
							<h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
								Check Your Email
							</h1>
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								We've sent a password reset link to {email}
							</p>
						</div>
						<div className='space-y-6'>
							<Link
								to='/signin'
								className='flex items-center justify-center w-full p-3 font-medium text-white rounded-lg bg-blue-500 text-theme-sm hover:bg-blue-600'>
								Back to Sign In
							</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col flex-1'>
			<div className='w-full max-w-md pt-10 mx-auto'>
				<Link
					to='/signin'
					className='inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
					<ChevronLeftIcon className='w-4 h-4' />
					Back to sign in
				</Link>
			</div>
			<div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
				<div>
					<div className='mb-5 sm:mb-8'>
						<h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
							Reset Password
						</h1>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Enter your email address and we'll send you a link to reset your password.
						</p>
					</div>
					<div>
						<form onSubmit={handleSubmit}>
							<div className='space-y-6'>
								{error && (
									<div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'>
										{error}
									</div>
								)}
								<div>
									<Label>
										Email <span className='text-error-500'>*</span>{" "}
									</Label>
									<Input
										placeholder='Enter your email address'
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={isLoading}
									/>
								</div>
								<div>
									<button
										type='submit'
										disabled={isLoading}
										className='flex items-center justify-center w-full p-3 font-medium text-white rounded-lg bg-blue-500 text-theme-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'>
										{isLoading ? (
											<>
												<div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
												Sending Reset Link...
											</>
										) : (
											"Send Reset Link"
										)}
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
