import { defineConfig } from "tsdown";

export default defineConfig({
	clean: true,
	dts: true,
	entry: "./src/server.ts",
	fixedExtension: false,
	format: ["esm"],
	noExternal: [/@medinfo\//],
	platform: "node",
	target: "esnext",
	treeshake: true,
});
