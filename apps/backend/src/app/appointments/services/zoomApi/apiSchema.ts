import { defineSchema } from "@zayne-labs/callapi/utils";
import { z } from "zod";

export const zoomOauthApiSchema = defineSchema(
	{
		/**
		 * @description Gets a zoom access token.
		 * @see https://developers.zoom.us/docs/integrations/oauth/#request-an-access-token
		 */
		"@post/token": {
			auth: z.object({
				password: z.string(),
				type: z.literal("Basic"),
				username: z.string(),
			}),

			data: z.object({
				access_token: z.jwt(),
				api_url: z.url(),
				expires_in: z.number(),
				scope: z.string(),
				token_type: z.string(),
			}),

			query: z.object({
				account_id: z.string(),
				grant_type: z.literal(["account_credentials"]),
			}),
		},
	},
	{ baseURL: "https://zoom.us/oauth", strict: true }
);

const MeetingSettingsSchema = z.object({
	allow_multiple_devices: z.boolean(),
	alternative_hosts: z.string().optional(),
	alternative_hosts_email_notification: z.boolean(),
	breakout_room: z.object({
		enable: z.boolean(),
		rooms: z.object({ name: z.string(), participants: z.string().array() }).array(),
	}),
	calendar_type: z.number(),
	contact_email: z.email(),
	contact_name: z.string(),
	continuous_meeting_chat: z.object({
		enable: z.boolean(),
		who_is_added: z.literal("all_users"),
	}),
	email_notification: z.boolean(),
	encryption_type: z.literal("enhanced_encryption"),
	host_save_video_order: z.boolean(),
	host_video: z.boolean(),
	join_before_host: z.boolean(),
	meeting_authentication: z.boolean(),
	meeting_invitees: z.object({ email: z.email() }).array(),
	mute_upon_entry: z.boolean(),
	participant_video: z.boolean(),
	private_meeting: z.boolean(),
	waiting_room: z.boolean(),
	watermark: z.boolean(),
});

export const zoomMainApiSchema = defineSchema(
	{
		/**
		 * @description Deletes a meeting.
		 * @see https://developers.zoom.us/docs/api/meetings/#tag/meetings/delete/meetings/%7BmeetingId%7D
		 */
		"@delete/meetings/:meetingId": {
			params: z.object({
				meetingId: z.number(),
			}),
		},

		/**
		 * @description Creates a meeting.
		 * @see https://developers.zoom.us/docs/api/meetings/#tag/meetings/post/users/%7BuserId%7D/meetings
		 */
		"@post/users/me/meetings": {
			body: z.object({
				agenda: z.string(),
				default_password: z.boolean(),
				duration: z.number(),
				password: z.string(),
				schedule_for: z.email(),
				settings: MeetingSettingsSchema,
				start_time: z.string(),
				timezone: z.string(),
				topic: z.string(),
				// 1 - An instant meeting. 2 - A scheduled meeting. 3 - A recurring meeting with no fixed time. 8 - A recurring meeting with fixed time. 10 - A screen share only meeting.
				type: z.literal([1, 2, 3, 8, 10]),
			}),

			data: z.object({
				chat_join_url: z.url(),
				duration: z.number(),
				id: z.number(),
				join_url: z.url(),
				registration_url: z.url(),
				start_time: z.string(),
				status: z.literal(["waiting", "started"]),
				topic: z.string(),
			}),
		},
	},
	{ baseURL: "https://api.zoom.us/v2", strict: true }
);
