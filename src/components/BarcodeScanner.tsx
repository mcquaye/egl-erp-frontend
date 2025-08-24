import React, { useEffect, useRef, useState } from "react";

type Props = {
	onDetected: (value: string) => void;
	onClose: () => void;
};

export default function BarcodeScanner({ onDetected, onClose }: Props) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [scanning, setScanning] = useState(false);
	const streamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		let raf = 0;
		let intervalId: number | undefined;

		const start = async () => {
			setError(null);
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "environment" },
				});
				streamRef.current = stream;
				if (videoRef.current) {
					// ensure muted and playsInline for autoplay in many browsers
					videoRef.current.muted = true;
					videoRef.current.playsInline = true;
					videoRef.current.srcObject = stream;

					// try to play, retry once on AbortError
					try {
						const p = videoRef.current.play();
						if (p !== undefined) {
							await p.catch(async (err: any) => {
								if (err && err.name === "AbortError") {
									// small delay then retry
									await new Promise((r) => setTimeout(r, 200));
									try {
										await videoRef.current!.play();
									} catch (err2) {
										console.warn("Video play retry failed", err2);
									}
								} else {
									throw err;
								}
							});
						}
					} catch (err) {
						console.warn("video.play() error", err);
					}
				}

				setScanning(true);

				const detectorAvailable = typeof (window as any).BarcodeDetector !== "undefined";
				const detector = detectorAvailable
					? new (window as any).BarcodeDetector({
							formats: ["code_128", "ean_13", "ean_8", "qr_code", "code_39", "code_93"],
					  })
					: null;

				const scanFrame = async () => {
					try {
						const video = videoRef.current;
						const canvas = canvasRef.current;
						if (!video || !canvas) return;

						const w = video.videoWidth || 640;
						const h = video.videoHeight || 480;
						canvas.width = w;
						canvas.height = h;
						const ctx = canvas.getContext("2d");
						if (!ctx) return;
						ctx.drawImage(video, 0, 0, w, h);

						if (detector) {
							try {
								const results = await detector.detect(canvas as any);
								if (results && results.length) {
									const raw = results[0].rawValue || results[0].displayValue || "";
									if (raw) {
										onDetected(String(raw));
										stopStream();
									}
								}
							} catch (dErr) {
								// ignore detection errors and continue
								// console.warn('detect error', dErr)
							}
						}
					} catch (err) {
						// ignore per-frame errors
					}
					raf = requestAnimationFrame(scanFrame);
				};

				// start scanning loop
				raf = requestAnimationFrame(scanFrame);
			} catch (err: any) {
				console.error("Camera start failed", err);
				setError(err?.message || "Failed to access camera");
			}
		};

		start();

		const stopStream = () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => t.stop());
				streamRef.current = null;
			}
			setScanning(false);
			if (raf) cancelAnimationFrame(raf);

			if (intervalId) window.clearInterval(intervalId);
		};

		// cleanup
		return () => {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => t.stop());
			}
			if (raf) cancelAnimationFrame(raf);
			if (intervalId) window.clearInterval(intervalId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stopStream = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((t) => t.stop());
			streamRef.current = null;
		}
		setScanning(false);
		onClose();
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
			<div className='w-full max-w-3xl bg-white rounded-lg overflow-hidden shadow-lg'>
				<div className='flex items-center justify-between px-4 py-2 border-b'>
					<div className='font-medium'>Scan Serial (camera)</div>
					<div className='flex items-center gap-2'>
						<button onClick={() => stopStream()} className='px-3 py-1 bg-gray-100 rounded text-sm'>
							Close
						</button>
					</div>
				</div>

				<div className='p-4'>
					{error ? (
						<div className='text-sm text-red-600'>Camera error: {error}</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='aspect-video bg-black'>
								<video ref={videoRef} className='w-full h-full object-cover' muted playsInline />
							</div>
							<div>
								<canvas ref={canvasRef} style={{ display: "none" }} />
								<p className='text-sm text-gray-600 mb-2'>
									Point the camera at the serial barcode or QR code. The scanner will auto-detect
									and fill the serial field.
								</p>
								<p className='text-xs text-gray-500'>
									If your browser doesn't support the BarcodeDetector API, this may not work. You
									can also take a picture and paste the code manually.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
