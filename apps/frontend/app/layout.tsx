import { SonnerToaster } from "@/components/common";
import { cnJoin } from "@/lib/utils/cn";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Roboto, Work_Sans } from "next/font/google";
import "../tailwind.css";
import { Providers } from "./Providers";

type RootLayoutProps = {
	children: React.ReactNode;
};

const workSans = Work_Sans({
	subsets: ["latin"],
	variable: "--font-work-sans",
	weight: ["500", "600", "700"],
});

const roboto = Roboto({
	subsets: ["latin"],
	variable: "--font-roboto",
	weight: ["400", "500"],
});

export const metadata: Metadata = {
	description: "Free access to knowledge and an easy chit-chat with the best doctors",
	title: "MedInfo",
};

function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en" data-theme="light">
			<body className={cnJoin(roboto.variable, workSans.variable)}>
				<Providers>{children}</Providers>

				<SonnerToaster />

				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}

export default RootLayout;
