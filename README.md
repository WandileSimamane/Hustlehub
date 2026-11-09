# Hustlehub+

## Demo Video

[HustleHub+ Demo Video](https://youtu.be/35GWbADyyQ4)

## Forked Repository

To connect SonarCloud and the CI/CD pipeline outside the organisation (due to permission restrictions on the Classroom50 repo), this project was forked to a personal repository containing all commits:

**Forked Repo:** [https://github.com/WandileSimamane/Hustlehub](https://github.com/WandileSimamane/Hustlehub)

# INSY7314 - Part 3

**Team Members**

- Sphosethu Ximba – ST10448336
- Andiswa Mavundla – ST10440448
- Wandile Simamane – ST10445696
- Mbali Ndlovu – ST10445933

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) + React Router + Tailwind CSS |
| **Charts** | Recharts |
| **Backend API** | Node.js + Express |
| **Database** | MongoDB Atlas / Mongoose |
| **Security** | JSON Web Tokens (JWT), bcrypt, OpenSSL, Express-Rate-Limit |
| **Containerisation** | Docker + Docker Compose |
| **Testing** | Postman / Newman, Vitest |
| **Logging & Monitoring** | Winston + Better Stack |
| **E2E Testing** | Playwright |
| **CI/CD Pipeline** | GitHub Actions |
| **Static Code Analysis (SAST)** | SonarCloud |


## Application Features

HustleHub+ is a secure, dual-sided marketplace platform connecting independent service providers (Freelancers) with customers (Clients).

**Role-Based Workflows:** Different dashboards and navigation links dynamically rendered based on whether the logged in user is a Client or a Freelancer.

**Gig Marketplace Feed:** A browsable UI where Clients can discover and search for available services offered by Freelancers.

**Secure Booking Engine:** Clients can request gigs. The system enforces strict separation, ensuring Freelancers cannot book their own services.

**Transaction Lifecycle:** The booking flow uses a mock payment gateway. A client pays for a gig, moving the booking status to "Paid/Escrow". Only after this escrow hold is secured can the Freelancer confirm the gig, which then automatically generates an immutable financial income transaction record in the database.

**Income Tracking:** An analytics dashboard that calculates confirmed transaction data to display a Freelancer's earned revenue.

**Tax Estimation:** The Income Dashboard turns confirmed income into an estimated tax liability and net take-home pay, shown with summary cards and charts (see [Tax Estimation](#tax-estimation)).

---

## How a Request Flows Through the App

```
Client -> HTTPS/TLS -> Express JSON parser -> Route -> verifyToken(if protected) -> Controller -> Service -> MongoDB -> Response
```

This is a standard Express configuration. The verifyToken middleware checks the JWT before protected routes can be accessed

This is the drawing of the broader MERN architecture:

![MERN architecture diagram](hustlehub-backend/assets/architecture.png)

```
(Client Tier-> HTTPS/TLS network Tier-> Express controller layer -> service layer -> MongoDB data layer.)
```

## Security Decisions

### 1. Password Hashing with bcrypt

Registration (`POST /api/auth/register`) hashes the password with `bcrypt.hash()` using 10 salt rounds before it's ever stored.

#### Why use bcrypt instead of merely SHA-256?

We use bcrypt to hash passwords before storing them. We did not use SHA-256 because it is designed to be a fast general-purpose hashing algorithm, which is not ideal for storing passwords. bcrypt is slower and uses a salt, meaning that even if two users have the same password, their stored hashes will be different. This makes password cracking more difficult if the password data is ever exposed.

Login (`POST /api/auth/login`) compares passwords using `bcrypt.compare()` rather than manually comparing hashes, since it's built to avoid leaking timing information.

### 2. JWT Authentication

On successful login, the server signs a JWT with `jwt.sign()` using HMAC-SHA256 and a secret from `.env`. The payload is intentionally small:

```json
{
  "id": "64f1c2a9e4b0a1b2c3d4e5f6",
  "role": "Client",
  "iat": 1788524037,
  "exp": 1788527637
}
```

This is enough information to identify the individual and their role. There is no name, email address, or password hash. Tokens expire after 1 hour, so if one gets intercepted, the window an attacker has to use it is limited.

`verifyToken` middleware checks for `Authorization: Bearer <token>`. No header -> `401`. Bad or expired signature → `403`.

### 3. Input Validation & Error Handling

Registration endpoints enforce presence checks for required fields (`name`, `email`, `password`) and reject duplicate email registrations. Controllers wrap logic in `try/catch` blocks, returning generic error messages (e.g., "Internal server error") to avoid leaking stack traces or system file paths to malicious actors.

User ids used in database queries are validated as MongoDB ObjectIds before they reach any query (`toObjectId` in `dashboardService.js`), and `express-mongo-sanitize` strips query operators from incoming requests.

### 4. HTTPS

The server runs over HTTPS using a locally generated self-signed certificate (`server.key` / `server.cert`), created with OpenSSL.

This encrypts everything in transit such as  headers, the JWT and request bodies This is done so it can't be read or tampered with by something sitting on the same network. But it's important to say clearly: **a self-signed cert only works for local development.** Browsers and API clients don't trust it by default for example, Postman needs SSL verification turned off to even talk to it.

In Part 3 the server was changed so it **refuses to start** if the certificate or key is missing. It can no longer fall back to plain HTTP by accident, which is what had happened inside Docker. The frontend calls the API over `https`, and `securityHeaders.js` adds a Content-Security-Policy and HSTS to every response.

### 5. Brute-Force Protection (Rate Limiting)

The `/api/auth/login` route utilizes `express-rate-limit` to restrict users to 5 login attempts per 15-minute window. Exceeding this threshold triggers a `429 Too Many Requests` response, effectively neutralizing automated credential-stuffing attacks.

### 6. Secrets Management

The MongoDB connection string was removed from `server.js`. The backend reads it only from the `MONGODB_URI` environment variable and exits with a clear message if it is missing, so credentials are never stored in source control.

## Project Structure

```text
emkndn-insy7314-2026-insy.../
├── docker-compose.yml          # Orchestrates the backend and frontend containers
├── hustlehub-backend/
│   ├── assets/                 # Architecture diagram and app screenshots
│   │   ├── cicd-pipeline-pass.png
│   │   ├── docker-containers-running.png
│   │   ├── escrow-payment-flow-client.png
│   │   ├── escrow-payment-flow-freelancer.png
│   │   ├── playwright-e2e-pass.png
│   │   └── sonarcloud-clean-security.png
│   ├── postman/                # Exported Postman test collections
│   ├── src/
│   │   ├── controllers/        # auth, booking, dashboard, and gig controllers
│   │   ├── middleware/         # auth, RBAC, rate limiter, and validation middleware
│   │   ├── models/             # booking, gig, transaction, and user Mongoose models
│   │   ├── routes/             # API route definitions
│   │   └── services/           # Business logic (dashboardService, taxService)
│   ├── .env                    # Backend environment variables (gitignored)
│   ├── Dockerfile              # Backend container image
│   ├── server.cert             # Local HTTPS certificate
│   ├── server.key              # Local HTTPS key
│   └── server.js               # Express application entry point
│
├── hustlehub-frontend/
│   ├── public/                 # Public static assets
│   ├── src/
│   │   ├── assets/             # Frontend specific assets
│   │   ├── components/         # React UI components (Dashboard, IncomeDashboard, GigFeed, Auth, etc.)
│   │   ├── api.js              # Frontend API configuration and calls
│   │   ├── App.jsx             # Main React Router configuration
│   │   ├── gigUtils.js         # Frontend utility functions
│   │   ├── index.css           # Global Tailwind and base styles
│   │   └── main.jsx            # React DOM rendering entry point
│   ├── Dockerfile              # Frontend container image
│   ├── eslint.config.js        # Linter configuration
│   ├── index.html              # Vite HTML template
│   ├── package.json            # Frontend dependencies and scripts
│   ├── tailwind.config.js      # Tailwind CSS framework configuration
│   └── vite.config.js          # Vite build tool configuration
```

## API Endpoints

| Method | Endpoint | Access | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a user, hashes password | `201`, `400`, `500` |
| `POST` | `/api/auth/login` | Public | Verifies credentials, returns JWT | `200`, `400`, `401`, `429`, `500` |
| `GET` | `/api/auth/protected-test` | Protected | Sanity check for JWT middleware | `200`, `401`, `403` |
| `POST` | `/api/bookings` | Client only | Creates a booking (blocked for Freelancers) | `201`, `400`, `403`, `500` |
| `POST` | `/api/bookings/:id/pay` | Client only | Processes mock payment for a specific booking (moves it to Paid/Escrow) | `200`, `400`, `403`, `404`, `500` |
| `GET` | `/api/bookings` | Protected | Fetches bookings based on user role | `200`, `401`, `500` |
| `PUT` | `/api/bookings/:id` | Freelancer only | Confirms booking, generates transaction | `200`, `400`, `403`, `404`, `500` |
| `GET` | `/api/dashboard/summary` | Freelancer only | Gross income, estimated tax, net take-home and monthly breakdown | `200`, `401`, `403`, `500` |
| `GET` | `/api/dashboard/transactions` | Freelancer only | Payment history for the freelancer | `200`, `401`, `403`, `500` |
| `GET` | `/api/dashboard/bookings` | Freelancer only | Bookings received by the freelancer | `200`, `401`, `403`, `500` |
| `PUT` | `/api/gigs/:id/status` | Freelancer / Admin | Toggles a gig's visibility status between published and unpublished | `200`, `403`, `404`, `500` |

---

## Tax Estimation

HustleHub+ gives each freelancer an estimate of the income tax they may owe, based on their **confirmed** income. The estimate is calculated on the server in `hustlehub-backend/src/services/taxService.js` and returned by the dashboard service.

### What counts as income

A `Transaction` is only created after the freelancer confirms a booking, so every Transaction is confirmed income. Gross income is the sum of the `amount` field across the freelancer's Transactions, calculated in MongoDB with an aggregation pipeline. Amounts are rounded to 2 decimal places.

### How tax is calculated

The estimate uses the South African SARS individual income tax rates for the **2026/27 tax year**

## Security Implementation & Review

### 1. Own Security Features

HustleHub+ incorporates custom backend security measures beyond standard authentication flows to ensure high resilience and data integrity:

#### A. Database-Backed Account Lockout

**Implementation Location:** Backend (`src/services/authService.js` & `models/userModel.js`)

**Mechanism:** Tracks consecutive failed login attempts on the User schema. If a user enters an incorrect password 5 consecutive times, the account status updates automatically, setting a lockout timer (`lockUntil`) for 15 minutes.

**Purpose:** Prevents automated credential stuffing and brute-force dictionary attacks against user accounts.

#### B. Global NoSQL Payload Sanitization

**Implementation Location:** Backend (`server.js` using `express-mongo-sanitize`)

**Mechanism:** Intercepts all incoming client requests (params, body, and query strings) and strips out reserved MongoDB query operators (such as `$` and `.`).

**Purpose:** Neutralizes NoSQL Injection vulnerabilities by ensuring raw malicious objects cannot alter application query logic.

---

### 2. Final Security Review & Threat Mitigation Matrix

| Security Threat | Severity | Impacted Component | Implemented Protection & Controls |
| :--- | :--- | :--- | :--- |
| **NoSQL Injection** | High | Database / Backend APIs | **Global Payload Sanitization:** Installed `express-mongo-sanitize` middleware in `server.js` to strip malicious query selectors (`$gt`, `$ne`, etc.) from all incoming payloads prior to query execution. |
| **Brute-Force & Credential Stuffing** | High | Authentication Flow | **Database-Backed Account Lockout:** Tracks failed login counter (`loginAttempts`) directly on the User model. Enforces a mandatory 15-minute lockout after 5 consecutive failures. |
| **Cross-Site Scripting (XSS)** | Medium | Frontend / Client Application | **Input/Output Escaping & Content Sanitization:** Ensures user-submitted string fields (e.g., gig descriptions, user profile names) are safe to render without risk of script execution. |
| **Sensitive Credential Exposure** | Critical | Repository & Server Environment | **Strict Environment Isolation:** Enforces strict `.env` file isolation for `MONGODB_URI` and `JWT_SECRET`. Excluded sensitive configuration files from version control via `.gitignore`. |
| **Broken Access Control (BAC)** | High | Protected API Endpoints | **Role & Ownership Verification:** Enforces JWT verification combined with backend ownership checks (`gig.owner.toString() === user.id` or `user.role === 'Admin'`) before permitting edit or delete operations. |

## Static Application Security Testing (SAST) & Remediation

Static Application Security Testing was executed via SonarCloud integrated into the GitHub Actions CI/CD pipeline. All identified critical (Blocker) vulnerabilities and high-severity container security flags were successfully remediated.

> SonarCloud and the CI/CD pipeline were connected to the forked repository: [https://github.com/WandileSimamane/Hustlehub](https://github.com/WandileSimamane/Hustlehub)

### SAST Vulnerability Fixes Applied

**1. NoSQL Injection Vulnerabilities (Blocker / Critical)**

- **Root Cause:** SonarCloud flagged input flows where user-supplied parameters from decoded JWTs (`req.user.id`) and HTTP request bodies (`gigId`, `email`, `category`) were fed into Mongoose database sinks (`Booking.find()`, `User.findOne()`, `Gig.findById()`).
- **Fix Applied:** Enforced strict type hygiene by casting all incoming parameters to primitive strings using `String()` prior to constructing queries or passing arguments to database methods. This terminates the taint analysis path and eliminates NoSQL operator-injection vectors.

**2. Dockerfile Build Context & Secret Exposure (High Severity)**

- **Root Cause:** SonarCloud flagged broad recursive `COPY . .` instructions inside container definitions as a data leakage risk.
- **Fix Applied:** Configured isolated build contexts using dedicated `.dockerignore` files to exclude `.env`, `.git`, and `node_modules`. Migrated builds to non-root execution (`USER node`), enforced locked dependency resolution (`npm ci`), and guarded dependency lifecycle scripts (`--ignore-scripts`).

**Residual Hotspots Reviewed:**

The remaining flags in `server.js` represent intentional architectural choices: controlled CORS middleware enabling frontend communication, and trusted public DNS fallback targets (`1.1.1.1`, `8.8.8.8`) for external connectivity health checks.

## Project Evidence

Below is the visual evidence supporting the successful deployment, testing, and security hardening of the HustleHub+ application:

### CI/CD Pipeline (GitHub Actions)

![CI/CD pipeline passing](hustlehub-backend/assets/cicd-pipeline-pass.png.png)

### Docker Containers Running

![Docker containers running](hustlehub-backend/assets/docker-containers-running.png.jpeg)

### Escrow Payment Flow – Client View

The client side of the mock payment gateway, where the client pays for a gig and the booking moves to Paid/Escrow.

![Escrow payment flow - client view](hustlehub-backend/assets/escrow-payment-flow-client.png.png)

### Escrow Payment Flow – Freelancer View

The freelancer side of the same booking, where the freelancer sees the escrow-secured booking and confirms it, generating the income transaction.

![Escrow payment flow - freelancer view](hustlehub-backend/assets/escrow-payment-flow-freelancer.png.png)

### Playwright End-to-End Tests

![Playwright E2E tests passing](hustlehub-backend/assets/playwright-e2e-pass.png.jpeg)

### SonarCloud Quality Gate – Clean Security

![SonarCloud clean security result](hustlehub-backend/assets/sonarcloud-clean-security.png.png)
<img width="1915" height="882" alt="image" src="https://github.com/user-attachments/assets/532734c5-0178-417c-8544-af08f0853365" />

