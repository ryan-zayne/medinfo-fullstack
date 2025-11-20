import { zayne } from "@zayne-labs/eslint-config";

export default zayne(
	{
		type: "app-strict",
		ignores: [".next/**", "eslint.config.js", "apps/frontend/next-env.d.ts"],
		react: {
			nextjs: {
				overrides: {
					"nextjs/no-html-link-for-pages": ["error", "apps/frontend"],
				},
			},
		},
		// node: {
		// 	security: true,
		// },
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
		files: ["apps/frontend/**/*.ts"],
		rules: { "node/no-process-env": "off" },
	},
	{
		files: ["apps/backend/testing.ts"],
		rules: { "unicorn/no-empty-file": "off" },
	}
);
