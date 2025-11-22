import { IconBox } from "@/components/common";
import { getElementList } from "@/components/common/for";
import { Button, Card } from "@/components/ui";
import { cnJoin, tw } from "@/lib/utils/cn";
import { Main } from "../../-components";

const pricing = [
	{
		banner: { className: tw`bg-medinfo-primary-subtle`, title: "active" },
		features: [
			"Limited comments in community chat",
			"No direct messages to doctors",
			"No appointments with doctors",
		],
		prices: null,
		title: "FREE",
	},
	{
		banner: null,
		features: [
			"Unlimited comments in community chat",
			"Direct messages to doctors",
			"Limited appointments",
		],
		prices: ["₦54, 000/year", "₦4, 600/month"],
		title: "TIER 2",
	},
	{
		banner: { className: tw`border border-medinfo-light-1 bg-white`, title: "recommended" },
		features: [
			"Unlimited comments in community chat",
			"Direct messages to doctors and video calls",
			"Unlimited appointments",
		],
		prices: ["₦82, 000/year", "₦7, 000/month"],
		title: "TIER 3",
	},
] satisfies PricingCardProps[];

function PricingPage() {
	const [PricingCardList] = getElementList();

	return (
		<Main className="w-full gap-8 max-md:mx-auto max-md:max-w-[400px] md:gap-12">
			<header className="flex flex-col gap-3">
				<h1 className="text-[32px] font-semibold text-medinfo-dark-1">
					Go Premium. Choose your plan!
				</h1>

				<p className="text-[18px] font-medium text-medinfo-dark-4">
					Go premium and get access to more medical goodies.
				</p>
			</header>

			<PricingCardList
				as="div"
				className="flex flex-col gap-9 md:flex-row"
				each={pricing}
				renderItem={(item) => <PricingCard key={item.title} {...item} />}
			/>
		</Main>
	);
}

type PricingCardProps = {
	banner: { className: string; title: "active" | "recommended" } | null;
	features: string[];
	prices: [yearly: string, monthly: string] | null;
	title: string;
};

function PricingCard(props: PricingCardProps) {
	const { banner, features, prices, title } = props;

	const [For] = getElementList("base");

	const hasGetStartedButton = banner?.title !== "active";

	return (
		<Card.Root
			className={cnJoin(
				`relative flex min-h-[436px] max-w-[342px] flex-col justify-between rounded-[16px] border
				border-medinfo-light-1 bg-white p-6
				shadow-[0_4px_4px_hsl(152,17%,79%,0.12),_0_4px_4px_hsl(152,17%,79%,0.12)]`,
				banner
					&& `[--banner-height:29px] [--half-banner-height:calc(var(--banner-height)/2)]
					max-md:mt-(--half-banner-height)`
			)}
		>
			{banner && (
				<span
					className={cnJoin(
						`absolute top-[calc(var(--half-banner-height)*-1)] inline-block w-fit self-center
						rounded-[32px] px-3 py-1 text-[14px] text-medinfo-primary-main`,
						banner.className
					)}
				>
					{banner.title}
				</span>
			)}

			<div className="flex flex-col gap-9">
				<Card.Header className="flex justify-between">
					<Card.Title className="text-[18px] font-medium text-medinfo-primary-main">
						{title}
					</Card.Title>

					{prices && (
						<Card.Description
							className="flex flex-col items-end gap-0.5 text-[20px] font-medium
								text-medinfo-primary-main"
						>
							<For each={prices} renderItem={(item) => <span key={item}>{item}</span>} />
						</Card.Description>
					)}
				</Card.Header>

				<Card.Content as="ul" className="flex flex-col gap-3.5">
					<For
						each={features}
						renderItem={(feature) => (
							<li key={feature} className="flex gap-1">
								<span className="flex size-6 items-center justify-center">
									<IconBox icon="material-symbols:check-rounded" className="size-3" />
								</span>

								<p className="text-medinfo-primary-main">{feature}</p>
							</li>
						)}
					/>
				</Card.Content>
			</div>

			{hasGetStartedButton && (
				<Card.Footer>
					<Button size="full-width">Get started</Button>
				</Card.Footer>
			)}
		</Card.Root>
	);
}

export default PricingPage;
