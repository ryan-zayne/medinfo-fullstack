import { Main } from "../-components";
import LibraryFilter from "./LibraryFilter";

function LibraryPage() {
	return (
		<Main className="flex w-full flex-col gap-6 max-lg:max-w-[400px] md:px-6 lg:gap-9 lg:px-[100px]">
			<section className="grid gap-3 text-center lg:gap-6">
				<h1 className="text-[22px] font-medium text-medinfo-primary-darker lg:text-[48px] lg:font-bold">
					Ailment Archive
				</h1>

				<p className="mx-auto max-w-[747px] text-sm lg:text-[18px]">
					Visit our free and extensive Library to find information on various diseases, conditions to
					empower yourself with knowledge and make informed health decisions
				</p>
			</section>

			<LibraryFilter />
		</Main>
	);
}

export default LibraryPage;
