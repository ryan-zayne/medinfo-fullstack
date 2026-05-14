import { Footer, NavBar } from "./-components";

function HomeLayout({ children }: LayoutProps<"/">) {
	return (
		<div className="flex min-h-svh w-full flex-col items-center">
			<NavBar />
			{children}
			<Footer />
		</div>
	);
}

export default HomeLayout;
