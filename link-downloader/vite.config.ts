import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import defineManifest from "./manifest.config";

import { crx } from "@crxjs/vite-plugin";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest: defineManifest })],
});
