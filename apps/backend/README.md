# @medinfo/backend

The backend API server for MedInfo, built with **Hono** and **Node.js**.

## 🚀 Features

- **Framework**: Hono (Lightweight & Fast)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT & OAuth (Google)
- **Validation**: Zod (Shared with frontend)
- **AI Integration**: HuggingFace transformers for intelligent features
- **Cloud Storage**: Cloudinary integration
- **Logging**: Pino logger

## 📂 Project Structure

```
apps/backend/src/
├── app/               # Feature-based modules (routes, services)
│   ├── auth/          # Authentication logic
│   ├── appointments/  # Appointment scheduling
│   ├── diseases/      # Disease library
│   └── health-tips/   # Daily health tips
├── config/            # Configuration (CORS, Rate Limits)
├── lib/               # Shared utilities & factory functions
├── middleware/        # Global middleware (Auth, Error Handling)
├── services/          # External services (AI, Cloudinary)
└── server.ts          # Entry point
```

## 🛠️ Scripts

```bash
# Development
pnpm dev          # Start server in watch mode (localhost:8000)

# Build
pnpm build        # Build using tsdown
pnpm start        # Start production server

# Code Quality
pnpm lint:eslint  # Run ESLint
pnpm lint:format  # Format code with Prettier
pnpm lint:type-check # Run TypeScript type checking
```

## 🧪 API Documentation

This project uses **Bruno** for API testing and documentation.
You can find the collection in the root directory under `(bruno)-(medinfo)`.

## 🧠 AI Services

The backend integrates with HuggingFace for AI capabilities.
Configuration can be found in `src/services/ai/huggingFace.ts`.
