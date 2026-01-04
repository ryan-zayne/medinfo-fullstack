import { InsertAppointmentSchema, SelectAppointmentSchema } from "@medinfo/db/schema/appointments";
import { InsertUserSchema, SelectUserSchema } from "@medinfo/db/schema/auth";
import { InsertDiseaseSchema } from "@medinfo/db/schema/diseases";
import { fallBackRouteSchemaKey, type FallBackRouteSchemaKey } from "@zayne-labs/callapi/constants";
import { defineSchema, defineSchemaRoutes } from "@zayne-labs/callapi/utils";
import { z } from "zod";

const HealthTipSchema = z.object({
	id: z.string(),
	imageAlt: z.string(),
	imageUrl: z.string(),
	lastUpdated: z.string(),
	mainContent: z.array(
		z.object({
			content: z.string(),
			title: z.string(),
		})
	),
	title: z.string(),
});

const BaseSuccessResponseSchema = z.object({
	data: z.record(z.string(), z.unknown()),
	message: z.string(),
	status: z.literal("success"),
});

const BaseErrorResponseSchema = z.object({
	errors: z.record(z.string(), z.array(z.string())).optional(),
	message: z.string(),
	status: z.literal("error"),
});

export type BaseApiSuccessResponse<TData = z.infer<typeof BaseSuccessResponseSchema.shape.data>> = Omit<
	z.infer<typeof BaseSuccessResponseSchema>,
	"data"
> & {
	data: TData;
};

export type BaseApiErrorResponse<TErrors = z.infer<typeof BaseErrorResponseSchema>["errors"]> = Omit<
	z.infer<typeof BaseErrorResponseSchema>,
	"errors"
> & {
	errors: TErrors;
};

const withBaseSuccessResponse = <TSchemaObject extends z.ZodType>(dataSchema: TSchemaObject) => {
	return BaseSuccessResponseSchema.extend({
		data: dataSchema,
	});
};

const withBaseErrorResponse = <
	TSchemaObject extends z.ZodType = typeof BaseErrorResponseSchema.shape.errors,
>(
	errorSchema?: TSchemaObject
) => {
	return BaseErrorResponseSchema.extend({
		errors: (errorSchema ?? BaseErrorResponseSchema.shape.errors) as NonNullable<TSchemaObject>,
	});
};

const defaultSchemaRoute = defineSchemaRoutes({
	[fallBackRouteSchemaKey]: {
		errorData: withBaseErrorResponse(),
	},
});

const stringWithNumberValidation = () => {
	return z.preprocess((value: string) => Number(value), z.int().positive());
};

const stringWithBooleanValidation = () => {
	return z.preprocess((value: string) => {
		if (value === "true") {
			return true;
		}
		if (value === "false") {
			return false;
		}
		return value;
	}, z.boolean());
};

const healthTipRoutes = defineSchemaRoutes({
	"@get/health-tips/all": {
		data: withBaseSuccessResponse(
			z.array(
				HealthTipSchema.omit({
					lastUpdated: true,
					mainContent: true,
				})
			)
		),
		query: z
			.object({
				limit: stringWithNumberValidation(),
			})
			.partial()
			.optional(),
	},

	"@get/health-tips/one/:id": {
		data: withBaseSuccessResponse(HealthTipSchema),
		params: z.object({ id: z.string() }),
	},
});

const diseaseRoutes = defineSchemaRoutes({
	"@delete/diseases/delete": {
		body: InsertDiseaseSchema.pick({ name: true }),
		data: withBaseSuccessResponse(z.null()),
	},

	"@get/diseases/all": {
		data: withBaseSuccessResponse(
			z.object({
				diseases: z.array(
					// eslint-disable-next-line perfectionist/sort-objects
					InsertDiseaseSchema.pick({ name: true, description: true, image: true })
				),
				pagination: z.object({
					limit: z.int().positive(),
					page: z.int().positive(),
					total: z.int().positive(),
				}),
			})
		),
		query: z
			.object({
				limit: stringWithNumberValidation(),
				page: stringWithNumberValidation(),
				random: stringWithBooleanValidation(),
			})
			.partial()
			.optional(),
	},

	"@get/diseases/one/:name": {
		data: withBaseSuccessResponse(InsertDiseaseSchema),
		params: z.object({ name: z.string() }),
	},

	"@patch/diseases/update": {
		body: InsertDiseaseSchema.partial().extend({ name: InsertDiseaseSchema.shape.name }),
		data: withBaseSuccessResponse(InsertDiseaseSchema),
	},

	"@post/diseases/add": {
		body: InsertDiseaseSchema,
		data: withBaseSuccessResponse(InsertDiseaseSchema),
	},
});

const PasswordSchema = z.string().min(8, "Password must be at least 8 characters long");

export const SignUpSchema = InsertUserSchema.pick({
	dob: true,
	gender: true,
	role: true,
})
	.extend({
		country: z.string(),
		email: z.email("Please enter a valid email"),
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		medicalLicense: z.file().optional(),
		password: PasswordSchema,
		specialty: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.role === "doctor" && !data.medicalLicense) {
			ctx.addIssue({
				code: "custom",
				message: "Medical certificate is required for doctors",
				path: ["medicalLicense"],
			});
		}

		if (data.role === "doctor" && !data.specialty) {
			ctx.addIssue({
				code: "custom",
				message: "Specialty is required for doctors",
				path: ["specialty"],
			});
		}
	});

const authRoutes = () => {
	const PatientSchema = SelectUserSchema.pick({
		avatar: true,
		email: true,
		firstName: true,
		lastName: true,
		role: true,
	});

	const DoctorRequiredSchema = SelectUserSchema.pick({
		medicalLicense: true,
		specialty: true,
	});

	const UserDataSchema = z.object({
		...PatientSchema.shape,
		...DoctorRequiredSchema.shape,
	});

	return defineSchemaRoutes({
		"@get/auth/google": {
			data: withBaseSuccessResponse(z.object({ authURL: z.url() })),
			query: UserDataSchema.pick({ role: true }).superRefine((data, ctx) => {
				if (data.role === "doctor") {
					ctx.addIssue({
						code: "custom",
						message:
							"Doctors cannot signup with google due to requirements like license and specialty",
					});
				}
			}),
		},

		"@get/auth/google/callback": {
			query: z.object({
				code: z.string(),
				state: z.string(),
			}),
		},

		"@get/auth/session": {
			data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
		},

		"@get/auth/signout": {
			data: withBaseSuccessResponse(z.null()),
		},

		"@post/auth/signin": {
			body: z.object({
				email: z.email("Please enter a valid email"),
				password: PasswordSchema,
			}),
			data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
		},

		"@post/auth/signup": {
			body: z.instanceof(FormData),
			data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
		},
	});
};

export const DoctorUserSchema = SelectUserSchema.pick({
	avatar: true,
	country: true,
	email: true,
	firstName: true,
	fullName: true,
	gender: true,
	id: true,
	lastName: true,
	role: true,
	specialty: true,
}).extend({
	role: SelectUserSchema.shape.role.extract(["doctor"]),
	specialty: SelectUserSchema.shape.specialty.unwrap(),
});

const appointmentsRoutes = () => {
	const AppointmentDetailsSchema = SelectAppointmentSchema.pick({
		dateOfAppointment: true,
		id: true,
		meetingId: true,
		meetingURL: true,
		reason: true,
		status: true,
	});

	const PaginationSchema = z.object({
		limit: z.int().positive(),
		total: z.int().positive(),
	});

	return defineSchemaRoutes({
		"@delete/appointments/cancel": {
			body: SelectAppointmentSchema.pick({ meetingId: true }).extend({ appointmentId: z.string() }),
			data: withBaseSuccessResponse(z.null()),
		},

		"@get/appointments/doctor/all": {
			data: withBaseSuccessResponse(
				z.object({
					appointments: z.array(AppointmentDetailsSchema.extend({ patientName: z.string() })),
					pagination: PaginationSchema,
				})
			),

			query: z.object({ limit: stringWithNumberValidation() }).partial().optional(),
		},

		"@get/appointments/patient/all": {
			data: withBaseSuccessResponse(
				z.object({
					appointments: z.array(AppointmentDetailsSchema.extend({ doctorName: z.string() })),
					pagination: PaginationSchema,
				})
			),

			query: z.object({ limit: stringWithNumberValidation() }).partial().optional(),
		},

		"@post/appointments/book": {
			body: InsertAppointmentSchema.pick({
				allergies: true,
				dateOfAppointment: true,
				doctorId: true,
				existingMedicalConditions: true,
				healthInsurance: true,
				language: true,
				reason: true,
			}).extend({
				agreeToPrivacyPolicy: stringWithBooleanValidation(),
				allowEmailOrSMS: stringWithBooleanValidation(),
				allowInfoDisclosure: stringWithBooleanValidation(),
				allowTeleMedicine: stringWithBooleanValidation(),
				doctorId: z.string(),
				reason: z.string().min(1, "Must provide a reason for the appointment"),
			}),

			data: withBaseSuccessResponse(
				SelectAppointmentSchema.pick({
					dateOfAppointment: true,
					id: true,
					meetingId: true,
					meetingURL: true,
					reason: true,
					status: true,
				}).extend({
					doctorName: z.string(),
					patientName: z.string(),
				})
			),
		},

		"@post/appointments/match-doctor": {
			body: InsertAppointmentSchema.pick({ reason: true }),
			data: withBaseSuccessResponse(
				z.object({
					doctors: DoctorUserSchema.array(),
				})
			),
		},
	});
};
export const backendApiSchema = defineSchema(
	{
		...defaultSchemaRoute,
		...diseaseRoutes,
		...healthTipRoutes,
		...authRoutes(),
		...appointmentsRoutes(),
	},
	{ strict: true }
);

export const backendApiSchemaRoutes = backendApiSchema.routes;

export type RouteSchemaKeys = Exclude<keyof typeof backendApiSchemaRoutes, FallBackRouteSchemaKey>;

export type BackendApiSchemaRoutes = Omit<typeof backendApiSchemaRoutes, FallBackRouteSchemaKey>;

export type DiseaseSchemaType = z.infer<typeof InsertDiseaseSchema>;

export type HealthTipSchemaType = z.infer<typeof HealthTipSchema>;

export type DoctorUserSchemaType = z.infer<typeof DoctorUserSchema>;
