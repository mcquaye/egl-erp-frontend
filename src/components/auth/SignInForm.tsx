import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const { login, isLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	// Get the intended destination or default to dashboard
	const from = location.state?.from?.pathname || "/dashboard";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		const result = await login(email, password);

		if (result.success) {
			navigate(from, { replace: true });
		} else {
			setError(result.error || "Login failed");
		}
	};

	return (
		<div className='flex flex-col flex-1'>
			<div className='w-full max-w-md pt-10 mx-auto'></div>
			<div className='flex flex-col justify-center flex-1 w-full max-w-md mx-auto'>
				<div>
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
										placeholder='info@gmail.com'
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={isLoading}
									/>
								</div>
								<div>
									<Label>
										Password <span className='text-error-500'>*</span>{" "}
									</Label>
									<div className='relative'>
										<Input
											type={showPassword ? "text" : "password"}
											placeholder='Enter your password'
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											disabled={isLoading}
										/>
										<span
											onClick={() => setShowPassword(!showPassword)}
											className='absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2'>
											{showPassword ? (
												<EyeIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
											) : (
												<EyeCloseIcon className='fill-gray-500 dark:fill-gray-400 size-5' />
											)}
										</span>
									</div>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-3'>
										<Checkbox checked={isChecked} onChange={setIsChecked} />
										<span className='block font-normal text-gray-700 text-theme-sm dark:text-gray-400'>
											Keep me logged in
										</span>
									</div>
									<Link
										to='/reset-password'
										className='text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400'>
										Forgot password?
									</Link>
								</div>
								<div>
									<button
										type='submit'
										disabled={isLoading}
										className='flex items-center justify-center w-full p-3 font-medium text-white rounded-lg bg-blue-500 text-theme-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'>
										{isLoading ? (
											<>
												<div className='w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
												Signing In...
											</>
										) : (
											"Sign In"
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
