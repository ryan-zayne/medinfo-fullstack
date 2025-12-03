import { Footer, NavBar } from "./-components";

function GlobalLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-svh w-full flex-col items-center">
			<NavBar />
			{children}
			<Footer />
		</div>
	);
}

export default GlobalLayout;
