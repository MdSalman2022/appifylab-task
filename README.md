# Appifylab full stack engineer task

Social feed built with Next.js, Express, PostgreSQL, Prisma, AWS Lambda, and Cloudflare Workers.

## Structure

- `frontend`: Next.js application
- `backend`: Express API and Prisma schema

## Requirements

- Node.js 22
- AWS Command Line Interface (CLI)
- AWS Serverless Application Model (SAM) CLI
- Wrangler
- Neon PostgreSQL

## Local setup

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run dev
```

```powershell
cd frontend
npm install
Copy-Item .dev.vars.example .dev.vars
npm run dev
```

## Neon

- `DATABASE_URL`: pooled hostname containing `-pooler`
- `DIRECT_DATABASE_URL`: direct hostname without `-pooler`
- TLS option: `sslmode=verify-full&channel_binding=require`

```powershell
cd backend
npx prisma validate
npm run prisma:migrate -- --name init
```

## Verify

```powershell
cd backend
npm run typecheck
npm test
npm run build
```

```powershell
cd frontend
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run cf:dry-run
```

## Deploy backend

```powershell
cd backend
Copy-Item samconfig.example.toml samconfig.toml
npm run sam:validate
npm run sam:build
npm run sam:deploy
```

Health check:

```text
GET https://api.example.com/health
```

```json
{
  "data": {
    "status": "ok",
    "database": { "status": "online" }
  }
}
```

## Deploy frontend

```powershell
cd frontend
npm run deploy
```

## Database migrations

```powershell
cd backend
npm run prisma:migrate:deploy
```
