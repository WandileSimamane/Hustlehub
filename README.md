# Hustlehub+ Backend - Local Security Setup

This is the backend for HustleHub+, a secure freelance marketplace platform  that connects clients with freelancers (also known as Hustlers) allowing them to advertise their services and clients to browse and book the services. In this part we establish security foundations such as HTTPS, password hashing, JWT and register/login before building any marketplace features just yet.

## Overview

Users can be divided into three categories: Hustlers, who provide services, Clients, who are looking to hire and Admins, who manage the platform. 

Node.js and Express make up the stack. MongoDB will be added as we progress to other parts. To be able to develop and test the auth flow without first setting up a database, user data is currently kept within an in-memory array. Swapping in MongoDB later shouldn't involve modifying the routes or middleware because the data access is segregated into its own file.

## How a Request Flows Through the App

```
Client -> HTTPS/TLS -> Express JSON parser -> Route -> verifyToken(if protected) -> Controller -> In memory store -> Response
```

This is a standard Express configuration. VerifyToken is the only middleware that does actual security work as it verifies the JWT on protected routes before allowing the request to reach the controller.
This is the drawing of the broader MERN architecture:  
![MERN architecture diagram](assets/architecture.png) 

(Client Tier-> HTTPS/TLS network Tier-> Express controller layer -> abstracted data layer, currently in-memory, MongoDB later.)


To run the secure authentication flow locally, you must configure your own environment variables and generate a local SSL certificate. 

**1. Install Dependencies**
Navigate to the backend folder and install the newly added security packages (bcrypt, jsonwebtoken, dotenv):
`npm install`

**2. Environment Variables**
Create a `.env` file in the root of the `hustlehub-backend` folder and add the following:
`JWT_SECRET=super_secret_key_change_this_in_production`
`PORT=5000`

**3. Generate Local SSL Certificates**
Our server now runs on HTTPS. You must generate your own local certificates for the server to boot successfully. Run this command in the root of the `hustlehub-backend` folder:
`openssl req -nodes -new -x509 -keyout server.key -out server.cert`
*(You can press Enter to skip/leave blank all the location and organization prompts).*

**4. Start the Server**
Run the application:
`node server.js`
    
The server will boot securely at `https://localhost:5000`. 
**Important:** Make sure "SSL certificate verification" is toggled OFF in your Postman settings (under General) before testing the endpoints, otherwise Postman will block the self-signed certificate.
