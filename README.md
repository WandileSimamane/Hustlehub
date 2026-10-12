# Hustlehub+ 

# INSY7314 - Part 2

**Team Members**
- Sphosethu Ximba – ST10448336
- Andiswa Mavundla – ST10440448
- Wandile Simamane – ST10445696
- Mbali Ndlovu – ST10445933

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) + React Router |
| **Backend API** | Node.js + Express |
| **Database** | MongoDB Atlas / Mongoose |
| **Security** | JSON Web Tokens (JWT), bcrypt, OpenSSL, Express-Rate-Limit |
| **Testing** | Postman / Newman |

## Overview

Users can be divided into three categories: Hustlers, who provide services, Clients, who are looking to hire and Admins, who manage the platform. 

Node.js and Express make up the stack. MongoDB will be added as we progress to other parts. To be able to develop and test the auth flow without first setting up a database, user data is currently kept within an in-memory array. Swapping in MongoDB later shouldn't involve modifying the routes or middleware because the data access is segregated into its own file.


## How a Request Flows Through the App

```
Client -> HTTPS/TLS -> Express JSON parser -> Route -> verifyToken(if protected) -> Controller -> In memory store -> Response
```

This is a standard Express configuration. The verifyToken middleware checks the JWT before protected routes can be accessed
This is the drawing of the broader MERN architecture:  

![MERN architecture diagram](hustlehub-backend/assets/architecture.png) 

```
(Client Tier-> HTTPS/TLS network Tier-> Express controller layer -> abstracted data layer, currently in-memory, MongoDB later.)

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
  "id": 1,
 "role": "Client",
  "iat": 1788524037
  "exp": 1788527637
}
```

This is enough information to identify the individual and their role. There is no name, email address, or password hash. Tokens expire after 1 hour, so if one gets intercepted, the window an attacker has to use it is limited.

`verifyToken` middleware checks for `Authorization: Bearer <token>`. No header -> `401`. Bad or expired signature → `403`.

### 3. Input Validation & Error Handling

Registration checks that `name`, `email`, and `password` are all present before doing anything else, and rejects duplicate emails. Both controllers wrap their logic in `try/catch` so unexpected errors ( DB issues, library errors, etc.) don't crash the process or leak internal details.

Error responses are generic on purpose which are like `"Internal server error during password hashing."` rather than a stack trace or file path. That's mainly to avoid handing an attacker information about the internals of the app.

This validation is still basic as it checks presence, not much else (no email format regex, no password strength rules yet). That's on the list to improve.

### 4. HTTPS

The server runs over HTTPS using a locally generated self-signed certificate (`server.key` / `server.cert`), created with OpenSSL.

This encrypts everything in transit such as  headers, the JWT and request bodies This is done so it can't be read or tampered with by something sitting on the same network. But it's important to say clearly: **a self-signed cert only works for local development.** Browsers and API clients don't trust it by default for example, Postman needs SSL verification turned off to even talk to it.

## Project Structure

```
hustlehub-backend/
├── assets/
│   └── architecture.png
|   └──ST10445696 Wandile Simamane INSY7314- Part 1.docx
├── certs/                      # gitignored
│   ├── server.cert
│   └── server.key
├── controllers/
│   └── authController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   └── userModel.js             # in-memory store for now
├── routes/
│   └── authRoutes.js
├── .env                         # gitignored
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## API Endpoints

| Method | Endpoint | Access | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Registers a user, hashes password | `201`, `400`, `500` |
| `POST` | `/api/auth/login` | Public | Verifies credentials, returns JWT | `200`, `400`, `401`, `500` |
| `GET` | `/api/auth/protected-test` | Protected | Sanity check for JWT middleware | `200`, `401`, `403` |

## Setup

**Prerequisites:** Node 18+, npm 9+, OpenSSL.

```bash
git clone https://github.com/EMKNDN/emkndn-insy7314-2026-insy7314-poe-wandilesimamane.git
cd emkndn-insy7314-2026-insy7314-poe-wandilesimamane
npm install
```

To run the secure authentication flow locally, you must configure your own environment variables and generate a local SSL certificate. 

Open Gitbash terminal to run and ensure the files under the hustlehub-backend folder:

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365 -subj "/CN=localhost"
```

cd Create a `.env` file under the hustlehub-backend folder :

```
PORT=5000
JWT_SECRET=super_secret_hustlehub_development_key_2026
```


    
The server will boot securely at `https://localhost:5000`. 
**Important:** Make sure "SSL certificate verification" is toggled OFF in your Postman settings (under General) before testing the endpoints, otherwise Postman will block the self-signed certificate.

## Testing
Endpoints were tested using Postman rather than writing automated tests for this part. The collection (Hustlehub Part 2.postman_collection.json) is included in the repo, and testing is demonstrated on the Youtube video.

## References


