import type { Metadata } from "next";
import { Roboto, Work_Sans } from "next/font/google";
import { SonnerToaster } from "@/components/common/Toaster";
import { cnJoin } from "@/lib/utils/cn";
import { Providers } from "./Providers";
import "../tailwind.css";

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

function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body className={cnJoin(roboto.variable, workSans.variable)}>
				<Providers>{children}</Providers>

				<SonnerToaster />
			</body>
		</html>
	);
}

export default RootLayout;
