---
description: "Use when adding, updating, removing, or auditing backend dependencies or changing npm manifests and lockfiles. Enforces npm-only dependency management and vulnerability review."
---
# npm Dependency Management

- Use npm exclusively. Commit `package-lock.json` with dependency changes and never introduce Yarn, pnpm, or a second lockfile.
- Prefer `npm ci` for clean, reproducible installs and use npm commands to add, update, or remove dependencies.
- Run `npm audit` regularly and after dependency changes. Review advisories and remediate vulnerabilities; do not add or retain dependencies with known Critical or High severity CVEs.
- Review package provenance, maintenance, permissions, and transitive dependencies before adopting a package. Do not suppress audit findings without documenting and justifying the exception.
