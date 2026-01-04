import { useRouter } from "@bprogress/next";
import { useEffect } from "react";
import { toast } from "sonner";

type PageBlockerOptions = {
	condition: boolean;
	message: string;
	redirectDelay?: number;
	redirectPath: string;
};

const usePageBlocker = (options: PageBlockerOptions) => {
	const { condition, message, redirectDelay = 500, redirectPath } = options;

	const router = useRouter();

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (!condition) return;

			toast.error(message);
			router.replace(redirectPath);
		}, redirectDelay);

		return () => clearTimeout(timeout);
	}, [router, condition, message, redirectPath, redirectDelay]);
};

export { usePageBlocker };
