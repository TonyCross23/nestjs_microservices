# API Endpoints Documentation

**Base URL:** `http://localhost:3000`

Architecture: `api-gateway` (HTTP) → `auth-service`, `product-service`, `order-service` (TCP microservices)

**Rate limit (all routes):** 10 requests / 60 seconds per client, enforced globally by `ThrottlerGuard`. Exceeding it returns `429 Too Many Requests`.

---

## Auth Endpoints

### Register
```
POST /auth/register
```
**Auth required:** No · **Roles:** —

**Body:**
```json
{ "email": "user@example.com", "password": "123456", "name": "John Doe" }
```
**Validation:** email format, password min 6 chars, name min 2 chars

**curl:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "aung@example.com", "password": "123456", "name": "Aung"}'
```

---

### Login
```
POST /auth/login
```
**Auth required:** No · **Roles:** —

**Body:**
```json
{ "email": "user@example.com", "password": "123456" }
```
**Response:** returns JWT `access_token`

**curl:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "aung@example.com", "password": "123456"}'
```

---

### Create Seller
```
POST /auth/sellers
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`

**Body:** *(confirm exact fields in `createSellerSchema`)*
```json
{ "email": "seller@example.com", "password": "123456", "name": "Seller Name" }
```

**curl:**
```bash
curl -X POST http://localhost:3000/auth/sellers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"email": "seller@example.com", "password": "123456", "name": "Seller Name"}'
```

---

### Get Users
```
GET /users
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `SELLER`

**curl:**
```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

---

## Product Endpoints

### Get All Products
```
GET /products
```
**Auth required:** Yes (`AuthGuard`) · **Roles:** any authenticated user

**curl:**
```bash
curl http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"
```

---

### Get Single Product *(proposed — not yet wired to gateway)*
```
GET /products/:id
```
**Auth required:** Yes (`AuthGuard`) · **Roles:** any authenticated user

**curl:**
```bash
curl http://localhost:3000/products/PRODUCT_UUID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Create Product
```
POST /products
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`, `SELLER`

**Body:**
```json
{ "name": "Banana", "price": 1, "description": "optional description", "stock": 100 }
```
**Validation:** name min 1 char, price positive number, description optional, stock non-negative integer

> ⚠️ `description` is in the Zod schema but **not yet in the Prisma `Product` model** — currently dropped silently unless the model/service are updated.

**curl:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Banana", "price": 1, "stock": 100}'
```

---

### Update Product *(proposed — not yet wired to gateway)*
```
PATCH /products/:id
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`, `SELLER`

**Body:** *(all fields optional)*
```json
{ "name": "Banana", "price": 1.5, "stock": 80 }
```

**curl:**
```bash
curl -X PATCH http://localhost:3000/products/PRODUCT_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"stock": 80}'
```

---

### Delete Product *(proposed — not yet wired to gateway)*
```
DELETE /products/:id
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`

**curl:**
```bash
curl -X DELETE http://localhost:3000/products/PRODUCT_UUID \
  -H "Authorization: Bearer $TOKEN"
```

---

### Reserve Stock *(proposed — not yet wired to gateway)*
```
POST /products/reserve
```
**Auth required:** Yes (`AuthGuard`)

**Body:**
```json
{ "items": [{ "productId": "product-uuid-here", "quantity": 2 }] }
```

**curl:**
```bash
curl -X POST http://localhost:3000/products/reserve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"productId": "product-uuid-here", "quantity": 2}]}'
```

> Called internally through `/orders` today — this route exposes it directly if needed.

---

## Order Endpoints

### Create Order
```
POST /orders
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `USER`

Internally calls `product-service`'s `reserveStock`. `userId` comes from the validated token (`@GetUser()`), not the request body.

**Body:**
```json
{ "items": [{ "productId": "product-uuid-here", "quantity": 2 }] }
```
**Validation:** items array non-empty, each item needs a valid UUID `productId` and positive integer `quantity`

**curl:**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"productId": "product-uuid-here", "quantity": 2}]}'
```

---

### Get Orders (all)
```
GET /orders
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`, `SELLER`

**curl:**
```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN"
```

---

### Get My Orders *(proposed — not yet wired to gateway)*
```
GET /orders/my
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `USER`

Returns only the orders belonging to the authenticated user (`userId` from token).

> ⚠️ Must be registered **before** `GET /orders/:id` in the controller, or Nest will match `my` as an `:id` param.

**curl:**
```bash
curl http://localhost:3000/orders/ \
  -H "Authorization: Bearer $TOKEN"
```

---

### Get Single Order *(proposed — not yet wired to gateway)*
```
GET /orders/:id
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`, `SELLER`

**curl:**
```bash
curl http://localhost:3000/orders/ORDER_UUID \
  -H "Authorization: Bearer $TOKEN"
```
 
---

### Update Order Status *(proposed — not yet wired to gateway)*
```
PATCH /orders/:id/status
```
**Auth required:** Yes (`AuthGuard` + `RolesGuard`) · **Roles:** `ADMIN`, `SELLER`

**Body:**
```json
{ "status": "PROCESSING" }
```
**Validation:** status must be one of `PENDING`, `PROCESSING`, `COMPLETED` (matches Prisma `OrderStatus` enum)

**curl:**
```bash
curl -X PATCH http://localhost:3000/orders/ORDER_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "PROCESSING"}'
```

---

## Running the Project

Each service is its own Nest app inside a pnpm workspace. Use `--filter`, not a bare package name after `start`.

**Prerequisite:** root `pnpm-workspace.yaml` should list all 4 packages:
```yaml
packages:
  - "api-gateway"
  - "auth-service"
  - "order-service"
  - "product-service"
```

### Run each service individually (4 terminals)
```bash
pnpm --filter auth-service start:dev
pnpm --filter order-service start:dev
pnpm --filter product-service start:dev
pnpm --filter api-gateway start:dev
```

### Run all 4 at once (root script)
Add to root `package.json`:
```json
{ "scripts": { "dev": "pnpm --parallel --filter \"./*\" run start:dev" } }
```
Then:
```bash
pnpm dev
```

> Note: `pnpm start api-gateway --watch` will NOT work as written. Use `--filter <package> start:dev` instead.

### Alternative: run normal (4 terminals, without `--filter`)

If each service has its own `package.json` with a `start` script that accepts `--watch` directly (Nest CLI style), you can also run:

```bash
pnpm start api-gateway --watch
pnpm start auth-service --watch
pnpm start order-service --watch
pnpm start product-service --watch
```

> This only works if each service's own `package.json` script is set up to accept the app name as an arg (e.g. `"start": "nest start"` run from inside that service's folder, or a root script that forwards args to `nest start <app>`). If you're running from the monorepo root and hit `--filter`-style errors, use the `--filter` commands above instead.

---

## Auth Flow Summary

1. `POST /auth/register` — create account (default role, likely `USER`)
2. `POST /auth/login` — get `access_token`
3. Set it: `export TOKEN="<access_token>"`
4. Use `-H "Authorization: Bearer $TOKEN"` on all protected routes

## Guard Behavior

- **`ThrottlerGuard`** — global (`APP_GUARD`), 10 req/60s across all routes. Exceeding → `429`.
- **`AuthGuard`** — per-route (`@UseGuards(AuthGuard)`), validates the `Authorization` header against `auth-service` (`validate_token`). Attaches user for `@GetUser()`.
- **`RolesGuard`** — paired with `AuthGuard` (`@UseGuards(AuthGuard, RolesGuard)`), checks user role against `@Roles(...)`. Runs after `AuthGuard`.

## Role Matrix

| Route | Method | Roles allowed | Status |
|---|---|---|---|
| `/auth/register` | POST | public | ✅ live |
| `/auth/login` | POST | public | ✅ live |
| `/auth/sellers` | POST | `ADMIN` | ✅ live |
| `/users` | GET | `SELLER` | ✅ live |
| `/products` | GET | any authenticated | ✅ live |
| `/products/:id` | GET | any authenticated | 🚧 proposed |
| `/products` | POST | `ADMIN`, `SELLER` | ✅ live |
| `/products/:id` | PATCH | `ADMIN`, `SELLER` | 🚧 proposed |
| `/products/:id` | DELETE | `ADMIN` | 🚧 proposed |
| `/products/reserve` | POST | any authenticated | 🚧 proposed |
| `/orders` | POST | `USER` | ✅ live |
| `/orders` | GET | `ADMIN`, `SELLER` | ✅ live |
| `/orders/my` | GET | `USER` | 🚧 proposed |
| `/orders/:id` | GET | `ADMIN`, `SELLER` | 🚧 proposed |
| `/orders/:id/status` | PATCH | `ADMIN`, `SELLER` | 🚧 proposed |

## Known Gaps / TODO

- [ ] Wire up all 🚧 proposed routes above in `ApiGatewayController` (code provided separately)
- [ ] Add matching `@MessagePattern` handlers + service methods in `product-service` and `order-service`
- [ ] Add `description` field to Prisma `Product` model to match `CreateProductSchema`
- [ ] `reserveStock` returns `success: false` in the response body on insufficient stock (HTTP 200, not error status) — check `success` field, not just status code
- [ ] Confirm exact fields required by `createSellerSchema`
- [ ] Confirm default role assigned on `/auth/register`
- [ ] Ensure `orders/my` route is registered before `orders/:id` to avoid route collision
