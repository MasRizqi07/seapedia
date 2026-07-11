# Seapedia Architecture & Design Document

## 1. System Architecture

Seapedia is built as a robust, scalable, and modern full-stack web application designed for a multi-tenant e-commerce marketplace. The system adopts a **Monorepo Architecture** powered by Turborepo, allowing seamless code sharing between the frontend, backend, and shared libraries.

### High-Level Components
1. **Client (Web)**: A Next.js 14 App Router application serving as the presentation layer.
2. **API Server (Backend)**: A NestJS application handling business logic, authentication, and background jobs.
3. **Database Layer**: PostgreSQL serving as the primary relational database, managed via Prisma ORM.
4. **Caching & Queueing**: Redis is utilized by BullMQ to handle delayed background tasks (like SLA Overdue Sweeps).

### Workflow & Data Flow
- **Client-to-API**: The web client communicates with the NestJS API via RESTful endpoints. It uses standard fetch/Axios implementations wrapped in React Query for data fetching and caching.
- **Authentication**: JWT (JSON Web Tokens) are used. The frontend stores tokens securely and attaches them to `Authorization` headers. The backend uses Passport.js to validate these tokens and enforce role-based access control (RBAC).
- **Background Jobs**: When an order transitions to `SHIPPING`, the backend enqueues a delayed BullMQ job in Redis. If the SLA time expires before the driver completes the job, the queue processor automatically handles the refund and status update.

---

## 2. Design System & Frontend Architecture

The frontend (`apps/web`) uses a heavily modern, aesthetics-focused design system.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + PostCSS
- **Component Library**: shadcn-ui (built on top of Radix UI primitives for accessibility)
- **State Management**: Zustand (for global state like Auth) and React Query (for server state)
- **Icons**: Lucide React

### UI/UX Philosophy
- **Glassmorphism & Depth**: The application makes heavy use of translucent backgrounds (`bg-white/5`, `glass` classes) over vibrant gradient or SVG backgrounds to create a premium, immersive "underwater/ocean" aesthetic.
- **Micro-animations**: Elements utilize `tailwindcss-animate` (e.g., `animate-in fade-in zoom-in`) to ensure that pages do not just "appear" but transition smoothly, giving a native-app feel.
- **Dark Mode First**: The default color palette relies on deep slates (`slate-950`) and bright cyans (`cyan-400`, `cyan-600`) to evoke the ocean theme while maintaining high contrast and readability.

---

## 3. Structural Folder Project (Monorepo)

The repository is structured using Turborepo and pnpm workspaces.

```text
seapedia/
├── apps/
│   ├── api/                 # NestJS Backend Application
│   │   ├── prisma/          # Database schema and seed scripts
│   │   ├── src/
│   │   │   ├── auth/        # Authentication & JWT strategies
│   │   │   ├── jobs/        # Driver jobs logic
│   │   │   ├── orders/      # Core checkout and order management
│   │   │   ├── scheduler/   # BullMQ processors for SLA sweeps
│   │   │   └── ...          # Other domain modules
│   │   └── test/            # E2E Tests
│   └── web/                 # Next.js Frontend Application
│       ├── src/
│       │   ├── app/         # App Router pages (auth, dashboard, landing)
│       │   ├── components/  # Reusable UI components (shadcn)
│       │   ├── lib/         # API clients and utility functions
│       │   └── stores/      # Zustand state stores
│       └── public/          # Static assets (images, SVGs)
├── packages/
│   ├── config/              # Shared ESLint/TypeScript configurations
│   └── types/               # Shared TypeScript interfaces (DTOs, Responses)
├── docker-compose.yml       # Infrastructure orchestration (Postgres, Redis)
└── turbo.json               # Turborepo build pipeline configuration
```

### Key Advantages of this Structure:
- **Type Safety**: The `@seapedia/types` package allows the frontend and backend to share exact TypeScript definitions. If a backend response changes, the frontend build will immediately catch the type mismatch.
- **Unified Build**: `turbo run build` caches outputs and builds dependencies in the correct topological order.

---

## 4. Security & Business Logic Integrity

- **Strict Validation**: All incoming API requests are validated using `class-validator` DTOs. Unexpected fields are stripped.
- **Sanitization**: `sanitize-html` is used globally to prevent XSS attacks on user-generated content (reviews, descriptions).
- **Atomic Transactions**: Critical operations like Checkout and Top-ups use Prisma `$transaction` blocks to ensure data consistency (e.g., deducting wallet balance and decrementing stock simultaneously).
- **RBAC Guarding**: Routes are protected by `@Roles(Role.SELLER, Role.ADMIN)` decorators in NestJS, ensuring users can only access their respective dashboards and actions.

---

## 5. Next Steps for Audit & Improvement

To continue developing and improving Seapedia, consider the following areas:
1. **Testing**: Expand the E2E test coverage in both the frontend (using Playwright or Cypress) and the backend (`apps/api/test`).
2. **Observability**: Integrate an APM tool (like Datadog or Sentry) to monitor API latency, specifically around database transactions and background job processing times.
3. **Image Optimization**: If sellers upload product images, implement a cloud storage solution (AWS S3) and an image CDN to serve optimized formats.
4. **Real-time Updates**: Implement WebSockets (via Socket.io in NestJS) to push real-time order status updates to the Buyer and Driver dashboards instead of requiring manual refreshes.
