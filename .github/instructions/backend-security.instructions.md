---
description: "Use when changing backend configuration, Express middleware, routes, authentication, database queries, request validation, errors, or logging. Covers secrets and backend security."
applyTo: "src/**/*.ts, bin/**/*.ts, scripts/**/*.ts, migrations/**/*.ts, __tests__/**/*.ts"
---
# Backend Security

## Secrets and Configuration

- Read backend secrets and configuration exclusively through `process.env`. Load local environment variables with `dotenv` at the process entry point; fail clearly at startup when required variables are missing or invalid.
- Never hardcode secrets, API keys, database credentials, JWT secrets, or other credentials in source or tests. Generate ephemeral test credentials at runtime; never reuse production values. Keep `.env`, `.env.local`, other environment-specific files, and logs ignored by Git.
- Maintain a tracked `.env.example` containing variable names and safe, clearly non-production placeholders only. Never copy values from a local `.env` into the template.

## Express and HTTP

- Register `helmet` middleware to set secure HTTP headers.
- Apply `express-rate-limit` to authentication, password-reset, and other sensitive or public endpoints that could be abused for brute force or denial of service. Choose limits appropriate to the endpoint and deployment.
- Configure `cors` with an explicit allowed origin from `process.env.CLIENT_URL` (for example, `origin: process.env.CLIENT_URL`). Never allow `*` in production; if supporting multiple origins, validate each against an explicit allowlist.
- Validate and sanitize all untrusted `req.body`, `req.query`, and `req.params` data with Zod or `express-validator` before using it.

## Database Access

- Never construct SQL or NoSQL queries by concatenating untrusted input. Use parameterized queries or a trusted ORM/ODM, and validate values before they reach the data layer.
- Keep authorization checks on protected operations; authentication alone does not establish permission to access a resource.

## Errors and Logging

- Use a global Express error handler and return a consistent, minimal error shape. In production, never expose stack traces, database internals, SQL, system paths, secrets, or other implementation details to clients.
- Use a structured logging library such as Winston or Pino. Mask passwords, tokens, cookies, authorization headers, secrets, and sensitive PII; do not log raw request bodies or environment values.
- Report operational failures through the project's established error/logging path rather than silently swallowing them.
