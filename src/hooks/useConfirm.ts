import { useState } from "react";

interface ConfirmOptions {
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	type?: "default" | "danger" | "warning" | "success";
}

export const useConfirm = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
	const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);
	const [loading, setLoading] = useState(false);

	const confirm = (options: ConfirmOptions): Promise<boolean> => {
		setConfirmOptions(options);
		setIsOpen(true);
		setLoading(false);

		return new Promise((resolve) => {
			setResolvePromise(() => resolve);
		});
	};

	const handleConfirm = () => {
		if (resolvePromise) {
			resolvePromise(true);
		}
		setIsOpen(false);
		setConfirmOptions(null);
		setResolvePromise(null);
		setLoading(false);
	};

	const handleCancel = () => {
		if (resolvePromise) {
			resolvePromise(false);
		}
		setIsOpen(false);
		setConfirmOptions(null);
		setResolvePromise(null);
		setLoading(false);
	};

	const setLoadingState = (loadingState: boolean) => {
		setLoading(loadingState);
	};

	return {
		confirm,
		isOpen,
		confirmOptions,
		handleConfirm,
		handleCancel,
		loading,
		setLoading: setLoadingState,
	};
};
