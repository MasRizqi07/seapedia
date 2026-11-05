# Seapedia (Level 7)

Seapedia is a multi-role e-commerce marketplace supporting **Admin, Seller, Buyer**, and **Driver** workflows in a single platform. It is built as a Turborepo monorepo using Next.js 16 (App Router with Turbopack) and NestJS 10+ (PostgreSQL + Prisma).

**For a deep dive into the System Architecture, Structural Folders, and Design System, please read the [Design.md](./Design.md) document.**

## Setup & Environment

### Prerequisites
- Node.js (v24.13.0+)
- pnpm (v9+)
- PostgreSQL Database (via Docker)
- Redis (for BullMQ background jobs via Docker)
- Docker Desktop (Required to run the database containers locally)

### Environment Variables
Copy `.env.example` to `.env` in the root directory:

```env
DATABASE_URL="postgresql://seapedia:seapedia@localhost:5432/seapedia?schema=public"
JWT_SECRET="super-secret-key-12345"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="super-secret-refresh-key"
JWT_REFRESH_EXPIRATION="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### Starting the Application
```bash
# 1. Start Database and Redis Containers
docker-compose up -d

# 2. Install dependencies
pnpm install

# 3. Run database migrations and generate Prisma client
pnpm --filter api db:push
pnpm --filter api db:generate

# 4. Seed the database with demo accounts
pnpm --filter api db:seed

# 5. Start the development server (runs frontend on http://localhost:3000 and backend on http://localhost:4000)
pnpm dev
```

### Demo Accounts
The seed script generates 4 pre-configured accounts with `password123`:
- `admin@seapedia.com` (Roles: Admin, Buyer)
- `seller@seapedia.com` (Roles: Seller, Buyer)
- `buyer@seapedia.com` (Roles: Buyer)
- `driver@seapedia.com` (Roles: Driver, Buyer)

## Business Rules

### 1. Single-Store Checkout
A buyer can only add items to their cart from a **single store** at any given time. If they attempt to add a product from a different store, the API explicitly blocks the request, enforcing the `single-store-per-cart` validation.

### 2. Voucher vs. Promo Combination & PPN
- **Vouchers**: Buyer-specific discount codes entered at checkout.
- **Promos**: Global promotions automatically applied to the cart (currently only Voucher codes are supported at checkout).
- **PPN (Tax)**: Calculated **after** discounts are applied. The formula is: `Total = (Subtotal - Discount + Delivery Fee) * 1.11`.

### 3. Driver Earnings
Drivers earn **80%** of the order's delivery fee. The system calculates and registers this earning mathematically in the backend when the job is created. The funds are realized in the driver's history upon job completion.

### 4. Overdue SLA Windows
The SLA (Service Level Agreement) starts ticking when an order enters the `SHIPPING` status (when a driver accepts the job):
- **INSTANT**: 3 Hours
- **NEXT_DAY**: 24 Hours
- **REGULAR**: 72 Hours

If the time exceeds the SLA before the driver completes it, the system's background sweeper (BullMQ) auto-cancels the order. The status becomes `RETURNED`, the exact total amount is refunded to the buyer's wallet, and the stock is returned to the seller.

**Time Simulation**: The Admin dashboard includes a "Simulate Next Day" button. Clicking this artificially advances the system clock by 24 hours, instantly triggering the Overdue SLA Sweeper.

## Security Measures

### 1. Data Sanitization (XSS Prevention)
All free-text inputs such as Reviews, Product Descriptions, and Store Names are heavily sanitized on the backend using `sanitize-html`. Any malicious payloads (e.g. `<script>alert(1)</script>`) are automatically stripped into safe text before hitting the database.

### 2. Strict DTO Validation
The backend enforces a global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`. Any request body containing unexpected or unmapped fields will result in a `400 Bad Request`.

### 3. Secure Token Expiry & Refresh
- Access Tokens are short-lived (**15 Minutes**).
- Refresh Tokens are securely hashed and stored in the database.
- Logging out natively invalidates the refresh token on the server-side, immediately killing any persistent sessions.

### 4. Direct Ownership Checks
All mutative actions verify that the JWT subject `userId` matches the resource owner:
| Action | Endpoint | Validation Check |
|---|---|---|
| Manage Store / Products | `/api/seller/*` | `product.storeId === seller.store.id` |
| Complete Job | `/api/driver/jobs/:id/complete` | `job.driverId === driver.id` |
| View Order Details | `/api/orders/:id` | `order.buyerId === buyer.id` |

### 5. SQL Injection Prevention
The application interacts with the database purely via Prisma ORM using structured queries. There is absolutely no `queryRawUnsafe` or manual string concatenation in the entire codebase.

## E2E Testing Walkthrough

1. **Guest Access**: Open `http://localhost:3000/`. Browse the product catalog and write a review. Try pasting `<script>alert('xss')</script>` in the review to see it perfectly sanitized.
2. **Login & Top Up**: Log in as `buyer@seapedia.com` with `password123`. Choose the Buyer role. Top up your wallet in the dashboard.
3. **Checkout**: Add a product to your cart, set a delivery address, and proceed to checkout.
4. **Seller Process**: Log in as `seller@seapedia.com`, select Seller role, and advance the order from "Sedang Dikemas" to "Menunggu Pengirim".
5. **Driver Take**: Log in as `driver@seapedia.com`, accept the job, and see the order status change to "Sedang Dikirim" (SHIPPING).
6. **Time Travel**: Log in as `admin@seapedia.com`. Check the Admin Dashboard stats. Click **Simulate Next Day**.
7. **Refund Magic**: If the order's delivery method was `INSTANT` or `NEXT_DAY`, the order is automatically moved to `RETURNED`. The buyer's wallet is instantly refunded, and the seller's stock is fully restored!
