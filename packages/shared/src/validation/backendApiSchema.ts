import { InsertUserSchema, SelectUserSchema } from "@medinfo/backend-db/schema/auth";
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

export const DiseaseSchema = z.object({
	/* eslint-disable perfectionist/sort-objects */
	name: z.string(),
	description: z.string(),
	/* eslint-enable perfectionist/sort-objects */
	image: z.url(),
	precautions: z.array(z.string()),
	symptoms: z.array(z.string()),
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

const withBaseSuccessResponse = <TSchemaObject extends z.ZodType>(dataSchema: TSchemaObject) =>
	z.object({
		...BaseSuccessResponseSchema.shape,
		data: dataSchema,
	});

const withBaseErrorResponse = <
	TSchemaObject extends z.ZodType = typeof BaseErrorResponseSchema.shape.errors,
>(
	errorSchema?: TSchemaObject
) =>
	z.object({
		...BaseErrorResponseSchema.shape,
		errors: (errorSchema ?? BaseErrorResponseSchema.shape.errors) as NonNullable<TSchemaObject>,
	});

const defaultSchemaRoute = defineSchemaRoutes({
	[fallBackRouteSchemaKey]: {
		errorData: withBaseErrorResponse(),
	},
});

const stringWithNumberValidation = () => {
	return z.preprocess((value: string) => Number(value), z.int().positive());
};

const healthTipRoutes = defineSchemaRoutes({
	"@get/health-tips/all": {
		data: withBaseSuccessResponse(
			z.array(HealthTipSchema.omit({ lastUpdated: true, mainContent: true }))
		),
		query: z.object({ limit: stringWithNumberValidation() }).partial().optional(),
	},

	"@get/health-tips/one/:id": {
		data: withBaseSuccessResponse(HealthTipSchema),
		params: z.object({ id: z.string() }),
	},
});

const diseaseRoutes = defineSchemaRoutes({
	"@delete/diseases/delete": {
		body: z.object({
			name: z.string(),
		}),
		data: withBaseSuccessResponse(z.null()),
	},

	"@get/diseases/all": {
		data: withBaseSuccessResponse(
			z.object({
				// eslint-disable-next-line perfectionist/sort-objects
				diseases: z.array(DiseaseSchema.pick({ name: true, description: true, image: true })),
				limit: z.int().positive(),
				page: z.int().positive(),
				total: z.number(),
			})
		),
		query: z
			.object({
				limit: stringWithNumberValidation(),
				page: stringWithNumberValidation(),
				random: z.preprocess((value: string) => {
					if (value === "true") {
						return true;
					}
					if (value === "false") {
						return false;
					}
					return value;
				}, z.boolean()),
			})
			.partial()
			.optional(),
	},

	"@get/diseases/one/:name": {
		data: withBaseSuccessResponse(DiseaseSchema),
		params: z.object({ name: z.string() }),
	},

	"@patch/diseases/update": {
		body: z.object({
			details: DiseaseSchema,
			name: z.string(),
		}),
		data: withBaseSuccessResponse(DiseaseSchema),
	},

	"@post/diseases/add": {
		body: z.object({
			details: DiseaseSchema,
		}),
		data: withBaseSuccessResponse(DiseaseSchema),
	},
});

const authRoutes = () => {
	const PasswordSchema = z.string().min(8, "Password must be at least 8 characters long");

	const PatientSchema = SelectUserSchema.pick({
		avatar: true,
		email: true,
		firstName: true,
		lastName: true,
		role: true,
	});

	const DoctorRequiredSchema = SelectUserSchema.pick({
		medicalCertificate: true,
		specialty: true,
	});

	// const DoctorSchema = z.object({
	// 	...PatientSchema.shape,
	// 	...DoctorRequiredSchema.shape,
	// 	medicalCertificate: DoctorRequiredSchema.shape.medicalCertificate.unwrap(),
	// 	role: z.literal("doctor"),
	// 	specialty: DoctorRequiredSchema.shape.specialty.unwrap(),
	// });

	const UserDataSchema = z.object({
		...PatientSchema.shape,
		...DoctorRequiredSchema.shape,
	});

	return defineSchemaRoutes({
		"@get/auth/session": {
			data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
		},

		"@get/auth/signout": {
			data: withBaseSuccessResponse(z.null()),
		},

		"@post/auth/signin": {
			body: InsertUserSchema.pick({
				email: true,
			}).extend({
				password: PasswordSchema,
			}),

			data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
		},

		"@post/auth/signup": {
			body: InsertUserSchema.pick({
				country: true,
				dob: true,
				email: true,
				firstName: true,
				gender: true,
				lastName: true,
				medicalCertificate: true,
				role: true,
				specialty: true,
			})
				.extend({
					password: PasswordSchema,
				})
				.superRefine((data, ctx) => {
					if (data.role === "doctor" && !data.medicalCertificate) {
						ctx.addIssue({
							code: "custom",
							message: "Medical certificate is required for doctors",
							path: ["medicalCertificate"],
						});
					}

					if (data.role === "doctor" && !data.specialty) {
						ctx.addIssue({
							code: "custom",
							message: "Specialty is required for doctors",
							path: ["specialty"],
						});
					}
				}),
			data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
		},
	});
};

export const backendApiSchema = defineSchema(
	{
		...defaultSchemaRoute,
		...diseaseRoutes,
		...healthTipRoutes,
		...authRoutes(),
	},
	{ strict: true }
);

export const backendApiSchemaRoutes = backendApiSchema.routes;

export type RouteSchemaKeys = Exclude<keyof typeof backendApiSchemaRoutes, FallBackRouteSchemaKey>;

export type BackendApiSchemaRoutes = Omit<typeof backendApiSchemaRoutes, FallBackRouteSchemaKey>;

export type DiseaseSchemaType = z.infer<typeof DiseaseSchema>;

export type HealthTipSchemaType = z.infer<typeof HealthTipSchema>;
