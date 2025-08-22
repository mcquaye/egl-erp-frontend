import { useState, useCallback } from "react";

export const useImageCache = () => {
	const [cacheVersion, setCacheVersion] = useState(Date.now());

	const refreshCache = useCallback(() => {
		setCacheVersion(Date.now());
	}, []);

	const addCacheBuster = useCallback(
		(src: string) => {
			if (!src) return src;
			const separator = src.includes("?") ? "&" : "?";
			return `${src}${separator}v=${cacheVersion}`;
		},
		[cacheVersion]
	);

	return {
		addCacheBuster,
		refreshCache,
	};
};
