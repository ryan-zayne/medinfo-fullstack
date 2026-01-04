import { zayne } from "@zayne-labs/eslint-config";

export default zayne(
	{
		type: "app-strict",
		ignores: [".next/**", "eslint.config.js", "apps/frontend/next-env.d.ts", "DEV-GUIDE.md"],
		react: {
			nextjs: {
				overrides: {
					"nextjs/no-html-link-for-pages": ["error", "apps/frontend"],
				},
			},
		},
		tailwindcssBetter: {
			settings: { entryPoint: "apps/frontend/tailwind.css" },
		},
		tanstack: true,
		typescript: {
			tsconfigPath: ["**/tsconfig.json"],
		},
		comments: {
			overrides: {
				"eslint-comments/require-description": "off",
			},
		},
	},
	{
		// FIXME - Turn back on once the error is fixed
		files: ["apps/frontend/components/animated/primitives/**"],
		rules: { "react-you-might-not-need-an-effect/no-reset-all-state-on-prop-change": "off" },
	},
	{
		files: ["apps/frontend/**/*.ts"],
		rules: { "node/no-process-env": "off" },
	},
	{
		files: ["apps/backend/testing.ts"],
		rules: { "unicorn/no-empty-file": "off" },
	},
	{
		files: ["packages/db/src/migrations/**"],
		rules: { "unicorn/filename-case": "off" },
	}
);
