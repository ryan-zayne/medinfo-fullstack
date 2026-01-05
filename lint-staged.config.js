export default {
	"*.{js,ts,tsx,mjs}": () => "pnpm lint:eslint:root",
	"*.{ts,tsx}": () => "pnpm lint:type-check",
};
