declare module "@zxing/library" {
	export class BrowserMultiFormatReader {
		constructor();
		listVideoInputDevices(): Promise<MediaDeviceInfo[]>;
		decodeFromVideoDevice(
			deviceId: string | undefined,
			videoElement: HTMLVideoElement,
			callback: (result: any, error?: any) => void
		): Promise<void>;
		reset(): void;
	}

	export class NotFoundException extends Error {}
}
