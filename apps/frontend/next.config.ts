import type { NextConfig } from "next";

const config: NextConfig = {
	devIndicators: {
		position: "bottom-right",
	},

	images: {
		remotePatterns: [
			{
				hostname: "health.gov",
				pathname: "/**",
				port: "",
				protocol: "https",
			},
			{
				hostname: "example.com",
				pathname: "/**",
				port: "",
				protocol: "https",
			},
			{
				hostname: "odphp.health.gov",
				pathname: "/**",
				port: "",
				protocol: "https",
			},
			{
				hostname: "res.cloudinary.com",
				pathname: "/**",
				port: "",
				protocol: "https",
			},
			{
				hostname: "avatar.iran.liara.run",
				pathname: "/**",
				port: "",
				protocol: "https",
			},
		],
	},

	reactStrictMode: true,

	typescript: {
		ignoreBuildErrors: true,
	},
};

export default config;
