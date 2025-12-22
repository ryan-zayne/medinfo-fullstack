import { NavLink } from "@/components/common";
import { callBackendApi } from "@/lib/api/callBackendApi";
import { notFound } from "next/navigation";
import { Main } from "../-components";
import LibraryFilter from "./LibraryFilter";

async function LibraryPage() {
	const allDiseasesResult = await callBackendApi("@get/diseases/all");

	if (allDiseasesResult.error) {
		console.error(allDiseasesResult.error.errorData);
		return notFound();
	}

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

			<LibraryFilter diseases={allDiseasesResult.data.data.diseases} />

			<section className="flex justify-center">
				<NavLink
					href="#"
					transitionType="regular"
					className="inline-block text-center text-medinfo-primary-main lg:text-[20px] lg:font-medium"
				>
					More results ...({allDiseasesResult.data.data.pagination.total})
				</NavLink>
			</section>
		</Main>
	);
}

export default LibraryPage;
