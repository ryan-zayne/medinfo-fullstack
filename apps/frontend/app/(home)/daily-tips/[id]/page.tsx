import { ForWithWrapper } from "@/components/common/for";
import { callBackendApi } from "@/lib/api/callBackendApi";
import Image from "next/image";
import { Main } from "../../-components";
import { ScrollableTipCards } from "../DailyTipCard";
import { HealthFinderDetails } from "../HealthFinderLogo";

async function TipExpandedPage({ params }: PageProps<"/daily-tips/[id]">) {
	const { id: tipId } = await params;

	const result = await callBackendApi("@get/health-tips/one/:id", {
		params: { id: tipId },
	});

	if (result.error) {
		return null;
	}

	return (
		<Main className="flex w-full flex-col max-md:max-w-[400px]">
			<section className="h-[190px] w-[297px] lg:h-[410px] lg:w-[644px]">
				<Image
					src={result.data.data.imageUrl}
					className="size-full rounded-tl-[16px] rounded-br-[16px]"
					priority={true}
					width={297}
					height={190}
					alt={result.data.data.imageAlt}
				/>
			</section>

			<section className="mt-8 flex flex-col gap-6 lg:mt-10 lg:gap-8">
				<h1 className="text-[32px] font-bold text-medinfo-primary-main lg:text-[60px]">
					{result.data.data.title}
				</h1>

				<ForWithWrapper
					className="flex flex-col gap-8 lg:gap-[64px]"
					each={result.data.data.mainContent}
					renderItem={(item) => (
						<li key={item.title} className="flex flex-col gap-4 lg:min-w-[616px] lg:gap-7">
							<h4 className="text-[20px] font-semibold text-medinfo-primary-main lg:text-[24px]">
								{item.title}
							</h4>

							<div
								className="prose max-w-[80ch] [&>h4]:text-[18px] [&>h4]:font-medium
									[&>h4]:text-medinfo-primary-main [&>p]:text-pretty"
								// eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
								dangerouslySetInnerHTML={{ __html: item.content }}
							/>
						</li>
					)}
				/>

				<HealthFinderDetails lastUpdated={result.data.data.lastUpdated} />
			</section>

			<section className="mt-14 flex flex-col items-center lg:mt-[92px]">
				<h2 className="text-center text-[28px] font-bold text-medinfo-primary-main lg:text-[52px]">
					Checkout Other Tips
				</h2>

				<ScrollableTipCards tipId={tipId} />
			</section>
		</Main>
	);
}
export default TipExpandedPage;
