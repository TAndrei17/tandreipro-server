# Backend Project Guidelines

These rules apply to this backend repository only. Keep changes focused on the Node.js, TypeScript, Express, and PostgreSQL backend; do not add frontend-framework or UI guidance here.

## Security

- Never hardcode secrets, API keys, database credentials, JWT signing secrets, or other credentials in source or tests. Read backend configuration through `process.env` and use `dotenv` for local environment files. Generate ephemeral test credentials at runtime; never reuse production values.
- Keep `.env`, `.env.local`, other environment-specific files, and logs out of version control. Use `.env.example` only as a template with safe placeholders.
- Treat incoming data, database access, authentication, and error output as security-sensitive. Follow the detailed rules in [backend-security.instructions.md](.github/instructions/backend-security.instructions.md).

## Dependencies and Package Manager

- Use npm exclusively and keep `package-lock.json` in sync with `package.json`. Do not use Yarn or another package manager.
- Use `npm ci` for clean dependency installation and run `npm audit` regularly. See [npm-dependencies.instructions.md](.github/instructions/npm-dependencies.instructions.md) for dependency security requirements.

## Git Workflow

- Do not commit, push, merge, or create branches unless the user explicitly approves that Git operation.
- Preserve unrelated working-tree changes. Never discard or overwrite user changes, and do not use destructive Git operations such as `git reset --hard` without explicit approval.
- When asked to commit, create one commit for the completed task and use an English Conventional Commit message (for example, `fix: validate login input`).

## Project Conventions

- Preserve the existing TypeScript, Express, PostgreSQL, and npm project structure and patterns.
- Before adding a utility, middleware, service, or other shared behavior, search the existing project for an implementation to reuse or extend.
- Before finishing, review the diff for duplication, unused code, weak typing, unrelated changes, and violations of applicable instructions.
- Validate changes with the narrowest relevant checks first, using existing npm scripts such as `npm test`, `npm run lint`, and `npm run build`. Expand verification when the changes or results require it.
