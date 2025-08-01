import { Modal } from "../modal";

interface AlertDialogProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
	buttonText?: string;
	type?: "success" | "error" | "warning" | "info";
}

export default function AlertDialog({
	isOpen,
	onClose,
	title,
	message,
	buttonText = "OK",
	type = "info",
}: AlertDialogProps) {
	const getTypeStyles = () => {
		switch (type) {
			case "success":
				return {
					icon: "✅",
					iconBg: "bg-green-100 dark:bg-green-900/20",
					iconColor: "text-green-600 dark:text-green-400",
					buttonBg: "bg-green-600 hover:bg-green-700",
					buttonText: "text-white",
				};
			case "error":
				return {
					icon: "❌",
					iconBg: "bg-red-100 dark:bg-red-900/20",
					iconColor: "text-red-600 dark:text-red-400",
					buttonBg: "bg-red-600 hover:bg-red-700",
					buttonText: "text-white",
				};
			case "warning":
				return {
					icon: "⚠️",
					iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
					iconColor: "text-yellow-600 dark:text-yellow-400",
					buttonBg: "bg-yellow-600 hover:bg-yellow-700",
					buttonText: "text-white",
				};
			default:
				return {
					icon: "ℹ️",
					iconBg: "bg-blue-100 dark:bg-blue-900/20",
					iconColor: "text-blue-600 dark:text-blue-400",
					buttonBg: "bg-blue-600 hover:bg-blue-700",
					buttonText: "text-white",
				};
		}
	};

	const styles = getTypeStyles();

	return (
		<Modal isOpen={isOpen} onClose={onClose} className='max-w-md p-6'>
			<div className='text-center'>
				{/* Icon */}
				<div
					className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg} mb-4`}>
					<span className={`text-xl ${styles.iconColor}`}>{styles.icon}</span>
				</div>

				{/* Title */}
				<h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>{title}</h3>

				{/* Message */}
				<p className='text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed'>{message}</p>

				{/* Button */}
				<button
					onClick={onClose}
					className={`px-6 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
						styles.buttonBg
					} ${styles.buttonText} focus:ring-${
						type === "error"
							? "red"
							: type === "warning"
							? "yellow"
							: type === "success"
							? "green"
							: "blue"
					}-500`}>
					{buttonText}
				</button>
			</div>
		</Modal>
	);
}
