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

## License

All rights reserved.

This repository is public for portfolio and demonstration purposes only.
Viewing the source code is permitted.
Reuse, modification, or redistribution is prohibited without explicit written permission from the author.

## Author

Andrei Trunkin
Personal website: [tandrei.pro](https://tandrei.pro)
