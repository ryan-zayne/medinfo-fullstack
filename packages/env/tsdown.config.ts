import { defineConfig } from "tsdown";

export default defineConfig({
	clean: true,
	dts: { newContext: true },
	fixedExtension:false,
	entry: ["src/*.ts"],
	format: ["esm"],
	platform: "node",
	sourcemap: true,
	target: "esnext",
});
