import type { UnknownObject } from "@zayne-labs/toolkit-type-helpers";
import { redirect } from "next/navigation";
import { checkUserSession } from "@/lib/api/callBackendApi/plugins/utils/session";

function withProtectionServer(WrappedComponent: React.ComponentType, pathname: AppRoutes) {
	// eslint-disable-next-line react-x/component-hook-factories
	async function AuthComponent(props: UnknownObject) {
		const { error } = await checkUserSession();

		if (error) {
			return redirect(pathname);
		}

		return <WrappedComponent {...props} />;
	}

	return AuthComponent;
}

export { withProtectionServer };
