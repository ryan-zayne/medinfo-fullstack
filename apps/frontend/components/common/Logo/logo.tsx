import Link from "next/link";
import { LOGO_TYPE_LOOKUP } from "./logo-type-lookup";

const Logo = (
	props: React.SVGProps<SVGSVGElement> & {
		href?: "none" | (string & NonNullable<unknown>);
		variant?: "footer" | "header";
	}
) => {
	const { href = "/", variant = "header", ...restOfProps } = props;

	// eslint-disable-next-line react-hooks/todo
	const { [variant]: LogoType } = LOGO_TYPE_LOOKUP;

	return (
		<Link href={href}>
			<LogoType {...restOfProps} />
		</Link>
	);
};

export default Logo;
