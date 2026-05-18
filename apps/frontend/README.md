# @medinfo/frontend

The frontend application for MedInfo, built with Next.js 16 and React 19.

## Features

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS 4 + tailwind-variants
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod resolvers
- **Components**: Custom component library built on top of Radix UI primitives (Ark UI)

## Project Structure

```text
apps/frontend/app/
├── (home)/            # Public marketing pages (Landing, About, etc.)
├── (protected)/       # Authenticated dashboard routes
│   ├── dashboard/     # Role-based dashboards (Patient/Doctor)
│   └── template.tsx   # Dashboard layout template
├── components/        # Reusable UI components
│   ├── common/        # Shared functional components
│   └── ui/            # Design system primitives
└── lib/               # Utilities and API clients
```

## Scripts

```bash
# Development
pnpm dev          # Start development server

# Build
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint:eslint  # Run ESLint
pnpm lint:format  # Format code with Prettier
pnpm lint:type-check # Run TypeScript type checking
```

## Styling

- Tailwind CSS 4 for styling (configuration in `tailwind.css`)
- `tailwind-variants` for component variants
- `tailwind-merge` for class merging
