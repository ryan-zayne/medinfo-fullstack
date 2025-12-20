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
| AI         | HuggingFace Transformers                     |
| Storage    | Cloudinary                                   |

---

## Monorepo Architecture

```
medinfo-fullstack/
├── apps/
│   ├── backend/                 # @medinfo/backend - Hono API server
│   │   └── src/
│   │       ├── app/             # Feature modules (auth, diseases, health-tips, appointments)
│   │       ├── config/          # Environment, CORS settings
│   │       ├── lib/             # Shared utilities, types, factory
│   │       ├── middleware/      # Global middleware
│   │       ├── services/        # Shared services (ai, cloudinary)
│   │       ├── app.ts           # Route composition
│   │       └── server.ts        # Entry point
│   │
│   └── frontend/                # @medinfo/frontend - Next.js app
│       ├── app/                 # App Router pages
│       │   ├── (home)/          # Public routes (landing, auth, library)
│       │   └── (protected)/     # Authenticated dashboard routes
│       │       └── dashboard/   # Role-based dashboards (patient, doctor)
│       ├── components/          # Reusable components
│       │   ├── common/          # Shared (Logo, NavLink, Show, For, etc.)
│       │   ├── icons/           # SVG icon components
│       │   └── ui/              # UI primitives (Button, Form, Select, etc.)
│       └── lib/                 # Utilities
│           ├── api/             # API client (callBackendApi)
│           ├── react-query/     # Query/mutation options
│           ├── utils/           # Helpers (cn, common)
│           └── zustand/         # State stores
│
└── packages/
    ├── db/                      # @medinfo/backend-db - Drizzle ORM layer
    │   └── src/
    │       ├── schema/          # Table definitions (auth.ts)
    │       ├── migrations/      # SQL migrations
    │       └── db.ts            # Database connection
    │
    ├── env/                     # @medinfo/env - Environment validation
    │   └── src/
    │       └── backend-env.ts   # Zod schema for env vars
    │
    └── shared/                  # @medinfo/shared - Shared code
        └── src/
            └── validation/      # API schemas (backendApiSchema.ts)
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
- pnpm 10.26.0 (`corepack enable`)
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

### AI and Cloud Services

The backend now integrates with external services:

- **AI**: HuggingFace transformers integration located in `src/services/ai/huggingFace.ts`.
- **Storage**: Cloudinary SDK configuration in `src/services/cloudinary/`.

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
├── (home)/                       # Route group - public pages
│   ├── -components/              # Private components (prefixed with -)
│   │   ├── OAuthSection.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── daily-tips/
│   ├── library/
│   ├── layout.tsx               # Shared layout with navbar
│   └── page.tsx                 # Landing page
│
├── (protected)/                  # Authenticated routes
│   ├── dashboard/
│   │   ├── (role)/
│   │       ├── patient/         # Patient dashboard
│   │       └── doctor/          # Doctor dashboard
│   └── template.tsx             # Dashboard layout template
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
// app/(home)/auth/signin/page.tsx
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
