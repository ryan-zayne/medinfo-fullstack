import Image from "next/image";
import { IconBox } from "@/components/common";
import { ForWithWrapper } from "@/components/common/for";
import { cnJoin } from "@/lib/utils/cn";
import { feature1, feature2, feature3, hero } from "@/public/assets/images/landing-page";
import { AccordionFaqs, Main } from "./-components";
import { CallToActionLink } from "./-components/CallToActionLink";
import { ScrollableTipCards } from "./daily-tips/DailyTipCard";

const coreServices = [
	{
		description:
			"Connect with certified sub-specialists across various medical fields for expert guidance tailored to your specific health needs.",
		imageSrc: feature1 as string,
		title: "SubSpecialists",
	},
	{
		description:
			"Access a rich, user-friendly library of health information covering a wide range of conditions, symptoms, and treatments—all for free.",
		imageSrc: feature2 as string,
		title: "Open source library",
	},
	{
		description:
			"Get personalized medical advice from experienced healthcare professionals through our secure and convenient virtual consultation service.",
		imageSrc: feature3 as string,
		title: "Virtual consultancy",
	},
];

const features = [
	{ icon: "ic:sharp-access-time", title: "Efficient and user-friendly" },
	{ icon: "fluent:access-time-24-regular", title: "Accessible consultations" },
	{ icon: "mynaui:lock-password", title: "Ensured confidentiality" },
	{ icon: "mage:book-text", title: "Open library" },
];

const advantages = [
	{
		description:
			"Get access to trusted healthcare information and professional support anytime, day or night, at your convenience.",
		icon: "mage:book-text",
		title: "24/7 availability",
	},
	{
		description:
			"Consult with doctors from the comfort of your home, eliminating the need for travel or in-person visits.",
		icon: "solar:user-check-rounded-outline",
		title: "Remote visitation",
	},
	{
		description:
			"Experience quick and easy scheduling with minimal wait times, ensuring you get the help you need when you need it.",
		icon: "tabler:calendar-check",
		title: "Zero appointments",
	},
];

function HomePage() {
	return (
		<Main className="w-full gap-14 max-md:max-w-[400px] md:gap-[92px]">
			<section className="flex flex-col items-center md:flex-row-reverse md:gap-[67px]">
				<div className="flex flex-col items-center max-md:text-center md:items-start">
					<h1
						className="text-[clamp(32px,5.2vw,68px)] leading-10 font-bold text-medinfo-primary-main
							md:leading-[76px] md:text-balance [&>span]:[transition:color_400ms_ease-out]
							hover:[&>span]:text-medinfo-secondary-darker"
					>
						Free <span>access</span> to knowledge and an easy chit-chat with the best{" "}
						<span>doctors</span>
					</h1>

					<p className="mt-[15px] md:text-[18px] md:leading-[26px]">
						Getting the right health information shouldn’t be complicated, and talking to a doctor
						shouldn’t feel like a big task. That’s why we’ve made it easy for you to access reliable
						knowledge and chat with some of the best doctors in the field. Whether you have a simple
						question or need guidance on something more serious, we’re here to connect you with
						professionals who are ready to help—no stress, no barriers. It's healthcare made simple,
						just the way it should be.
					</p>

					<CallToActionLink buttonProps={{ className: "mt-6" }} />
				</div>

				<div
					className="relative ml-(--offset) w-max shrink-0 [--offset:19px]
						max-md:mt-[calc(40px+var(--offset))]"
				>
					<span
						className="absolute right-(--offset) bottom-(--offset) z-[-1] block size-full
							rounded-[16px] bg-medinfo-primary-main md:right-7 md:bottom-7 md:rounded-[24px]"
					/>
					<Image
						className="aspect-223/273 min-h-[273px] md:aspect-340/415 md:min-h-[415px]"
						src={hero as string}
						alt=""
						priority={true}
						width={223}
						height={273}
					/>
				</div>
			</section>

			<section>
				<h2
					className="text-center text-[28px] leading-9 font-semibold text-medinfo-primary-main
						md:text-[52px] md:leading-[60px] md:font-bold"
				>
					Our Core Services
				</h2>

				<ForWithWrapper
					className="mt-6 flex flex-col items-center gap-4 text-center md:mt-14 md:flex-row
						md:justify-between md:gap-7"
					each={coreServices}
					renderItem={(coreService, index) => (
						<li key={coreService.title} className="group">
							<div className="relative">
								<Image
									className={cnJoin(
										"aspect-272/292 max-h-[292px] md:aspect-340/362 md:max-h-[362px]",
										index === 1 && "md:mt-[80px]"
									)}
									src={coreService.imageSrc}
									alt=""
									width={272}
									height={292}
								/>

								<span
									className="absolute inset-0 flex items-end rounded-[16px]
										bg-medinfo-primary-main p-7 font-normal text-white opacity-0
										transition-opacity duration-500 ease-in-out group-hover:opacity-100
										md:text-[18px]"
								>
									{coreService.description}
								</span>
							</div>

							<p
								className="mt-4 text-[22px] font-medium transition-opacity duration-500 ease-in-out
									group-hover:opacity-0 md:text-[24px] md:font-semibold"
							>
								{coreService.title}
							</p>
						</li>
					)}
				/>
			</section>

			<section>
				<h2
					className="text-center text-[28px] leading-9 font-semibold text-medinfo-primary-main
						md:text-[52px] md:leading-[60px] md:font-bold"
				>
					Why MedInfo Nigeria?
				</h2>

				<ForWithWrapper
					className="mt-12 grid grid-cols-2 justify-center gap-x-5 gap-y-10 text-center md:mt-[88px]
						md:grid-cols-[repeat(4,minmax(161px,248px))] md:justify-between md:gap-x-7"
					each={features}
					renderItem={(feature, index) => (
						<li
							key={index}
							className="relative flex flex-col items-center justify-center rounded-[16px] border
								border-medinfo-primary-main px-[3.5px] py-[54px] text-medinfo-primary-main
								md:px-[47px] md:py-[67px]"
						>
							<span
								className="absolute -top-6 block size-12 rounded-full bg-white p-3 text-[24px]
									shadow-[0_4px_4px_hsl(0,0%,0%,0.12)] md:size-16 md:text-[40px]"
							>
								<IconBox icon={feature.icon} />
							</span>
							<p className="md:text-[20px]">{feature.title}</p>
						</li>
					)}
				/>
			</section>

			<section>
				<h2
					className="text-center text-[28px] leading-9 font-semibold text-medinfo-primary-main
						md:text-[52px] md:leading-[60px] md:font-bold"
				>
					Advantages of Virtual Healthcare
				</h2>

				<ForWithWrapper
					className="mt-6 flex flex-col gap-6 md:mt-14 md:flex-row md:gap-7"
					each={advantages}
					renderItem={(advantage, index) => (
						<li key={index}>
							<span
								className="block size-[92px] rounded-[16px] bg-medinfo-primary-subtle p-6
									text-[44px] text-medinfo-primary-main"
							>
								<IconBox icon={advantage.icon} />
							</span>
							<h3 className="mt-5 text-[24px] font-semibold text-medinfo-primary-main">
								{advantage.title}
							</h3>
							<p className="mt-3">{advantage.description}</p>
						</li>
					)}
				/>
			</section>

			<section className="flex flex-col items-center">
				<h2
					className="text-center text-[28px] leading-9 font-semibold text-medinfo-primary-main
						md:text-[52px] md:leading-[60px] md:font-bold"
				>
					Did you know?
				</h2>

				<ScrollableTipCards />
			</section>

			<section>
				<h2
					className="text-center text-[28px] leading-9 font-semibold text-medinfo-primary-main
						md:text-[52px] md:leading-[60px] md:font-bold"
				>
					Frequently Asked Questions
				</h2>

				<AccordionFaqs />
			</section>
		</Main>
	);
}

export default HomePage;
