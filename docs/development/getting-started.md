# Getting started

## Prerequisites

| Tool | Version | Install |
| --- | --- | --- |
| Node.js | 24 (see `.nvmrc`) | [nodejs.org](https://nodejs.org) or `nvm install` / `fnm use` |
| pnpm | 10 (pinned in `package.json`) | `corepack enable` (ships with Node) |
| Docker | Recent Docker Desktop or Engine with Compose v2 | [docker.com](https://www.docker.com/) |

On Windows, use WSL 2 or Git Bash for the shell commands below.

## First run

```bash
git clone https://github.com/Ziad-irl/inbetween.git
cd inbetween
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate     # applies all migrations to your local database
pnpm db:seed        # category tree
pnpm dev
```

| Service | URL |
| --- | --- |
| Web | http://localhost:3000 (redirects to `/ar`) |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/docs |
| Health | http://localhost:4000/api/health |
| Mailpit | http://localhost:8025 |
| Prisma Studio | `pnpm db:studio` |

## Everyday commands

```bash
pnpm dev                                   # all apps in watch mode
pnpm --filter @inbetween/api dev           # one app
pnpm check                                 # lint + typecheck + test + build (what CI runs)
pnpm --filter @inbetween/shared test       # unit tests for domain rules
pnpm format                                # Prettier
```

## Database workflow

1. Edit `apps/api/prisma/schema.prisma`.
2. `pnpm --filter @inbetween/api exec prisma migrate dev --name <change>` creates and applies a migration.
3. If the change needs constraints Prisma can't express (CHECK, EXCLUDE, triggers), add them to the generated `migration.sql` before committing. See `apps/api/prisma/sql/README.md`.
4. Commit the schema and the migration together.

Reset local data: `pnpm --filter @inbetween/api exec prisma migrate reset`.

## Troubleshooting

- **`Invalid environment configuration`** on API start: compare your `.env` with `.env.example`.
- **Web shows "Categories will appear here…"**: the API isn't running or the database isn't seeded.
- **Port in use**: change `API_PORT` in `.env` or stop the other process.
- **Postgres extensions missing**: the init script only runs on a fresh volume. `docker compose down -v` and start again.
