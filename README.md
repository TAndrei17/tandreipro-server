[![Maintainability](https://qlty.sh/gh/TAndrei17/projects/tandreipro-server/maintainability.svg)](https://qlty.sh/gh/TAndrei17/projects/tandreipro-server) [![Code Coverage](https://qlty.sh/gh/TAndrei17/projects/tandreipro-server/coverage.svg)](https://qlty.sh/gh/TAndrei17/projects/tandreipro-server)

# Backend for tandrei.pro

Backend service developed for the personal website  
**https://tandrei.pro**

This project provides server-side logic for:

- handling form submissions (questions / contact requests)
- authentication and authorization
- admin panel functionality
- database access and migrations

The repository is published publicly **for portfolio and demonstration purposes only** to showcase backend development skills and code structure.

## Tech Stack & Skills

- Node.js
- TypeScript
- Express
- PostgreSQL
- JWT-based authentication
- HTTP cookies (secure, httpOnly)
- Database migrations
- Environment-based configuration
- Automated testing (Jest)
- Code quality and linting (ESLint)

## Project Structure

```
├── __tests__/              # Automated tests
├── bin/
│   └── app.ts              # Server startup entry point
├── migrations/             # Database migrations
├── scripts/                # Utility and maintenance scripts
├── src/
│   ├── app.ts              # Express app configuration
│   ├── db/                 # Database connection and queries
│   ├── middlewares/        # Custom middlewares
│   ├── routes/             # API routes
│   ├── services/           # Business logic layer
│   ├── types/              # TypeScript types and interfaces
│   └── utils/              # Helper utilities
├── package.json
├── tsconfig.json
├── jest.config.*
├── eslint.config.*
└── README.md
```

## Purpose

This backend was created specifically for tandrei.pro to support:

- secure communication between frontend and server
- user authentication via cookies and tokens
- administrative workflows
- a maintainable and scalable backend architecture

## Turnstile configuration

Set `TURNSTILE_SECRET_KEY` on the backend to the Cloudflare Turnstile secret for the
site key used by the frontend. The frontend build needs `VITE_TURNSTILE_SITE_KEY`
for production (`VITE_TURNSTILE_SITE_KEY_DEV` for development). Never expose the
secret in a frontend variable.

`POST /public/questions` and `POST /auth/login` require `turnstileToken` in the
JSON body. Each token is verified with Cloudflare and can only be used once.
Invalid or missing tokens are rejected; a verification service failure returns
503. Configure production credentials in the deployment environment, not in
tracked files.

## License

All rights reserved.

This repository is public for portfolio and demonstration purposes only.
Viewing the source code is permitted.
Reuse, modification, or redistribution is prohibited without explicit written permission from the author.

## Author

Andrei Trunkin
Personal website: [tandrei.pro](https://tandrei.pro)
