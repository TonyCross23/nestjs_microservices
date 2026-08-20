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
{
  "scripts": {
    "dev": "pnpm --parallel --filter \"./*\" run start:dev"
  }
}
```

Then:
```bash
pnpm dev
```

### If you want to run normal(4 terminals)

``` bash
pnpm start api-gateway --watch
pnpm start auth-service --watch
pnpm start order-service --watch
pnpm start product-service --watch
```


# API Endpoints Documentation

**Base URL:** `http://localhost:3000`

Architecture: `api-gateway` (HTTP) → `auth-service`, `product-service`, `order-service` (TCP microservices)

---

## Auth Endpoints

### Register
```
POST /auth/register
```

**Auth required:** No

**Body:**
```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "John Doe"
}
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

**Auth required:** No

**Body:**
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

**Response:** returns JWT `access_token` (used as Bearer token for protected routes)

**curl:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "aung@example.com", "password": "123456"}'
```

---

## Product Endpoints

### Get All Products
```
GET /products
```

**Auth required:** No

**curl:**
```bash
curl http://localhost:3000/products
```

---

### Create Product
```
POST /products
```

**Auth required:** Yes (`AuthGuard`)

**Body:**
```json
{
  "name": "Banana",
  "price": 1,
  "description": "optional description",
  "stock": 100
}
```

**Validation:** name min 1 char, price positive number, description optional, stock non-negative integer

**curl:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Banana", "price": 1, "stock": 100}'
```

---

### Reserve Stock *(not yet wired to gateway — proposed route)*
```
POST /products/reserve
```

**Auth required:** Yes (`AuthGuard`)

**Body:**
```json
{
  "items": [
    { "productId": "product-uuid-here", "quantity": 2 }
  ]
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/products/reserve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"productId": "product-uuid-here", "quantity": 2}]}'
```

> Note: this route doesn't exist in `ApiGatewayController` yet — needs to be added if you want to call `reserveStock` directly instead of through `/orders`.

---

## Order Endpoints

### Create Order
```
POST /orders
```

**Auth required:** Yes (`AuthGuard`)

Internally calls `product-service`'s `reserveStock` to check/deduct stock before creating the order.

**Body:**
```json
{
  "items": [
    { "productId": "product-uuid-here", "quantity": 2 }
  ]
}
```

**Validation:** items array must be non-empty, each item needs a valid UUID `productId` and positive integer `quantity`

**curl:**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items": [{"productId": "product-uuid-here", "quantity": 2}]}'
```

---

## Auth Flow Summary

1. `POST /auth/register` — create account
2. `POST /auth/login` — get `access_token`
3. Set it: `export TOKEN="<access_token>"`
4. Use `-H "Authorization: Bearer $TOKEN"` on all protected routes (`POST /products`, `POST /orders`)

## Guard Behavior

- `ThrottlerGuard` — applied globally (`APP_GUARD`), limits requests to 10 per 60 seconds across **all** routes
- `AuthGuard` — applied per-route via `@UseGuards(AuthGuard)`, checks the `Authorization` header and validates the token against `auth-service`

## Known Gaps / TODO

- [ ] `POST /products/reserve` route not yet added to gateway
- [ ] Confirm whether `GET /products` should also require auth
- [ ] `reserveStock` returns `success: false` in the response body on insufficient stock (HTTP 200, not an error status) — check `success` field, not just status code
