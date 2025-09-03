import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface Props {
	onDetected: (value: string) => void;
	onClose: () => void;
	formatsToSupport?: Html5QrcodeSupportedFormats[];
}

const DEFAULT_FORMATS: Html5QrcodeSupportedFormats[] = [
	Html5QrcodeSupportedFormats.QR_CODE,
	Html5QrcodeSupportedFormats.CODE_128,
	Html5QrcodeSupportedFormats.EAN_13,
	Html5QrcodeSupportedFormats.UPC_A,
	Html5QrcodeSupportedFormats.UPC_E,
];

export default function Html5QrcodeScanner({ onDetected, onClose, formatsToSupport }: Props) {
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const divId = useRef(`html5qr-${Math.random().toString(36).substr(2, 9)}`);
	const [error, setError] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState(true);

	useEffect(() => {
		let html5Qr: Html5Qrcode | null = null;
		const formats = formatsToSupport || DEFAULT_FORMATS;
		const config = {
			fps: 10,
			qrbox: { width: 250, height: 250 },
			formatsToSupport: formats,
		};
		try {
			html5Qr = new Html5Qrcode(divId.current);
			scannerRef.current = html5Qr;
			html5Qr
				.start(
					{ facingMode: "environment" },
					config,
					(decodedText) => {
						onDetected(decodedText);
						html5Qr?.stop().then(() => {
							html5Qr?.clear();
						});
					},
					(errorMessage) => {
						// Optionally handle scan errors
						// console.warn(errorMessage);
					}
				)
				.then(() => {
					setLoading(false);
				})
				.catch((err) => {
					setError("Failed to start camera: " + err.message);
					setLoading(false);
				});
		} catch (err: any) {
			setError("Initialization error: " + err.message);
			setLoading(false);
		}

		return () => {
			if (html5Qr) {
				html5Qr
					.stop()
					.then(() => {
						html5Qr?.clear();
					})
					.catch(() => {});
			}
		};
	}, [onDetected, formatsToSupport]);

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
			<div className='w-full max-w-lg bg-white rounded-lg overflow-hidden shadow-lg mx-4'>
				<div className='flex items-center justify-between px-4 py-3 border-b bg-gray-50'>
					<div className='font-medium'>Barcode Scanner</div>
					<button
						onClick={onClose}
						className='px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm text-red-700 transition-colors'>
						Close
					</button>
				</div>
				<div className='p-6'>
					{error ? (
						<div className='text-center py-8'>
							<div className='text-red-600 mb-4'>
								<div className='text-lg font-medium'>Scanner Error</div>
								<div className='text-sm'>{error}</div>
							</div>
							<div className='text-xs text-gray-500 space-y-1'>
								<div>• Make sure you granted camera permission</div>
								<div>• Try refreshing the page if problems persist</div>
								<div>• Ensure camera is not being used by another app</div>
							</div>
						</div>
					) : (
						<>
							{loading && (
								<div className='text-center py-8'>
									<div className='text-lg font-medium text-gray-700 mb-2'>Starting camera...</div>
									<div className='text-sm text-gray-500'>Please wait while the scanner loads</div>
								</div>
							)}
							<div id={divId.current} className='w-full aspect-video mx-auto' />
							<div className='text-center mt-4 text-sm text-gray-600'>
								Point your camera at a barcode or QR code
								<br />
								Supported formats: QR, Code 128, EAN-13, UPC-A, UPC-E
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
