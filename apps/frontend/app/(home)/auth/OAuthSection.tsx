import { IconBox } from "@/components/common";
import { Button } from "@/components/ui";
import type { SignUpSchema } from "@/lib/api/callBackendApi/apiSchema";
import { googleOAuthMutation } from "@/lib/react-query/mutationOptions";
import { useRouter } from "@bprogress/next";
import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";

function OAuthSection(props: { userRole: z.infer<typeof SignUpSchema>["role"] }) {
	const { userRole } = props;

	const router = useRouter();

	const googleAuthMutationResult = useMutation(googleOAuthMutation());

	const onGoogleOAuthRequest = () => {
		googleAuthMutationResult.mutate(
			{ role: userRole },
			{
				onSuccess: (data) => {
					router.push(data.data.authURL);
				},
			}
		);
	};

	return (
		<>
			<p className="text-medinfo-dark-4 md:text-[20px]">Or</p>

			<div className="flex gap-8">
				<Button
					size="icon"
					theme="secondary"
					className="rounded-[8px]"
					disabled={googleAuthMutationResult.isPending}
					isLoading={googleAuthMutationResult.isPending}
					onClick={onGoogleOAuthRequest}
				>
					<IconBox icon="icon-park-outline:google" className="size-[18px] lg:size-6" />
				</Button>

				<Button size="icon" theme="secondary" className="rounded-[8px]">
					<IconBox icon="basil:facebook-outline" className="size-[18px] lg:size-6" />
				</Button>
			</div>
		</>
	);
}

export { OAuthSection };
