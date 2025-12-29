import Link from "next/link";
import { LOGO_TYPE_LOOKUP } from "./logo-type-lookup";

const Logo = (
	props: React.SVGProps<SVGSVGElement> & {
		href?: "none" | (string & NonNullable<unknown>);
		type?: "footer" | "header";
	}
) => {
	const { href = "/", type = "header", ...restOfProps } = props;

	// eslint-disable-next-line react-hooks/todo
	const { [type]: LogoType } = LOGO_TYPE_LOOKUP;

	return (
		<Link href={href}>
			<LogoType {...restOfProps} />
		</Link>
	);
};

export default Logo;
