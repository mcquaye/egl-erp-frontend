import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		svgr({
			svgrOptions: {
				icon: true,
				// This will transform your SVG to a React component
				exportType: "named",
				namedExport: "ReactComponent",
			},
		}),
		{
			name: "spa-fallback",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					// Skip API routes, static files, and Vite internals
					if (
						req.originalUrl?.startsWith("/api") ||
						req.originalUrl?.includes(".") ||
						req.originalUrl?.startsWith("/@")
					) {
						return next();
					}

					// Serve index.html for all client routes
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
			usePolling: true, // Helps with file watching
			interval: 1000, // Poll every second
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
	},
});
