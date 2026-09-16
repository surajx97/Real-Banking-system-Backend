# 🏦 Backend Ledger Banking API

A **ledger-based banking backend** built with **Node.js, Express, MongoDB, and Mongoose**, designed to demonstrate how core banking operations can be modeled using immutable ledger entries, transactional writes, authentication, idempotency, and asynchronous email notifications.

The project focuses on backend engineering concepts that are relevant to **financial systems and transaction-heavy applications**, including:

* 🔐 JWT-based authentication
* 💰 Ledger-driven balance calculation
* 🔄 Atomic fund transfers using MongoDB transactions
* ♻️ Idempotency for duplicate-request protection
* 🏦 Multiple accounts per user
* 📊 Transaction and ledger modeling
* 📧 Gmail OAuth2 email notifications
* 🛡️ Account status management
* 🧩 Mongoose middleware, indexes, validation, and relationships

> **Project status:** Academic/development project. The architecture demonstrates production-oriented backend concepts, but the current implementation still has known limitations. See [Known Limitations](#-known-limitations) before using it beyond local development.

---

## ✨ Core Features

### 🔐 Authentication & Authorization

* User registration and login
* Password hashing using `bcrypt`
* JWT authentication
* Cookie-based authentication
* Bearer-token authentication
* Protected routes using authentication middleware
* System-user support for initial account funding

### 🏦 Account Management

* Create multiple bank accounts for a user
* List authenticated user's accounts
* Account ownership validation
* Account status management:

  * `ACTIVE`
  * `FROZEN`
  * `CLOSED`
* Default currency: `INR`

### 💰 Ledger-Based Banking

Instead of storing a mutable `balance` field inside the account document, the system derives the balance from ledger entries.

```text
Balance = Total Credits - Total Debits
```

Example:

```text
CREDIT  ₹10,000
DEBIT   ₹2,000
DEBIT   ₹1,000
----------------
Balance ₹7,000
```

This provides a transaction history that can be used to reconstruct an account's financial state.

### 🔄 Fund Transfers

A transfer creates two ledger entries:

```text
Sender Account
      │
      │ DEBIT ₹500
      ▼
   Transaction
      │
      │ CREDIT ₹500
      ▼
Recipient Account
```

The debit and credit operations are intended to be committed atomically using a MongoDB transaction.

### ♻️ Idempotency

Transfer requests accept an `idempotencyKey`.

```json
{
  "fromAccount": "SENDER_ACCOUNT_ID",
  "toAccount": "RECIPIENT_ACCOUNT_ID",
  "amount": 500,
  "idempotencyKey": "transfer-unique-001"
}
```

The key is intended to ensure that retrying the **same logical request** does not create another transfer.

For example:

```text
Request 1
idempotencyKey = transfer-unique-001
       ↓
Transfer created

Network failure
       ↓
Client retries

Request 2
idempotencyKey = transfer-unique-001
       ↓
Existing transaction detected
       ↓
Duplicate transfer avoided
```

### 📧 Email Notifications

The project integrates **Nodemailer + Gmail OAuth2** for transactional emails.

Supported notification flows include:

* Registration success
* Successful transaction
* Failed transaction

Email credentials are loaded through environment variables rather than hard-coded into the application.

---

# 🛠️ Technology Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| **Node.js**      | Backend runtime               |
| **Express 5**    | HTTP server and API framework |
| **MongoDB**      | Database                      |
| **Mongoose**     | ODM and data modeling         |
| **JWT**          | Authentication                |
| **bcrypt**       | Password hashing              |
| **Nodemailer**   | Email delivery                |
| **Gmail OAuth2** | Email authentication          |
| **dotenv**       | Environment configuration     |
| **nodemon**      | Development workflow          |

---

# 📁 Project Architecture

```text
banking_system/
│
├── server.js
├── package.json
├── .env
├── .gitignore
│
└── src/
    │
    ├── app.js
    │
    ├── config/
    │   └── db.js
    │
    ├── controller/
    │   ├── auth.controller.js
    │   ├── account.controller.js
    │   └── transaction.controller.js
    │
    ├── middleware/
    │   └── auth.middleware.js
    │
    ├── models/
    │   ├── user.models.js
    │   ├── account.model.js
    │   ├── ledger.Model.js
    │   └── transactions.model.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── account.routes.js
    │   └── transaction.routes.js
    │
    └── services/
        └── email.service.js
```

### Architectural Flow

```text
                 ┌──────────────────┐
                 │      Client      │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │     Express      │
                 │      Routes      │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   Auth Middleware│
                 │      / JWT       │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   Controllers    │
                 └────────┬─────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          User Model  Account Model  Transaction
                                      │
                                      ▼
                               Ledger Entries
                                      │
                                      ▼
                                  MongoDB
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js 18+
* npm
* MongoDB / MongoDB Atlas
* Gmail OAuth2 credentials if email notifications are enabled

MongoDB Atlas is recommended because the transfer workflow uses MongoDB sessions and transactions.

---

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret

CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
EMAIL_USER=your_sender_email@gmail.com
```

### ⚠️ Never commit secrets

Do not commit:

```text
.env
JWT secrets
MongoDB passwords
OAuth client secrets
Refresh tokens
Email credentials
```

Make sure `.env` is included in `.gitignore`.

---

# ▶️ Running the Project

### Development

```bash
npm run dev
```

### Start

```bash
npm start
```

Default server:

```text
http://localhost:3000
```

> The current implementation does not yet include a complete automated test suite.

---

# 🔐 Authentication

After registration or login, the API provides a JWT and sets a `token` cookie.

Protected endpoints can authenticate using either:

### Cookie

```text
token=<JWT>
```

### Bearer Token

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

For JSON requests:

```http
Content-Type: application/json
```

---

# 📚 API Reference

Base URL:

```text
http://localhost:3000/api
```

---

## 1. Register User

```http
POST /api/auth/register
```

### Request

```json
{
  "name": "Asha Sharma",
  "email": "asha@example.com",
  "password": "strong-password"
}
```

### Flow

```text
Request
   ↓
Validate user
   ↓
Hash password
   ↓
Create user
   ↓
Generate JWT
   ↓
Set authentication cookie
   ↓
Send welcome email
```

---

## 2. Login

```http
POST /api/auth/login
```

### Request

```json
{
  "email": "asha@example.com",
  "password": "strong-password"
}
```

The server verifies the password and generates an authentication token.

---

# 🏦 Account APIs

## Create Account

```http
POST /api/accounts/
```

Authentication required.

No request body is required.

A new account is created with:

```json
{
  "status": "ACTIVE",
  "currency": "INR"
}
```

Save the returned account `_id`.

> **Important:** Transaction APIs use an **account ID**, not a user ID.

---

## List User Accounts

```http
GET /api/accounts/
```

Authentication required.

Returns accounts associated with the authenticated user.

Example:

```text
User
 ├── Account A
 ├── Account B
 └── Account C
```

This allows one user to maintain multiple accounts.

---

# 💰 Balance API

## Get Account Balance

```http
GET /api/accounts/balance/:accountId
```

Authentication and account ownership are required.

The balance is derived from ledger entries:

```text
Balance = Credits - Debits
```

Example ledger:

```text
Account: A

CREDIT   ₹10,000
DEBIT     ₹2,500
CREDIT    ₹1,000
DEBIT       ₹500
------------------
Balance   ₹8,000
```

The calculation is performed using a MongoDB aggregation pipeline.

---

# 🔄 Fund Transfer

```http
POST /api/transactions/
```

Authentication required.

### Request

```json
{
  "fromAccount": "SENDER_ACCOUNT_ID",
  "toAccount": "RECIPIENT_ACCOUNT_ID",
  "amount": 500,
  "idempotencyKey": "transfer-unique-001"
}
```

### Validation

The transfer should verify:

* Sender account exists
* Recipient account exists
* Sender owns the source account
* Both accounts are `ACTIVE`
* Amount is valid
* Sender has sufficient balance
* Idempotency key is valid
* Source and destination accounts are appropriate for the transfer

---

## Transaction Lifecycle

A normal transfer follows this conceptual workflow:

```text
                 Transfer Request
                        │
                        ▼
                Validate Request
                        │
                        ▼
              Check Idempotency Key
                        │
                        ▼
             Find Source Account
                        │
                        ▼
           Find Recipient Account
                        │
                        ▼
             Validate Account State
                        │
                        ▼
             Calculate Balance
                        │
                  ┌─────┴─────┐
                  │           │
              Insufficient   Sufficient
                  │           │
                  ▼           ▼
                FAIL      Start Session
                              │
                              ▼
                    Create Transaction
                         PENDING
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
                Debit Sender     Credit Recipient
                     │                 │
                     └────────┬────────┘
                              ▼
                    Mark Transaction
                       COMPLETED
                              │
                              ▼
                         COMMIT
                              │
                              ▼
                      Send Email
```

---

# 🧾 Ledger Design

The ledger is the financial record of account movements.

A simplified ledger could look like:

| Account   | Type   |  Amount |
| --------- | ------ | ------: |
| Account A | CREDIT | ₹10,000 |
| Account A | DEBIT  |  ₹2,000 |
| Account A | DEBIT  |  ₹1,000 |
| Account B | CREDIT |    ₹500 |

The balance of an account can then be derived from these entries.

### Why a Ledger?

A ledger provides a transaction-oriented history instead of relying only on a mutable balance field.

Conceptually:

```text
Account
   │
   ├── Ledger Entry
   ├── Ledger Entry
   ├── Ledger Entry
   └── Ledger Entry
```

Each ledger entry references the transaction that produced it.

This creates a relationship between:

```text
Transaction
      │
      ├── Debit Ledger Entry
      │
      └── Credit Ledger Entry
```

Ledger records are intended to be immutable.

---

# 🔁 Idempotency

Idempotency is particularly important for payment-style APIs.

Consider:

```text
Client
  │
  │ Transfer ₹500
  │ Key: abc-123
  ▼
Server
  │
  │ Transfer succeeds
  ▼
Network failure
```

The client does not know whether the transaction succeeded.

It retries:

```text
Transfer ₹500
Key: abc-123
```

The backend can identify that `abc-123` already represents the same logical operation and avoid creating another transfer.

### Important Rule

A retry of the **same operation** should reuse the same idempotency key.

A completely new transfer should receive a new key.

```text
Transfer A → key-001
Retry A     → key-001

Transfer B → key-002
```

---

# 💵 Initial System Funding

System users can initialize funds for customer accounts.

```http
POST /api/transactions/system/intial-funds
```

> The route currently uses `intial-funds` (single `i`). This spelling must match the existing route unless the route is renamed.

### Request

```json
{
  "toAccount": "RECIPIENT_ACCOUNT_ID",
  "amount": 1000,
  "idempotencyKey": "initial-funds-unique-001"
}
```

The recipient identifier is an **account ID**.

---

# 🧩 Data Models

## User

```text
User
├── name
├── email
├── password
├── systemUser
├── createdAt
└── updatedAt
```

Important characteristics:

* Email is unique
* Email is normalized to lowercase
* Password is hashed
* Password is excluded from normal queries
* System-user information is protected

---

## Account

```text
Account
├── user → User
├── status
├── currency
├── createdAt
└── updatedAt
```

Supported statuses:

```text
ACTIVE
FROZEN
CLOSED
```

---

## Transaction

```text
Transaction
├── fromAccount → Account
├── toAccount → Account
├── amount
├── status
├── idempotencyKey
├── createdAt
└── updatedAt
```

Transaction states:

```text
PENDING
COMPLETED
FAILED
REVERSED
```

---

## Ledger

```text
Ledger
├── account → Account
├── transaction → Transaction
├── amount
└── type
```

Ledger types:

```text
CREDIT
DEBIT
```

---

# 🔗 Entity Relationships

```text
             ┌─────────────┐
             │    User     │
             └──────┬──────┘
                    1│
                     │
                    N│
             ┌──────▼──────┐
             │   Account   │
             └──────┬──────┘
                    1│
                     │
                    N│
             ┌──────▼──────┐
             │   Ledger    │
             └──────┬──────┘
                    N│
                     │
                    1│
             ┌──────▼──────┐
             │ Transaction │
             └─────────────┘
```

A user can have multiple accounts, while ledger entries belong to individual accounts and reference the transaction that generated them.

---

# 📧 Email Architecture

Email functionality is isolated inside:

```text
src/services/email.service.js
```

The service uses:

```text
Nodemailer
     │
     ▼
Gmail OAuth2
     │
     ▼
Email Provider
```

Supported notification concepts:

```text
Registration
    ↓
Welcome Email

Successful Transaction
    ↓
Transaction Email

Failed Transaction
    ↓
Failure Notification
```

Email delivery should remain separate from the core financial transaction so that an email failure does not incorrectly imply that the financial transaction itself failed.

---

# 🔒 Security Considerations

Before production deployment, the following controls should be implemented and verified:

* Strong random JWT secret
* HTTPS
* Secure cookie configuration
* Request validation
* MongoDB ObjectId validation
* Amount validation
* Account ownership checks
* Rate limiting
* Centralized error handling
* Structured logging
* Secret management
* Proper idempotency handling
* Transactional consistency
* Automated tests
* Credential rotation
* Production database configuration

Never expose:

```text
JWT_SECRET
MONGO_URI credentials
GOOGLE_CLIENT_SECRET
REFRESH_TOKEN
Email credentials
```

---

# ⚠️ Known Limitations

The current codebase is still under development. The following implementation issues should be addressed before production use:

### 1. Ledger model import/export mismatch

The transaction controller currently imports the ledger model using destructuring while the model exports the model directly.

The import/export style should be made consistent.

### 2. MongoDB session typo

The normal transfer flow currently contains:

```javascript
mongoose.startSessoin()
```

The correct Mongoose method is:

```javascript
mongoose.startSession()
```

### 3. Recipient validation issue

The transfer flow should validate the result of the recipient-account query rather than checking the original `toAccount` value.

### 4. Idempotency handling

The current implementation needs safer handling when no existing transaction is found.

Comparisons such as:

```javascript
!transaction.status === "COMPLETED"
```

do not perform the intended status check.

The status should be compared explicitly.

### 5. Account ownership

The transfer flow must verify that the authenticated user owns the `fromAccount`.

Without this check, a valid account ID alone should not authorize a debit.

### 6. Initial-funding lookup

The initial-funds flow currently has a mismatch between the documented `toAccount` semantics and the database lookup.

The request provides an account ID, so the lookup should resolve an account by its `_id`.

### 7. Email service mismatch

The transaction controller expects transaction-email functionality, while the current email service exports only the registration email function.

The service interface should be aligned with the controller.

### 8. Error handling

The application should use centralized Express error-handling middleware instead of handling every error independently.

### 9. Validation

Request validation should be strengthened for:

* ObjectIds
* Amounts
* Email addresses
* Passwords
* Account states
* Idempotency keys

### 10. Automated testing

The project currently does not have a complete automated test suite.

Recommended coverage:

```text
Authentication
    ↓
Account Creation
    ↓
Bala
```
