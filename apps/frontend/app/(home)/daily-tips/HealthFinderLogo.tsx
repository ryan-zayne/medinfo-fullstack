import Image from "next/image";

function HealthFinderDetails(props: { lastUpdated: string }) {
	const { lastUpdated } = props;

	return (
		<>
			<div className="mt-7 flex items-center gap-2">
				<p className="font-roboto text-[18px] font-medium text-medinfo-dark-2 italic">Source: </p>

				<a
					className="inline-block h-auto w-[200px]"
					href="https://odphp.health.gov/myhealthfinder"
					rel="noopener noreferrer"
					target="_blank"
					title="MyHealthfinder"
				>
					<Image
						src="https://odphp.health.gov/themes/custom/healthfinder/images/MyHF.svg"
						alt="MyHealthfinder"
						width={50}
						height={50}
					/>
				</a>
			</div>

			<p className="font-roboto text-[18px] font-medium text-medinfo-dark-2 italic">
				Last Updated: {lastUpdated}
			</p>
		</>
	);
}

export { HealthFinderDetails };
