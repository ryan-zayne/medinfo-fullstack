export const WhiteSpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
		<g stroke="currentColor">
			<circle cx="12" cy="12" r="9.5" fill="none" strokeLinecap="round" strokeWidth="3">
				<animate
					attributeName="stroke-dasharray"
					calcMode="spline"
					dur="1.5s"
					keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
					keyTimes="0;0.475;0.95;1"
					repeatCount="indefinite"
					values="0 150;42 150;42 150;42 150"
				/>
				<animate
					attributeName="stroke-dashoffset"
					calcMode="spline"
					dur="1.5s"
					keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
					keyTimes="0;0.475;0.95;1"
					repeatCount="indefinite"
					values="0;-16;-59;-59"
				/>
			</circle>
			<animateTransform
				attributeName="transform"
				dur="2s"
				repeatCount="indefinite"
				type="rotate"
				values="0 12 12;360 12 12"
			/>
		</g>
	</svg>
);

export const GreenSpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		width="48"
		height="48"
		viewBox="0 0 48 48"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48ZM24.0007 41.28C33.5442 41.28 41.2807 33.5435 41.2807 24C41.2807 14.4565 33.5442 6.72 24.0007 6.72C14.4572 6.72 6.7207 14.4565 6.7207 24C6.7207 33.5435 14.4572 41.28 24.0007 41.28Z"
			fill="url(#paint0_angular_2716_12823)"
		/>
		<circle cx="24.0006" cy="44.64" r="3.36" fill="#344E41" />
		<defs>
			<radialGradient
				id="paint0_angular_2716_12823"
				cx="0"
				cy="0"
				r="1"
				gradientUnits="userSpaceOnUse"
				gradientTransform="translate(24 24) rotate(90) scale(24)"
			>
				<stop stopColor="#344E41" />
				<stop offset="1" stopColor="#344E41" stopOpacity="0" />
			</radialGradient>
		</defs>
	</svg>
);
