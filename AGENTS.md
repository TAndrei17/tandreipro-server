# Backend Project Guidelines

These rules apply to this backend repository only. Keep changes focused on the Node.js, TypeScript, Express, and PostgreSQL backend; do not add frontend-framework or UI guidance here.

## Security

- Never hardcode secrets, API keys, database credentials, JWT signing secrets, or other credentials in source or tests. Read backend configuration through `process.env` and use `dotenv` for local environment files. Generate ephemeral test credentials at runtime; never reuse production values.
- Keep `.env`, `.env.local`, other environment-specific files, and logs out of version control. Use `.env.example` only as a template with safe placeholders.
- Treat incoming data, database access, authentication, and error output as security-sensitive. Follow the detailed rules in [backend-security.instructions.md](.github/instructions/backend-security.instructions.md).

## Dependencies and Package Manager

- Use npm exclusively and keep `package-lock.json` in sync with `package.json`. Do not use Yarn or another package manager.
- Use `npm ci` for clean dependency installation and run `npm audit` regularly. See [npm-dependencies.instructions.md](.github/instructions/npm-dependencies.instructions.md) for dependency security requirements.

## Project Conventions

- Preserve the existing TypeScript, Express, PostgreSQL, and npm project structure and patterns.
- Validate relevant changes with the existing npm scripts, such as `npm test`, `npm run lint`, and `npm run build`.
