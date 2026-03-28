import { isBrowser } from "@zayne-labs/toolkit-core";
import { createReactStore } from "@zayne-labs/toolkit-react/zustand-compat";
import type { StateCreator } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

type SystemTheme = "dark" | "light";

type ThemeStore = {
	actions: {
		initThemeOnLoad: () => void;
		setTheme: (newTheme: Theme) => void;
		toggleTheme: () => void;
	};
	isDarkMode: boolean;

	systemTheme: SystemTheme;

	theme: Theme;
};

const getPrefersDarkMode = () => {
	return isBrowser() && globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
};

const themeStoreObjectFn: StateCreator<ThemeStore> = (set, get) => ({
	actions: {
		initThemeOnLoad: () => {
			const { systemTheme, theme: persistedTheme } = get();

			const resolvedTheme = persistedTheme === "system" ? systemTheme : persistedTheme;

			document.documentElement.dataset.theme = resolvedTheme;
		},

		setTheme: (newTheme) => {
			document.documentElement.dataset.theme = newTheme;

			set({ isDarkMode: newTheme === "dark", theme: newTheme });
		},

		toggleTheme: () => {
			const { actions, systemTheme, theme: persistedTheme } = get();

			const resolvedTheme = persistedTheme === "system" ? systemTheme : persistedTheme;

			const newTheme = resolvedTheme === "light" ? "dark" : "light";

			actions.setTheme(newTheme);
		},
	},

	isDarkMode: getPrefersDarkMode(),

	systemTheme: getPrefersDarkMode() ? "dark" : "light",

	theme: "system",
});

export const useThemeStore = createReactStore<ThemeStore>()(
	persist(themeStoreObjectFn, {
		migrate: (persistedState) => persistedState,
		name: "colorScheme",
		partialize: ({ isDarkMode, theme }) => ({ isDarkMode, theme }),
		version: 1,
	})
);
