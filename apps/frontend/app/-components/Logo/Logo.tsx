import { NavLink } from "@/components/common/NavLink";
import { LOGO_TYPE_LOOKUP } from "./logo-type-lookup";

const Logo = (
	props: React.SVGProps<SVGSVGElement> & {
		variant?: "footer" | "header";
	}
) => {
	const { variant = "header", ...restOfProps } = props;

	const { [variant]: LogoType } = LOGO_TYPE_LOOKUP;

	return (
		<NavLink href="/">
			<LogoType {...restOfProps} />
		</NavLink>
	);
};

export { Logo };
