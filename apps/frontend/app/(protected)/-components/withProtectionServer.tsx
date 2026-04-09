import type { UnknownObject } from "@zayne-labs/toolkit-type-helpers";
import { redirect } from "next/navigation";
import type { AppRoutes } from "@/.next/dev/types/routes";
import { checkUserSession } from "@/lib/api/callBackendApi/plugins/utils/session";

function withProtectionServer(WrappedComponent: React.ComponentType, pathname: AppRoutes) {
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
