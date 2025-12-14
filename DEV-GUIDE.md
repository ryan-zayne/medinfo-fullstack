# MedInfo Developer Guide

A comprehensive guide to the MedInfo codebase - a full-stack healthcare platform built with TypeScript.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Monorepo Architecture](#monorepo-architecture)
3. [Getting Started](#getting-started)
4. [Backend Deep Dive](#backend-deep-dive)
5. [Frontend Deep Dive](#frontend-deep-dive)
6. [Shared Packages](#shared-packages)
7. [Authentication System](#authentication-system)
8. [API Patterns](#api-patterns)
9. [Code Conventions](#code-conventions)
10.   [Common Workflows](#common-workflows)

---

## Project Overview

MedInfo Nigeria is a healthcare platform that:

- Connects patients with certified doctors for virtual consultations
- Provides a free medical information library (diseases, health tips)
- Supports appointment scheduling and messaging

### Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Monorepo   | Turborepo + pnpm workspaces                  |
| Backend    | Hono.js on Node.js                           |
| Frontend   | Next.js 16 (App Router) + React 19           |
| Database   | PostgreSQL + Drizzle ORM                     |
| Validation | Zod (shared across stack)                    |
| Styling    | TailwindCSS 4 + tailwind-variants            |
| State      | TanStack Query + Zustand                     |
| Auth       | JWT (access + refresh tokens) + Google OAuth |

---

## Monorepo Architecture

```
medinfo-fullstack/
├── apps/
│   ├── backend/                 # @medinfo/backend - Hono API server
│   │   └── src/
│   │       ├── app/            # Feature modules (auth, diseases, health-tips, appointments)
│   │       ├── config/         # Environment, CORS settings
│   │       ├── lib/            # Shared utilities, types, factory
│   │       ├── middleware/     # Global middleware
│   │       ├── services/       # Shared services (cloudinary)
│   │       ├── app.ts          # Route composition
│   │       └── server.ts       # Entry point
│   │
│   └── frontend/               # @medinfo/frontend - Next.js app
│       ├── app/                # App Router pages
│       │   ├── (primary)/      # Public routes (landing, auth, library)
│       │   └── dashboard/      # Protected routes (patient, doctor)
│       ├── components/         # Reusable components
│       │   ├── common/         # Shared (Logo, NavLink, Show, For, etc.)
│       │   ├── icons/          # SVG icon components
│       │   └── ui/             # UI primitives (Button, Form, Select, etc.)
│       └── lib/                # Utilities
│           ├── api/            # API client (callBackendApi)
│           ├── react-query/    # Query/mutation options
│           ├── utils/          # Helpers (cn, common)
│           └── zustand/        # State stores
│
└── packages/
    ├── db/                     # @medinfo/backend-db - Drizzle ORM layer
    │   └── src/
    │       ├── schema/         # Table definitions (auth.ts)
    │       ├── migrations/     # SQL migrations
    │       └── db.ts           # Database connection
    │
    ├── env/                    # @medinfo/env - Environment validation
    │   └── src/
    │       └── backend-env.ts  # Zod schema for env vars
    │
    └── shared/                 # @medinfo/shared - Shared code
        └── src/
            └── validation/     # API schemas (backendApiSchema.ts)
```

### Package Dependencies

```
@medinfo/frontend  ──→  @medinfo/shared  ──→  @medinfo/backend-db
@medinfo/backend   ──→  @medinfo/shared  ──→  @medinfo/backend-db
@medinfo/backend   ──→  @medinfo/env
```

**Rule**: Code flows from `packages/` to `apps/`, never the reverse.

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.25.0 (`corepack enable`)
- PostgreSQL database

### Installation

```bash
# Clone and install
git clone <repo-url>
cd medinfo-fullstack
pnpm install

# Setup backend environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your values

# Database setup
pnpm db:generate    # Generate types from schema
pnpm db:migrate     # Run migrations
pnpm db:push        # Push schema directly (dev only)

# Start development
pnpm dev:backend    # http://localhost:8000
pnpm dev:frontend   # http://localhost:3000
```

### Available Scripts

```bash
# Root level
pnpm dev:backend          # Start backend dev server
pnpm dev:frontend         # Start frontend dev server
pnpm build                # Build all packages
pnpm lint:eslint          # Lint entire monorepo
pnpm lint:type-check      # Type check all packages

# Database
pnpm db:generate          # Generate Drizzle types
pnpm db:migrate           # Run migrations
pnpm db:push              # Push schema (dev)
pnpm db:studio            # Open Drizzle Studio GUI
```

---

## Backend Deep Dive

### Hono App Factory

The app is created using a factory pattern in `src/lib/factory/createHonoApp.ts`:

```typescript
// Creates a configured Hono instance with global middleware
const createHonoApp = () => {
	const app = new Hono();

	// Security
	app.use(cors(corsOptions)); // Configured in config/corsOptions.ts

	// Logging
	app.use(requestId(), pinoLoggerMiddleware());

	// Error handling
	app.notFound(notFoundHandler);
	app.onError(errorHandler);

	return app;
};
```

### Route Composition

Routes are composed in `src/app.ts`:

```typescript
const app = createHonoApp();

// Health check
app.get("/", (c) => c.json({ status: "success", message: "Server is up!" }));

// API v1 routes
app.basePath("/api/v1")
	.route("", healthTipsRoutes)
	.route("", diseasesRoutes)
	.route("", authRoutes)
	.route("", appointmentsRoutes);
```

### Feature Module Structure

Each feature follows this pattern:

```
src/app/auth/
├── routes.ts              # Route definitions
├── middleware/            # Feature-specific middleware
│   └── authMiddleware/
│       ├── index.ts
│       ├── authMiddleware.ts
│       └── validateUserSession.ts
└── services/              # Business logic
    ├── common.ts          # Shared helpers
    ├── constants.ts       # Feature constants
    ├── cookie.ts          # Cookie management
    ├── hash.ts            # Password hashing
    ├── oauth.ts           # Google OAuth logic
    └── token.ts           # JWT operations
```

### Route Definition Pattern

```typescript
// src/app/auth/routes.ts
const authRoutes = new Hono()
	.basePath("/auth")
	.post(
		"/signin",
		validateWithZodMiddleware("json", backendApiSchemaRoutes["@post/auth/signin"].body),
		async (ctx) => {
			const { email, password } = ctx.req.valid("json");

			// Business logic...
			const [currentUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

			if (!currentUser) {
				throw new AppError({
					cause: "No user found",
					code: 401,
					message: "Email or password is incorrect",
				});
			}

			// Return standardized response
			return AppJsonResponse(ctx, {
				data: { user: getNecessaryUserDetails(currentUser) },
				message: "Signed in successfully",
				schema: backendApiSchemaRoutes["@post/auth/signin"].data,
			});
		}
	);
```

### Error Handling with AppError

```typescript
// src/lib/utils/AppError.ts
class AppError extends Error {
	errors?: unknown;
	errorStatus: string;
	statusCode: ContentfulStatusCode;

	constructor(options: { code: ContentfulStatusCode; errors?: unknown; message: string }) {
		super(options.message, { cause: options.cause });
		this.statusCode = options.code;
		this.errorStatus = String(options.code).startsWith("5") ? "Failed" : "Error";
		this.errors = options.errors;
	}

	static isError(error: unknown): error is AppError {
		return error instanceof AppError;
	}
}

// Usage
throw new AppError({
	code: 404,
	message: "User not found",
});

throw new AppError({
	code: 422,
	message: "Validation failed",
	errors: { email: ["Invalid email format"] },
});
```

### Error Codes

```typescript
// src/constants/common.ts
export const errorCodes = defineEnum({
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	VALIDATION_ERROR: 422,
	SERVER_ERROR: 500,
});
```

### Validation Middleware

```typescript
// src/middleware/validateWithZodMiddleware.ts
export const validateWithZodMiddleware = <
	TTarget extends keyof ValidationTargets,
	TSchema extends z.ZodType,
>(
	target: TTarget, // "json" | "query" | "param"
	schema: TSchema
) => {
	return validator(target, (value) => {
		const validatedValue = getValidatedValue(value, schema, target);
		return validatedValue;
	});
};

// getValidatedValue throws AppError with formatted messages on failure
// Example error: "(JSON) Validation Error: ✖ Invalid email → at email"
```

### Response Standardization

```typescript
// src/lib/utils/AppJsonResponse.ts
const AppJsonResponse = <TSchema, TDataSchema>(
	ctx: Context,
	options: {
		code?: ContentfulStatusCode; // Default: 200
		data: z.infer<TDataSchema>;
		message: string;
		schema: TSchema; // Validates response data
	}
) => {
	const validatedData = getValidatedValue(data, schema.shape.data, "data");

	return ctx.json(
		{
			status: "success",
			message,
			data: validatedData,
		},
		statusCode
	);
};
```

### Cookie Management

```typescript
// src/app/auth/services/cookie.ts
type PossibleCookieNames =
	| "google_code_verifier"
	| "google_oauth_state"
	| "zayneAccessToken"
	| "zayneRefreshToken";

export const setCookie = (
	ctx: Context,
	name: PossibleCookieNames,
	value: string,
	options?: CookieOptions
) => {
	const isProduction = ENVIRONMENT.NODE_ENV === "production";

	cookieHelpers.setCookie(ctx, name, value, {
		httpOnly: true,
		partitioned: isProduction,
		sameSite: isProduction ? "none" : "lax",
		secure: isProduction,
		...options,
	});
};
```

### JWT Token Services

```typescript
// src/app/auth/services/token.ts

// Encode with validation
export const encodeJwtToken = <TSchema>(payload: z.infer<TSchema>, options: JwtOptions) => {
	const validPayload = getValidatedValue(payload, schema);
	return jwt.sign(validPayload, secretKey, restOfOptions);
};

// Generate access token (short-lived)
export const generateAccessToken = (user: SelectUserType) => {
	const payload = pickKeys(user, ["id"]);
	const accessToken = encodeJwtToken(payload, {
		expiresIn: ENVIRONMENT.ACCESS_JWT_EXPIRES_IN,
		secretKey: ENVIRONMENT.ACCESS_SECRET,
	});
	return { token: accessToken, expiresAt: new Date(Date.now() + expiresIn) };
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (user: SelectUserType) => {
	// Similar to access token but with REFRESH_SECRET and longer expiry
};

// Token whitelist management (for refresh token rotation)
export const getUpdatedTokenArray = (options: {
	currentUser: SelectUserType;
	zayneRefreshToken: string | undefined;
}): string[] => {
	// If token not in whitelist, possible reuse attack - clear all tokens
	if (!isTokenInWhitelist(currentUser.refreshTokenArray, zayneRefreshToken)) {
		warnAboutTokenReuse({ compromisedToken: zayneRefreshToken, currentUser });
		return []; // Logs out from all devices
	}
	// Remove used token from array
	return currentUser.refreshTokenArray.filter((token) => token !== zayneRefreshToken);
};
```

---

## Frontend Deep Dive

### App Router Structure

```
app/
├── (primary)/                    # Route group - public pages
│   ├── -components/              # Private components (prefixed with -)
│   │   ├── OAuthSection.tsx
│   │   └── ...
│   ├── signin/page.tsx
│   ├── signup/page.tsx
│   ├── daily-tips/
│   ├── library/
│   ├── forgot-password/
│   ├── layout.tsx               # Shared layout with navbar
│   └── page.tsx                 # Landing page
│
├── dashboard/                    # Protected routes
│   ├── -components/
│   ├── patient/
│   │   ├── -components/
│   │   ├── appointment/
│   │   ├── community/
│   │   ├── messages/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── doctor/
│       └── ...                  # Similar structure
│
├── layout.tsx                   # Root layout
├── Providers.tsx                # Client providers wrapper
└── HydrationBoundary.tsx        # React Query hydration
```

### Providers Setup

```typescript
// app/Providers.tsx
"use client";

function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary queryClient={queryClient}>
      <ProgressProvider
        height="2.5px"
        color="hsl(150,21%,17%)"
        options={{ showSpinner: true }}
        shallowRouting={true}
      >
        {children}
      </ProgressProvider>
      <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} />
    </HydrationBoundary>
  );
}
```

### API Client Configuration

```typescript
// lib/api/callBackendApi/callBackendApi.ts
const REMOTE_BACKEND_HOST = "https://api-medical-info.onrender.com";
const LOCAL_BACKEND_HOST = "http://localhost:8000";
const BACKEND_HOST = process.env.NODE_ENV === "development" ? LOCAL_BACKEND_HOST : REMOTE_BACKEND_HOST;

export const BASE_API_URL = `${BACKEND_HOST}/api/v1`;

export const sharedBaseConfig = defineBaseConfig({
	baseURL: BASE_API_URL,
	credentials: "include", // Send cookies with requests

	// Request deduplication
	dedupe: {
		cacheScope: "global",
		cacheScopeKey: (ctx) => ctx.options.baseURL,
	},

	// Plugins for cross-cutting concerns
	plugins: [
		toastPlugin({ errorAndSuccess: true, errorsToSkip: ["AbortError"] }),
		loggerPlugin({ enabled: { onError: true } }),
	],

	resultMode: "withoutResponse",
	schema: backendApiSchema, // Type-safe routes from shared package
});

// Standard client - returns { data, error }
export const callBackendApi = createFetchClient(sharedBaseConfig);

// For React Query - throws on error, returns data directly
export const callBackendApiForQuery = createFetchClient({
	...sharedBaseConfig,
	resultMode: "onlyData",
	throwOnError: true,
});
```

### Toast Plugin

```typescript
// lib/api/callBackendApi/plugins/toastPlugin.ts
export type ToastPluginMeta = {
	toast?: {
		endpointsToSkip?: { error?: string[]; success?: string[] };
		error?: boolean;
		errorAndSuccess?: boolean;
		errorsToSkip?: Array<string>;
		success?: boolean;
	};
};

export const toastPlugin = (toastOptions?: ToastPluginMeta["toast"]) => {
	return definePlugin({
		id: "toast-plugin",
		hooks: (setupCtx) => ({
			onError: (ctx) => {
				// Skip if configured
				if (shouldSkipErrorToast) return;

				// Show field errors individually
				if (isHTTPError(ctx.error) && ctx.error.errorData.errors) {
					Object.values(ctx.error.errorData.errors).forEach((message) => toast.error(message));
					return;
				}
				toast.error(ctx.error.message);
			},

			onSuccess: (ctx) => {
				if (shouldSkipSuccessToast) return;
				toast.success(ctx.data.message);
			},
		}),
	});
};
```

### React Query Patterns

```typescript
// lib/react-query/queryOptions.ts
export const healthTipsQuery = (options: { pageName?: string } = {}) => {
	const { pageName = "home-page" } = options;

	return queryOptions({
		queryKey: ["health-tips", pageName],
		queryFn: () =>
			callBackendApiForQuery("@get/health-tips/all", {
				meta: { toast: { success: false } }, // Don't toast on success
				query: { limit: 8 },
			}),
		staleTime: Infinity, // Cache forever
	});
};

// lib/react-query/mutationOptions.ts
export const googleOAuthMutation = () => {
	return mutationOptions({
		mutationKey: ["auth", "google"],
		mutationFn: (options: { role: "doctor" | "patient" }) => {
			return callBackendApiForQuery("@get/auth/google", {
				meta: { toast: { success: false } },
				query: { role: options.role },
			});
		},
	});
};

// Usage in component
const googleAuthMutation = useMutation(googleOAuthMutation());

googleAuthMutation.mutate({ role: "patient" }, { onSuccess: (data) => router.push(data.data.authURL) });
```

### Form Pattern with React Hook Form + Zod

```typescript
// app/(primary)/signin/page.tsx
"use client";

const SignInSchema = backendApiSchemaRoutes["@post/auth/signin"].body;

function SignInPage() {
  const router = useRouter();

  const methods = useForm({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(SignInSchema),
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    await callBackendApi("@post/auth/signin", {
      body: data,
      meta: { toast: { success: true } },
      onSuccess: () => router.push(`/dashboard/${userRole}`),
    });
  });

  return (
    <Form.Root methods={methods} onSubmit={(e) => void onSubmit(e)}>
      <Form.Field control={control} name="email" className="gap-1">
        <Form.Label>Email</Form.Label>
        <Form.InputGroup className="...">
          <Form.InputLeftItem>
            <IconBox icon="mynaui:envelope" />
          </Form.InputLeftItem>
          <Form.Input type="email" placeholder="enter email" />
        </Form.InputGroup>
        <Form.ErrorMessage />
      </Form.Field>

      <Form.WatchFormState
        render={(formState) => (
          <Button
            type="submit"
            isLoading={formState.isSubmitting}
            disabled={formState.isSubmitting}
          >
            Sign In
          </Button>
        )}
      />
    </Form.Root>
  );
}
```

### Component Library

**Common Components** (`components/common/`):

- `Logo` - App logo with variants
- `NavLink` - Next.js Link with transition support
- `IconBox` - Iconify icon wrapper
- `Show` - Conditional rendering (`<Show.Root when={condition}>`)
- `For` / `ForWithWrapper` - List rendering helpers
- `Switch` - Switch/case rendering
- `Await` - Async data rendering
- `Overlay` - Modal overlay
- `DropZoneInput` - File upload with drag & drop

**UI Components** (`components/ui/`):

- `Button` - With loading state, themes, sizes
- `Form` - React Hook Form integration
- `Select` - Radix-based select
- `Dialog` - Modal dialogs
- `Accordion` - Collapsible sections
- `Carousel` - Embla carousel wrapper
- `DateTimePicker` - Date selection
- `DropdownMenu` - Context menus
- `Popover` - Floating content

---

## Shared Packages

### @medinfo/backend-db

Database layer using Drizzle ORM with PostgreSQL.

```typescript
// packages/db/src/schema/auth.ts
export const users = pg.pgTable(
	"users",
	{
		id: pg.uuid().defaultRandom().primaryKey(),
		email: pg.text().notNull().unique(),
		passwordHash: pg.text(),
		firstName: pg.text().notNull(),
		lastName: pg.text().notNull(),
		avatar: pg.text().notNull(),
		dob: pg.timestamp({ mode: "string", withTimezone: true }).notNull(),
		gender: pg.text({ enum: ["male", "female"] }).notNull(),
		role: pg.text({ enum: ["doctor", "patient"] }).notNull(),
		country: pg.text(),

		// Doctor-specific
		medicalLicense: pg.text(),
		specialty: pg.text(),

		// OAuth
		googleId: pg.text(),

		// Security
		isSuspended: pg.boolean().notNull().default(false),
		loginRetryCount: pg.integer().notNull().default(0),
		refreshTokenArray: pg.jsonb().notNull().$type<string[]>().default([]),

		// Timestamps
		emailVerifiedAt: pg.timestamp({ withTimezone: true }),
		lastLoginAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
		createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
		updatedAt: pg
			.timestamp({ withTimezone: true })
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		deletedAt: pg.timestamp({ withTimezone: true }),
	},
	(table) => [pg.uniqueIndex("user_google_id_index").on(table.googleId)]
);

// Auto-generate Zod schemas from Drizzle
export const InsertUserSchema = createInsertSchema(users);
export const SelectUserSchema = createSelectSchema(users);

// Infer TypeScript types
export type InsertUserType = typeof users.$inferInsert;
export type SelectUserType = typeof users.$inferSelect;
```

**Database Operations**:

```typescript
// Query
const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

// Insert with returning
const [newUser] = await db.insert(users).values({ ... }).returning();

// Update
await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));

// Increment
await db.update(users).set({ loginRetryCount: sql`${users.loginRetryCount} + 1` });
```

### @medinfo/env

Environment variable validation with Zod.

```typescript
// packages/env/src/backend-env.ts
export const envSchema = z.object({
	ACCESS_JWT_EXPIRES_IN: z.string().transform((value) => evaluateString<number>(value)),
	ACCESS_SECRET: z.string(),
	BASE_BACKEND_HOST: z.url(),
	BASE_FRONTEND_HOST: z.url(),
	CLOUDINARY_API_KEY: z.string(),
	CLOUDINARY_API_SECRET: z.string(),
	CLOUDINARY_CLOUD_NAME: z.string(),
	DATABASE_URL_DEV: z.string(),
	DATABASE_URL_PROD: z.string(),
	// ...some more...
});

export const getBackendEnv = () => {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		const missingKeys = Object.keys(z.flattenError(result.error).fieldErrors);
		throw new Error(`Missing required environment variable(s):\n → ${missingKeys.join("\n → ")}`);
	}

	return result.data;
};
```

### @medinfo/shared

Shared validation schemas that define the API contract between frontend and backend.

```typescript
// packages/shared/src/validation/backendApiSchema.ts

// Response wrappers
const withBaseSuccessResponse = <TSchema extends z.ZodType>(dataSchema: TSchema) =>
	z.object({
		status: z.literal("success"),
		message: z.string(),
		data: dataSchema,
	});

const withBaseErrorResponse = <TSchema extends z.ZodType>(errorSchema?: TSchema) =>
	z.object({
		status: z.literal("error"),
		message: z.string(),
		errors: errorSchema ?? z.record(z.string(), z.array(z.string())).optional(),
	});

// Route definitions
const authRoutes = defineSchemaRoutes({
	"@post/auth/signin": {
		body: z.object({
			email: z.email("Please enter a valid email"),
			password: z.string().min(8, "Password must be at least 8 characters"),
		}),
		data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
	},

	"@post/auth/signup": {
		body: z.instanceof(FormData), // Multipart for file upload
		data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
	},

	"@get/auth/session": {
		data: withBaseSuccessResponse(z.object({ user: UserDataSchema })),
	},

	"@get/auth/google": {
		query: UserDataSchema.pick({ role: true }).superRefine((data, ctx) => {
			if (data.role === "doctor") {
				ctx.addIssue({
					code: "custom",
					message: "Doctors cannot signup with google due to license requirements",
				});
			}
		}),
		data: withBaseSuccessResponse(z.object({ authURL: z.url() })),
	},

	"@get/auth/google/callback": {
		query: z.object({ code: z.string(), state: z.string() }),
	},
});

// Combine all routes
export const backendApiSchema = defineSchema(
	{
		...defaultSchemaRoute, // Fallback error schema
		...diseaseRoutes,
		...healthTipRoutes,
		...authRoutes(),
	},
	{ strict: true }
);

export const backendApiSchemaRoutes = backendApiSchema.routes;
```

**Route Naming Convention**:

```
@{method}/{resource}/{action}/:param

@get/auth/session          # GET /api/v1/auth/session
@post/auth/signin          # POST /api/v1/auth/signin
@get/diseases/all          # GET /api/v1/diseases/all
@get/diseases/one/:name    # GET /api/v1/diseases/one/diabetes
@patch/diseases/update     # PATCH /api/v1/diseases/update
@delete/diseases/delete    # DELETE /api/v1/diseases/delete
```

---

## Authentication System

### Overview

MedInfo uses a dual-token JWT system with refresh token rotation:

- **Access Token**: Short-lived (15 min), stored in HTTP-only cookie
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie + database whitelist

### Auth Middleware Flow

```typescript
// src/app/auth/middleware/authMiddleware/authMiddleware.ts
const authMiddleware = createMiddleware<HonoAppBindings>(async (ctx, next) => {
  const zayneAccessToken = getCookie(ctx, "zayneAccessToken");
  const zayneRefreshToken = getCookie(ctx, "zayneRefreshToken");

  const { currentUser, newZayneAccessTokenResult } = await validateUserSession({
    zayneAccessToken,
    zayneRefreshToken,
  });

  // Sil refresh access token if nef (newZayneAccessToken   setCookie(ctx, "zayneAccessToken", newZayneAccessTokenResult.token, {
      expires: newZayneAccessTokenResult.expiresAt,
    });
  }

  ctx.set("currentUser", currentUser);
  await next();
});
```

### Session Validation Logic

```typescript
// src/app/auth/middleware/authMiddleware/validateUserSession.ts
const validateUserSession = async (tokens: TokenPairFromCookies) => {
	const { zayneAccessToken, zayneRefreshToken } = tokens;

	// No refresh token = unauthorized
	if (!zayneRefreshToken) {
		throw new AppError({ code: 401, message: "Unauthorized" });
	}

	// No access token = try refresh
	if (!zayneAccessToken) {
		return await refreshUserSession(zayneRefreshToken);
	}

	try {
		// Validate access token
		return await getExistingSession({ zayneAccessToken, zayneRefreshToken });
	} catch (error) {
		// Access token expired/invalid = try refresh
		if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
			return await refreshUserSession(zayneRefreshToken);
		}
		throw error;
	}
};
```

### Token Reuse Detection

```typescript
// If refresh token is valid but NOT in user's whitelist array:
// - Possible token theft/reuse attack
// - Clear ALL tokens (logout from all devices)
// - Log the incident

if (!isTokenInWhitelist(currentUser.refreshTokenArray, zayneRefreshToken)) {
	warnAboutTokenReuse({ compromisedToken: zayneRefreshToken, currentUser });

	await db.update(users).set({ refreshTokenArray: [] }).where(eq(users.id, userId));

	throw new AppError({ code: 401, message: "Invalid session. Please log in again!" });
}
```

### Google OAuth Flow

```typescript
// 1. Frontend initiates OAuth
const { data } = await callBackendApi("@get/auth/google", { query: { role: "patient" } });
router.push(data.authURL);

// 2. Backend creates auth URL (src/app/auth/services/oauth.ts)
export const createGoogleAuthURL = () => {
	const state = arctic.generateState();
	const codeVerifier = arctic.generateCodeVerifier();
	const scopes = ["openid", "profile", "email", "..."];

	const authUrlObject = google.createAuthorizationURL(state, codeVerifier, scopes);

	// Store state/verifier in cookies for callback validation
	return { authURL: authUrlObject.toString(), codeVerifier, state, cookiesExpireAt };
};

// 3. Google redirects to /auth/google/callback
// 4. Backend validates state, exchanges code for tokens
// 5. Get user info from Google People API (gender, birthday)
// 6. Find existing user or create new one
// 7. Generate JWT tokens, set cookies, redirect to dashboard
```

### User Details Filtering

```typescript
// src/app/auth/services/constants.ts
export const necessaryUserDetails = defineEnum([
	"firstName",
	"lastName",
	"email",
	"avatar",
	"role",
	"medicalLicense",
	"specialty",
] satisfies Array<keyof SelectUserType>);

// src/app/auth/services/common.ts
export const getNecessaryUserDetails = (user: SelectUserType, keys: Array<keyof SelectUserType> = []) => {
	return pickKeys(user, [...necessaryUserDetails, ...keys]);
};

// Never expose: passwordHash, refreshTokenArray, googleId, etc.
```

---

## API Patterns

### Request/Response Examples

**Sign In**:

```typescript
// Request
POST /api/v1/auth/signin
Content-Type: application/json

{ "email": "user@example.com", "password": "password123" }

// Success Response (200)
{
  "status": "success",
  "message": "Signed in successfully",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "avatar": "https://...",
      "role": "patient",
      "medicalLicense": null,
      "specialty": null
    }
  }
}

// Error Response (401)
{
  "status": "error",
  "message": "Email or password is incorrect"
}
```

**Sign Up (Multipart)**:

```typescript
// Request
POST /api/v1/auth/signup
Content-Type: multipart/form-data

firstName: John
lastName: Doe
email: doctor@example.com
password: password123
gender: male
dob: 1990-01-15
country: Nigeria
role: doctor
specialty: Cardiology
medicalLicense: [File]

// Response includes same user object
```

**Paginated List**:

```typescript
// Request
GET /api/v1/diseases/all?page=1&limit=10&random=false

// Response
{
  "status": "success",
  "message": "Diseases retrieved successfully",
  "data": {
    "diseases": [
      { "name": "Diabetes", "description": "...", "image": "https://..." },
      // ...
    ],
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

### Adding a New API Route

1. **Define schema** in `packages/shared/src/validation/backendApiSchema.ts`:

```typescript
const newFeatureRoutes = defineSchemaRoutes({
	"@get/feature/list": {
		query: z.object({ limit: z.number().optional() }),
		data: withBaseSuccessResponse(z.array(FeatureSchema)),
	},
	"@post/feature/create": {
		body: CreateFeatureSchema,
		data: withBaseSuccessResponse(FeatureSchema),
	},
});

// Add to backendApiSchema
export const backendApiSchema = defineSchema({
	...existingRoutes,
	...newFeatureRoutes,
});
```

2. **Create feature module** in `apps/backend/src/app/feature/`:

```typescript
// routes.ts
const featureRoutes = new Hono()
	.basePath("/feature")
	.get("/list", validateWithZodMiddleware("query", schema.query), async (ctx) => {
		// Implementation
		return AppJsonResponse(ctx, { data, message, schema: schema.data });
	});

export { featureRoutes };
```

3. **Register route** in `apps/backend/src/app.ts`:

```typescript
app.basePath("/api/v1")
	.route("", featureRoutes) // Add here
	.route("", existingRoutes);
```

4. **Use in frontend** - types are automatically available:

```typescript
const { data } = await callBackendApi("@get/feature/list", {
	query: { limit: 10 },
});
// data is fully typed!
```

---

## Code Conventions

### File Naming

| Type            | Convention                         | Example               |
| --------------- | ---------------------------------- | --------------------- |
| Components      | PascalCase                         | `UserProfile.tsx`     |
| Utilities       | camelCase                          | `formatDate.ts`       |
| Constants       | camelCase file, UPPER_SNAKE values | `errorCodes.ts`       |
| Types           | PascalCase with suffix             | `SelectUserType`      |
| Private folders | Prefix with `-`                    | `-components/`        |
| Index exports   | `index.ts`                         | Re-export from folder |

### Import Order

```typescript
// 1. External packages
import { Hono } from "hono";
import { z } from "zod";

// 2. Monorepo packages
import { db } from "@medinfo/backend-db";
import { backendApiSchemaRoutes } from "@medinfo/shared/validation/backendApiSchema";

// 3. Path aliases (@/)
import { AppError, AppJsonResponse } from "@/lib/utils";
import { authMiddleware } from "@/app/auth/middleware/authMiddleware";

// 4. Relative imports
import { hashValue } from "./services/hash";
```

### TypeScript Patterns

```typescript
// Use Zod for runtime validation + type inference
const SignInSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});
type SignInData = z.infer<typeof SignInSchema>;

// Use defineEnum for type-safe constants
export const errorCodes = defineEnum(
	{
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
	},
	{ unionVariant: "values" }
);

type ErrorCodesUnion = typeof errorCodes.$inferUnion; // 400 | 401

// Use pickKeys for safe object subsetting
const userDetails = pickKeys(user, ["firstName", "lastName", "email"]);

// Prefer explicit return types for public functions
export const generateAccessToken = (user: SelectUserType): { expiresAt: Date; token: string } => {
	// ...
};
```

### Component Patterns

```tsx
// Server Component (default)
async function ServerPage() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
"use client";
function ClientComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}

// Conditional rendering with Show
<Show.Root when={isLoggedIn}>
  <UserProfile />
</Show.Root>

// List rendering with For
<For each={items} renderItem={(item, index) => (
  <li key={item.id}>{item.name}</li>
)} />

// Form with loading state
<Form.WatchFormState
  render={(formState) => (
    <Button
      type="submit"
      isLoading={formState.isSubmitting}
      disabled={formState.isSubmitting}
    >
      Submit
    </Button>
  )}
/>
```

### Error Handling

```typescript
// Backend: Always use AppError
throw new AppError({
	code: 404,
	message: "User not found",
	cause: originalError, // Optional, for logging
});

// With validation errors
throw new AppError({
	code: 422,
	message: "Validation failed",
	errors: { email: ["Invalid format"], password: ["Too short"] },
});

// Frontend: Let toast plugin handle errors
await callBackendApi("@post/auth/signin", {
	body: data,
	meta: { toast: { errorAndSuccess: true } }, // Auto-toast
});

// Or handle manually
const { data, error } = await callBackendApi("@post/auth/signin", { body });

if (error) {
	// Custom error handling
}
```

---

## Common Workflows

### Adding a New Database Table

1. **Define schema** in `packages/db/src/schema/`:

```typescript
// packages/db/src/schema/appointments.ts
export const appointments = pg.pgTable("appointments", {
	id: pg.uuid().defaultRandom().primaryKey(),
	patientId: pg
		.uuid()
		.references(() => users.id)
		.notNull(),
	doctorId: pg
		.uuid()
		.references(() => users.id)
		.notNull(),
	scheduledAt: pg.timestamp({ withTimezone: true }).notNull(),
	status: pg.text({ enum: ["pending", "confirmed", "cancelled"] }).notNull(),
	createdAt: pg.timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const InsertAppointmentSchema = createInsertSchema(appointments);
export const SelectAppointmentSchema = createSelectSchema(appointments);
export type InsertAppointmentType = typeof appointments.$inferInsert;
export type SelectAppointmentType = typeof appointments.$inferSelect;
```

2. **Export from index**:

```typescript
// packages/db/src/schema/index.ts
export * from "./auth";
export * from "./appointments";
```

3. **Generate and run migration**:

```bash
pnpm db:generate   # Creates migration file
pnpm db:migrate    # Applies migration
```

### Adding a New Frontend Page

1. **Create page file**:

```tsx
// app/(primary)/new-page/page.tsx
import { Main } from "../-components";

function NewPage() {
	return (
		<Main>
			<h1>New Page</h1>
		</Main>
	);
}

export default NewPage;
```

2. **For client interactivity**:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { healthTipsQuery } from "@/lib/react-query/queryOptions";

function NewPage() {
	const { data, isLoading } = useQuery(healthTipsQuery());

	if (isLoading) return <Spinner />;

	return <div>{/* Use data */}</div>;
}
```

### Adding Protected Routes

1. **Check session in layout or page**:

```tsx
// app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth"; // Your session helper

async function DashboardLayout({ children }) {
	const session = await getSession();

	if (!session) {
		redirect("/signin");
	}

	return <div>{children}</div>;
}
```

### Debugging Tips

**Backend**:

```bash
# Check logs with pino-pretty formatting
pnpm dev:backend

# Database queries are logged by default
# Look for SQL in console output
```

**Frontend**:

```bash
# React Query Devtools (bottom-left button)
# Shows all queries, cache state, refetch status

# Network tab for API calls
# Check cookies are being sent (credentials: include)
```

**Common Issues**:

| Issue                           | Solution                                        |
| ------------------------------- | ----------------------------------------------- |
| CORS errors                     | Check `corsOptions.ts` includes frontend origin |
| Cookies not sent                | Ensure `credentials: "include"` in fetch        |
| Type errors after schema change | Run `pnpm db:generate`                          |
| Auth middleware fails           | Check both cookies exist, tokens not expired    |
| Google OAuth fails              | Verify callback URL matches Google Console      |

---

## External Dependencies

### Key Libraries

| Package                 | Purpose                | Docs                                                   |
| ----------------------- | ---------------------- | ------------------------------------------------------ |
| `hono`                  | Backend framework      | [hono.dev](https://hono.dev)                           |
| `drizzle-orm`           | Database ORM           | [orm.drizzle.team](https://orm.drizzle.team)           |
| `zod`                   | Schema validation      | [zod.dev](https://zod.dev)                             |
| `@tanstack/react-query` | Data fetching          | [tanstack.com/query](https://tanstack.com/query)       |
| `@zayne-labs/callapi`   | Type-safe fetch client | Internal                                               |
| `arctic`                | OAuth library          | [arctic.js.org](https://arctic.js.org)                 |
| `react-hook-form`       | Form management        | [react-hook-form.com](https://react-hook-form.com)     |
| `tailwind-variants`     | Variant styling        | [tailwind-variants.org](https://tailwind-variants.org) |

---
