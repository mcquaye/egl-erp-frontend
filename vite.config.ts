import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
	plugins: [
		react(),
		svgr({
			svgrOptions: {
				icon: true,
				exportType: "named",
				namedExport: "ReactComponent",
			},
		}),
		{
			name: "spa-fallback",
			configureServer(server) {
				server.middlewares.use((req, _res, next) => {
					if (
						req.originalUrl?.startsWith("/api") ||
						req.originalUrl?.includes(".") ||
						req.originalUrl?.startsWith("/@")
					) {
						return next();
					}
					req.originalUrl = "/";
					next();
				});
			},
		},
	],
	server: {
		port: 5050,
		strictPort: true,
		hmr: {
			overlay: true,
		},
		watch: {
			usePolling: true,
			interval: 1000,
		},
		proxy: {
			"/api": {
				target: "https://api.electrolandgh.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
				secure: true,
			},
		},
	},
	preview: {
		port: 5050,
		strictPort: true,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					// Split large libraries into separate chunks
					react: ["react", "react-dom", "react-router-dom"],
					// Add other large libraries here, e.g.:
					// lodash: ["lodash"],
					// firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
				},
			},
		},
		chunkSizeWarningLimit: 3000, // Increase the warning limit to 1000 KB
	},
});
