import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

export default function SimpleBarcodeScanner({
	onDetected,
	onClose,
}: {
	onDetected: (text: string) => void;
	onClose: () => void;
}) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isActive = true;
		const codeReader = new BrowserMultiFormatReader();
		codeReaderRef.current = codeReader;

		const startCamera = async () => {
			try {
				const videoInputDevices = await codeReader.listVideoInputDevices();
				if (videoInputDevices.length === 0) {
					setError("No cameras found on this device");
					return;
				}
				const deviceId = videoInputDevices[0].deviceId;
				await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
					if (!isActive) return;
					if (result) {
						onDetected(result.text);
						stopCamera();
					}
					if (err && !(err instanceof NotFoundException)) {
						setError("Decode error: " + (err instanceof Error ? err.message : String(err)));
					}
				});
				if (videoRef.current) {
					videoRef.current.style.display = "block";
				}
			} catch (e: any) {
				setError("Camera error: " + (e?.message || String(e)));
			}
		};

		const stopCamera = () => {
			if (codeReaderRef.current) {
				try {
					codeReaderRef.current.reset();
				} catch (e) {
					// Log reset errors to help debugging (avoid empty catch block)
					console.debug("Error resetting code reader:", e);
				}
			}
			if (videoRef.current) {
				videoRef.current.style.display = "none";
			}
		};

		startCamera();
		return () => {
			isActive = false;
			stopCamera();
		};
	}, [onDetected]);

	return (
		<div>
			<video ref={videoRef} style={{ width: "100%", display: "none" }} />
			{error && <div style={{ color: "red" }}>{error}</div>}
			<button onClick={onClose}>Close</button>
		</div>
	);
}
