import { ENVIRONMENT } from "@/config/env";
import { AppError } from "@/lib/utils";
import { createFetchClient } from "@zayne-labs/callapi";
import { zoomMainApiSchema, zoomOauthApiSchema } from "./apiSchema";

const callZoomOauthApi = createFetchClient({
	schema: zoomOauthApiSchema,
});

const getZoomAccessToken = async () => {
	const result = await callZoomOauthApi("@post/https://zoom.us/oauth/token", {
		auth: {
			password: ENVIRONMENT.ZOOM_CLIENT_SECRET,
			type: "Basic",
			username: ENVIRONMENT.ZOOM_CLIENT_ID,
		},
		query: {
			account_id: ENVIRONMENT.ZOOM_ACCOUNT_ID,
			grant_type: "account_credentials",
		},
	});

	if (result.error) {
		throw new AppError({
			cause: result.error.originalError,
			code: 500,
			message: "Failed to get zoom access token",
		});
	}

	return result.data.access_token;
};

type CreateMeetingOptions = {
	dateOfAppointment: string;
	doctorEmail: string;
	patientEmail: string;
	reason: string;
};

const callZoomApi = createFetchClient({
	auth: getZoomAccessToken(),
	schema: zoomMainApiSchema,
});

export const createMeeting = async (options: CreateMeetingOptions) => {
	const { dateOfAppointment, doctorEmail, patientEmail, reason } = options;

	const result = await callZoomApi("@post/https://api.zoom.us/v2/users/me/meetings", {
		body: {
			agenda: reason,
			default_password: true,
			duration: 60,
			password: "123456",
			schedule_for: "tezonteam@gmail.com",
			settings: {
				allow_multiple_devices: true,
				alternative_hosts_email_notification: true,
				breakout_room: {
					enable: true,
					rooms: [
						{
							name: "Breakout Room1",
							participants: [`${patientEmail};${doctorEmail}`],
						},
					],
				},
				calendar_type: 1,
				contact_email: "tezonteam@gmail.com",
				contact_name: "Tezon Team",
				continuous_meeting_chat: {
					enable: true,
					who_is_added: "all_users",
				},
				email_notification: true,
				encryption_type: "enhanced_encryption",
				host_save_video_order: false,
				host_video: true,
				join_before_host: true,
				meeting_authentication: true,
				meeting_invitees: [{ email: patientEmail }, { email: doctorEmail }],
				mute_upon_entry: false,
				participant_video: true,
				private_meeting: true,
				waiting_room: false,
				watermark: false,
			},
			start_time: dateOfAppointment,
			timezone: "Europe/London",
			topic: reason,
			type: 2, // Scheduled meeting
		},
	});

	if (result.error) {
		throw new AppError({
			cause: result.error.originalError,
			code: 500,
			message: "Failed to create zoom meeting",
		});
	}

	return result.data;
};

export const deleteMeeting = async (meetingId: number) => {
	const result = await callZoomApi("@delete/https://api.zoom.us/v2/meetings/:meetingId", {
		params: { meetingId },
	});

	if (result.error) {
		throw new AppError({
			cause: result.error.originalError,
			code: 500,
			message: "Failed to delete zoom meeting",
		});
	}
};
