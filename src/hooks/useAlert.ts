import { useState } from "react";

interface AlertOptions {
	title: string;
	message: string;
	buttonText?: string;
	type?: "success" | "error" | "warning" | "info";
}

export const useAlert = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);

	const alert = (options: AlertOptions): Promise<void> => {
		setAlertOptions(options);
		setIsOpen(true);

		return new Promise((resolve) => {
			const handleClose = () => {
				setIsOpen(false);
				setAlertOptions(null);
				resolve();
			};

			// Store the resolve function to call it when dialog closes
			setTimeout(() => {
				if (isOpen) {
					handleClose();
				}
			}, 0);
		});
	};

	const handleClose = () => {
		setIsOpen(false);
		setAlertOptions(null);
	};

	return {
		alert,
		isOpen,
		alertOptions,
		handleClose,
	};
};
