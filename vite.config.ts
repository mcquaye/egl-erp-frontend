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
