# MSMS Step 1 Foundation

Enterprise-grade foundation for the Motor Service Management System.

## Included

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn-style UI primitives
- Prisma PostgreSQL schema and initial migration
- Custom credentials login with Argon2 password verification
- Server-side failed login tracking and 15-minute lockout after 3 failed attempts
- Route protection middleware
- Owner seed account: `Samielectricalengineeringservices@gmail.com` / `msmssmsmsami`

## Setup

1. Copy `.env.example` to `.env` and set secure values.
2. Start PostgreSQL:

```bash
docker compose up -d
```

3. Apply migrations and seed the owner account:

```bash
pnpm prisma:deploy
pnpm db:seed
```

4. Run the app:

```bash
pnpm dev
```

Only `/login` is public. All other routes require authentication.
