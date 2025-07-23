import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";

export default function ForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		// Add your password reset logic here
		console.log("Password reset requested for:", email);
		setIsSubmitted(true);
	};

	return (
		<div className='flex flex-col flex-1'>
			<div className='w-full max-w-md pt-10 mx-auto'></div>
			<div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
				<div>
					<div className='mb-5 sm:mb-8'>
						<Link
							to='/signin'
							className='flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400'>
							<ChevronLeftIcon className='w-4 h-4' />
							Back to sign in
						</Link>

						<h1 className='mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md'>
							Forgot Password?
						</h1>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							{isSubmitted
								? "We've sent a password reset link to your email."
								: "Enter your email to receive a password reset link."}
						</p>
					</div>

					{!isSubmitted ? (
						<form onSubmit={handleSubmit}>
							<div className='space-y-6'>
								<div>
									<Label>
										Email <span className='text-error-500'>*</span>
									</Label>
									<Input
										type='email'
										placeholder='your.email@example.com'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>

								<div>
									<a
										type='submit'
										className='w-full p-3 font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 text-theme-sm'>
										Send Reset Link
									</a>
								</div>
							</div>
						</form>
					) : (
						<div className='p-4 mt-6 text-center border rounded-lg border-brand-100 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/20'>
							<p className='text-brand-600 dark:text-brand-400'>
								Check your email for the password reset link. If you don't see it, please check your
								spam folder.
							</p>
							<a
								onClick={() => setIsSubmitted(false)}
								className='w-full p-3 mt-4 font-medium rounded-lg text-brand-600 bg-brand-100 hover:bg-brand-200 text-theme-sm dark:text-brand-400 dark:bg-brand-900/30 dark:hover:bg-brand-900/40'>
								Resend Email
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
