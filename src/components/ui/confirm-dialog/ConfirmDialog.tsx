import { Modal } from "../modal";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	type?: "default" | "danger" | "warning" | "success";
	loading?: boolean;
}

export default function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	type = "default",
	loading = false,
}: ConfirmDialogProps) {
	const getTypeStyles = () => {
		switch (type) {
			case "danger":
				return {
					icon: "🗑️",
					iconBg: "bg-red-100 dark:bg-red-900/20",
					iconColor: "text-red-600 dark:text-red-400",
					confirmBg: "bg-red-600 hover:bg-red-700",
					confirmText: "text-white",
				};
			case "warning":
				return {
					icon: "⚠️",
					iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
					iconColor: "text-yellow-600 dark:text-yellow-400",
					confirmBg: "bg-yellow-600 hover:bg-yellow-700",
					confirmText: "text-white",
				};
			case "success":
				return {
					icon: "✅",
					iconBg: "bg-green-100 dark:bg-green-900/20",
					iconColor: "text-green-600 dark:text-green-400",
					confirmBg: "bg-green-600 hover:bg-green-700",
					confirmText: "text-white",
				};
			default:
				return {
					icon: "❓",
					iconBg: "bg-blue-100 dark:bg-blue-900/20",
					iconColor: "text-blue-600 dark:text-blue-400",
					confirmBg: "bg-blue-600 hover:bg-blue-700",
					confirmText: "text-white",
				};
		}
	};

	const styles = getTypeStyles();

	const handleConfirm = () => {
		onConfirm();
		if (!loading) {
			onClose();
		}
	};

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

				{/* Actions */}
				<div className='flex gap-3 justify-center'>
					<button
						onClick={onClose}
						disabled={loading}
						className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'>
						{cancelText}
					</button>
					<button
						onClick={handleConfirm}
						disabled={loading}
						className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
							styles.confirmBg
						} ${styles.confirmText} focus:ring-${
							type === "danger"
								? "red"
								: type === "warning"
								? "yellow"
								: type === "success"
								? "green"
								: "blue"
						}-500`}>
						{loading ? (
							<div className='flex items-center gap-2'>
								<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
								Loading...
							</div>
						) : (
							confirmText
						)}
					</button>
				</div>
			</div>
		</Modal>
	);
}
