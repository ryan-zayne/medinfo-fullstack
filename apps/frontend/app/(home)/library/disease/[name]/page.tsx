import { Main } from "@/app/(home)/-components";
import { ForWithWrapper } from "@/components/common/for";
import { callBackendApi } from "@/lib/api/callBackendApi";
import Image from "next/image";
import { AlternateDiseaseCard, ScrollableAlternateDiseaseCards } from "../../DiseaseCard";

async function DiseaseDetailsPage({ params }: PageProps<"/library/disease/[name]">) {
	const { name: diseaseName } = await params;

	const [singleDisease, allDiseases] = await Promise.all([
		callBackendApi("@get/diseases/one/:name", { params: { name: decodeURIComponent(diseaseName) } }),
		callBackendApi("@get/diseases/all", { query: { random: true } }),
	]);

	if (singleDisease.error) {
		return null;
	}

	return (
		<Main className="flex w-full flex-col">
			<section className="lg:flex lg:justify-between lg:gap-16">
				<Image
					className="size-[272px] rounded-tl-[16px] rounded-br-[16px] lg:size-[460px]"
					src={singleDisease.data.data.image}
					alt=""
					priority={true}
					width={272}
					height={272}
				/>

				<section
					id="Ads"
					className="scrollbar-hidden hidden max-h-[460px] overflow-auto lg:flex lg:flex-col lg:gap-2"
				>
					<AlternateDiseaseCard type="list" linkToAd="https://www.google.com" />
					<AlternateDiseaseCard type="list" linkToAd="https://www.google.com" />
					<AlternateDiseaseCard type="list" linkToAd="https://www.google.com" />
				</section>
			</section>

			<section className="mt-5 flex flex-col gap-5 lg:mt-10">
				<h1
					className="text-[32px] font-semibold text-medinfo-primary-darker lg:text-[52px]
						lg:font-bold"
				>
					{singleDisease.data.data.name}
				</h1>

				<p className="text-[18px]">{singleDisease.data.data.description}</p>

				<article>
					<h4>Symptoms</h4>

					<ForWithWrapper
						className="pl-12"
						each={singleDisease.data.data.symptoms}
						renderItem={(symptom) => (
							<li key={symptom} className="list-['-_']">
								{symptom}
							</li>
						)}
					/>
				</article>

				<article>
					<h4>Precautions</h4>

					<ForWithWrapper
						className="pl-12"
						each={singleDisease.data.data.precautions}
						renderItem={(precaution) => (
							<li key={precaution} className="list-['-_']">
								{precaution}
							</li>
						)}
					/>
				</article>
			</section>

			<section id="Ads" className="mt-14 flex flex-col items-center gap-2 lg:hidden">
				<AlternateDiseaseCard type="list" linkToAd="https://www.google.com" />
				<AlternateDiseaseCard type="list" linkToAd="https://www.google.com" />
				<AlternateDiseaseCard type="list" linkToAd="https://www.google.com" />
			</section>

			<section id="Related Posts" className="mt-14 w-full lg:mt-[92px]">
				<h2 className="text-[48px] font-bold text-medinfo-primary-darker max-lg:hidden">
					Related Posts
				</h2>

				{allDiseases.data && (
					<ScrollableAlternateDiseaseCards diseases={allDiseases.data.data.diseases} />
				)}
			</section>
		</Main>
	);
}

export default DiseaseDetailsPage;
