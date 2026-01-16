# Palm Payment API Documentation

Complete API documentation for the Palm Payment Backend system with biometric palm verification and PhajayPay integration.

---

## Base URL

```
https://api.ceit-iot-lab.site/api
```

For local development:

```
http://localhost:3000/api
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Orders](#orders)
4. [Transactions](#transactions)
5. [Payment](#payment)
6. [Error Responses](#error-responses)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### 1. Register User

Create a new user account with optional palm biometric data.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "85620123456",
  "password": "mypassword",
  "plam_code": "PALM_ABC123XYZ"
}
```

**Fields:**

- `first_name` (required): User's first name
- `last_name` (required): User's last name
- `phone` (required): User's phone number (unique)
- `password` (required): User's password (any length)
- `plam_code` (optional): Palm biometric code from camera scan

**Success Response (201):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "85620123456",
    "plam_code": "PALM_ABC123XYZ",
    "amount": "0.00",
    "vertify_plam": true,
    "created_at": "2026-01-17T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**

```json
{
  "error": "Phone number already registered"
}
```

**Notes:**

- If `plam_code` is provided, `vertify_plam` is automatically set to `true`
- Phone number must be unique
- Password is hashed with bcrypt
- JWT token expires in 7 days

---

### 2. Login User

Authenticate user with phone and password.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "phone": "85620123456",
  "password": "mypassword"
}
```

**Success Response (200):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "85620123456",
    "plam_code": "PALM_ABC123XYZ",
    "amount": "150000.00",
    "vertify_plam": true,
    "created_at": "2026-01-17T10:00:00.000Z",
    "updated_at": "2026-01-17T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**

```json
{
  "error": "Invalid credentials"
}
```

---

## User Management

All user endpoints require authentication.

### 3. Get User Profile

Retrieve current user's profile information.

**Endpoint:** `GET /api/users/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "85620123456",
  "plam_code": "PALM_ABC123XYZ",
  "amount": "150000.00",
  "vertify_plam": true,
  "created_at": "2026-01-17T10:00:00.000Z",
  "updated_at": "2026-01-17T12:00:00.000Z"
}
```

---

### 4. Verify Palm Biometric

Add or update palm biometric code for the user.

**Endpoint:** `POST /api/users/verify-palm`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "plam_code": "PALM_NEW_CODE_456"
}
```

**Success Response (200):**

```json
{
  "message": "Palm verified successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "85620123456",
    "plam_code": "PALM_NEW_CODE_456",
    "amount": "150000.00",
    "vertify_plam": true
  }
}
```

**Error Response (400):**

```json
{
  "error": "Palm code already registered"
}
```

**Notes:**

- Palm code must be unique across all users
- Updates `vertify_plam` to `true`

---

### 5. Top Up Balance

Add money to user's account balance via PhajayPay.

**Endpoint:** `POST /api/users/topup`

**Authentication:** Bearer Token OR Palm Code (Header)

**Option 1 - Using Bearer Token:**

Headers:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Request Body:

```json
{
  "amount": 100000
}
```

**Option 2 - Using Palm Code:**

Headers:

```
x-palm-code: PALM_ABC123XYZ
Content-Type: application/json
```

Request Body:

```json
{
  "amount": 100000
}
```

**Success Response (200):**

```json
{
  "message": "Top up successful - balance updated",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "85620123456",
    "amount": "250000.00"
  },
  "order": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "100000.00",
    "payment_method": "phajay",
    "payment_status": "completed",
    "transaction_id": "topup_1705502400000_550e8400",
    "items": {
      "type": "topup"
    },
    "created_at": "2026-01-17T13:00:00.000Z",
    "updated_at": "2026-01-17T13:00:00.000Z"
  },
  "payment": {
    "paymentUrl": "https://payment-gateway.phajay.co/pay/xyz789",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Error Response (401):**

```json
{
  "error": "Invalid palm code"
}
```

OR

```json
{
  "error": "Palm not verified"
}
```

OR

```json
{
  "error": "Authentication required",
  "message": "Provide either Bearer token or x-palm-code header"
}
```

**Notes:**

- Supports 2 authentication methods: Bearer token OR palm code in `x-palm-code` header
- Palm code must be verified (`vertify_plam = true`)
- Creates a special order with `items.type = "topup"` and status = "completed"
- **Balance is updated immediately** when payment link is created
- Payment URL is generated for record keeping
- Payment URL is generated for record keeping
- No webhook callback needed - balance already added

---

## Orders

### 6. Create Order

Create a new purchase order with PhajayPay payment link.

**Endpoint:** `POST /api/orders`

**Authentication:** Bearer Token OR Palm Code (Header)

**Option 1 - Using Bearer Token:**

Headers:

```
Authorization: Bearer <token>
Content-Type: application/json
```

Request Body:

```json
{
  "amount": 50000,
  "description": "Purchase coffee and snacks",
  "items": {
    "coffee": 2,
    "snack": 1
  }
}
```

**Option 2 - Using Palm Code:**

Headers:

```
x-palm-code: PALM_ABC123XYZ
Content-Type: application/json
```

Request Body:

```json
{
  "amount": 50000,
  "description": "Purchase coffee and snacks",
  "items": {
    "coffee": 2,
    "snack": 1
  }
}
```

**Fields:**

- `amount` (required): Order amount in LAK (must be positive)
- `description` (optional): Order description
- `items` (optional): JSON object with order items

**Success Response (201):**

```json
{
  "message": "Order created successfully - balance deducted",
  "order": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "50000.00",
    "payment_method": "phajay",
    "payment_status": "completed",
    "transaction_id": "order_1705506000000_550e8400",
    "items": {
      "coffee": 2,
      "snack": 1
    },
    "created_at": "2026-01-17T14:00:00.000Z",
    "updated_at": "2026-01-17T14:00:00.000Z"
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "85620123456",
    "amount": "200000.00"
  },
  "payment": {
    "paymentUrl": "https://payment-gateway.phajay.co/pay/abc123",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }
}
```

**Error Response (400 - Insufficient Balance):**

```json
{
  "error": "Insufficient balance",
  "currentBalance": 30000,
  "requiredAmount": 50000
}
```

**Error Response (401):**

```json
{
  "error": "Invalid palm code"
}
```

OR

```json
{
  "error": "Palm not verified"
}
```

OR

```json
{
  "error": "Authentication required",
  "message": "Provide either Bearer token or x-palm-code header"
}
```

**Notes:**

- Supports 2 authentication methods: Bearer token OR palm code in `x-palm-code` header
- Palm code must be verified (`vertify_plam = true`)
- **Checks if user has sufficient balance** before creating order
- **Deducts amount from user balance immediately**
- Creates PhajayPay payment link
- Order status is set to "completed" immediately
- Returns updated user balance

**Error Response (400 - Insufficient Balance):**

```json
{
  "error": "Insufficient balance",
  "currentBalance": 30000,
  "requiredAmount": 50000
}
```

**Notes:**

- **Checks if user has sufficient balance** before creating order
- **Deducts amount from user balance immediately**
- Creates PhajayPay payment link
- Order status is set to "completed" immediately
- Returns updated user balance

---

### 7. Get All Orders

Retrieve all orders for the authenticated user.

**Endpoint:** `GET /api/orders`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "50000.00",
    "payment_method": "phajay",
    "payment_status": "completed",
    "transaction_id": "order_1705506000000_550e8400",
    "items": {
      "coffee": 2,
      "snack": 1
    },
    "created_at": "2026-01-17T14:00:00.000Z",
    "updated_at": "2026-01-17T14:00:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": "100000.00",
    "payment_method": "phajay",
    "payment_status": "completed",
    "transaction_id": "topup_1705502400000_550e8400",
    "items": {
      "type": "topup"
    },
    "created_at": "2026-01-17T13:00:00.000Z",
    "updated_at": "2026-01-17T13:00:00.000Z"
  }
]
```

**Notes:**

- Returns all orders (both purchases and top-ups)
- Sorted by most recent first
- Includes all order details

---

## Transactions

Transaction history endpoints for viewing user's financial activities.

### 8. Get Top-Up History

Retrieve all top-up transactions for the authenticated user.

**Endpoint:** `GET /api/transactions/topup-history`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "message": "Top-up history retrieved successfully",
  "total": 3,
  "transactions": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "amount": "100000.00",
      "payment_method": "phajay",
      "payment_status": "completed",
      "transaction_id": "topup_1705502400000_550e8400",
      "created_at": "2026-01-17T13:00:00.000Z",
      "updated_at": "2026-01-17T13:00:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440003",
      "amount": "50000.00",
      "payment_method": "phajay",
      "payment_status": "completed",
      "transaction_id": "topup_1705499000000_550e8400",
      "created_at": "2026-01-17T12:00:00.000Z",
      "updated_at": "2026-01-17T12:00:00.000Z"
    }
  ]
}
```

**Notes:**

- Returns only top-up transactions (where `items.type = "topup"`)
- Sorted by most recent first
- Excludes `items` field from response

---

### 9. Get Order History

Retrieve all purchase orders (excluding top-ups) for the authenticated user.

**Endpoint:** `GET /api/transactions/order-history`

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "message": "Order history retrieved successfully",
  "total": 5,
  "transactions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "amount": "50000.00",
      "payment_method": "phajay",
      "payment_status": "completed",
      "transaction_id": "order_1705506000000_550e8400",
      "items": {
        "coffee": 2,
        "snack": 1
      },
      "created_at": "2026-01-17T14:00:00.000Z",
      "updated_at": "2026-01-17T14:00:00.000Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440004",
      "amount": "25000.00",
      "payment_method": "phajay",
      "payment_status": "completed",
      "transaction_id": "order_1705503000000_550e8400",
      "items": {
        "lunch": 1
      },
      "created_at": "2026-01-17T13:30:00.000Z",
      "updated_at": "2026-01-17T13:30:00.000Z"
    }
  ]
}
```

**Notes:**

- Returns only purchase orders (excludes top-ups)
- Sorted by most recent first
- Includes `items` field with order details

---

## Payment

### 10. Check Payment Status

Check the current payment status of an order.

**Endpoint:** `GET /api/payment/status/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (required): Order ID (UUID)

**Success Response (200):**

```json
{
  "orderId": "770e8400-e29b-41d4-a716-446655440002",
  "paymentStatus": "completed",
  "transactionId": "order_1705506000000_550e8400",
  "amount": "50000.00"
}
```

**Error Response (404):**

```json
{
  "error": "Order not found"
}
```

**Notes:**

- Queries PhajayPay API for latest payment status
- Automatically updates order status if changed
- Only accessible by order owner

---

## Error Responses

### Common HTTP Status Codes

- `200` - Success
- `201` - Created (successful resource creation)
- `400` - Bad Request (validation error, insufficient balance)
- `401` - Unauthorized (invalid/missing token, invalid credentials)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Validation Error Format

```json
{
  "error": "[{\"code\":\"too_small\",\"message\":\"Field is required\",\"path\":[\"field_name\"]}]"
}
```

---

## Testing with cURL

### 1. Register a User

```bash
curl -X POST https://api.ceit-iot-lab.site/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "phone": "85620123456",
    "password": "mypassword",
    "plam_code": "PALM_ABC123"
  }'
```

### 2. Login

```bash
curl -X POST https://api.ceit-iot-lab.site/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "85620123456",
    "password": "mypassword"
  }'
```

### 3. Get Profile

```bash
curl -X GET https://api.ceit-iot-lab.site/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Top Up Balance (with Palm Code)

```bash
# Using palm code in header
curl -X POST https://api.ceit-iot-lab.site/api/users/topup \
  -H "x-palm-code: PALM_ABC123" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000
  }'

# Using Bearer token
curl -X POST https://api.ceit-iot-lab.site/api/users/topup \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000
  }'
```

### 5. Create Order (with Palm Code)

```bash
# Using palm code in header
curl -X POST https://api.ceit-iot-lab.site/api/orders \
  -H "x-palm-code: PALM_ABC123" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "description": "Coffee purchase",
    "items": {"coffee": 2}
  }'

# Using Bearer token
curl -X POST https://api.ceit-iot-lab.site/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "description": "Coffee purchase",
    "items": {"coffee": 2}
  }'
```

### 6. Get Top-Up History

```bash
curl -X GET https://api.ceit-iot-lab.site/api/transactions/topup-history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Get Order History

```bash
curl -X GET https://api.ceit-iot-lab.site/api/transactions/order-history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name      VARCHAR NOT NULL,
  last_name       VARCHAR NOT NULL,
  phone           VARCHAR UNIQUE NOT NULL,
  password        VARCHAR NOT NULL,
  plam_code       VARCHAR UNIQUE,
  amount          DECIMAL(10,2) DEFAULT 0,
  vertify_plam    BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          DECIMAL(10,2) NOT NULL,
  payment_method  VARCHAR NOT NULL,
  payment_status  VARCHAR DEFAULT 'pending',
  transaction_id  VARCHAR UNIQUE,
  items           JSON,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

## Payment Flow

### Top-Up Flow

1. User calls `POST /api/users/topup` with amount
2. System creates order with `items.type = "topup"` and status = "completed"
3. PhajayPay payment link is generated
4. **User balance is increased immediately**
5. Payment link returned for record keeping

### Purchase Flow

1. User calls `POST /api/orders` with amount and items
2. System checks if user has sufficient balance
3. PhajayPay payment link is generated
4. Order is created with status = "completed"
5. **User balance is decreased immediately**
6. Payment link returned for record keeping

---

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/palm_payment_db"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
NODE_ENV=development

# PhajayPay Configuration
PHAJAY_SECRET_KEY="your-phajay-secret-key"
APP_URL="http://localhost:3000"
```

---

## Notes

- All amounts are in LAK (Lao Kip)
- JWT tokens expire after 7 days
- Palm codes must be unique across all users
- Phone numbers must be unique
- Orders can only be accessed by their owner
- Balance is updated immediately for both top-ups and purchases
- PhajayPay uses Basic Authentication with base64-encoded secret key

---

## Support

For issues or questions, please contact the development team.
