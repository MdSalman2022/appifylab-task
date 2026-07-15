# Appifylab full stack engineer task

BuddyScript social feed built with Next.js 16, Express 5, PostgreSQL, Prisma, AWS Lambda, Cloudflare Workers, and Cloudflare R2.

## Features

- Session authentication with Passport Local
- First-party HTTP-only cookies through Next.js API proxies
- Public and author-only private posts
- Text and image posts ordered newest first
- Post create, edit, delete, like, unlike, and paginated likers
- Paginated comments and one-level replies
- Comment and reply like, unlike, and paginated likers
- Direct browser-to-R2 image uploads
- Responsive BuddyScript light and dark themes

## Structure

```text
frontend/   Next.js application and Cloudflare Worker
backend/    Express API, Prisma, Lambda, and SAM template
.github/    CI and production deployment workflows
```

Backend feature flow:

```text
route -> authentication middleware -> controller -> validation -> model/service
```

## Requirements

- Node.js 22
- Neon PostgreSQL
- AWS CLI
- AWS SAM CLI
- Cloudflare account with Workers and R2

## Local setup

Backend:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate:deploy
npm run dev
```

Frontend:

```powershell
cd frontend
npm ci
Copy-Item .dev.vars.example .dev.vars
Copy-Item .env.example .env.local
npm run dev
```

URLs:

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`
- Health: `http://localhost:4000/health`

## Environment

Backend `.env`:

| Variable | Value |
| --- | --- |
| `APP_ORIGIN` | Exact frontend origin without a trailing slash |
| `DATABASE_URL` | Neon pooled URL containing `-pooler` |
| `DIRECT_DATABASE_URL` | Neon direct URL used by migrations |
| `DUMMY_PASSWORD_HASH` | Bcrypt hash for constant-time invalid login checks |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_BUCKET_NAME` | R2 media bucket name |
| `R2_ACCESS_KEY_ID` | Bucket-scoped R2 access key |
| `R2_SECRET_ACCESS_KEY` | Bucket-scoped R2 secret key |

Frontend `.env.local`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | R2 production custom domain, for example `https://media.example.com` |

## Neon

Use `sslmode=verify-full&channel_binding=require` on both URLs.

```powershell
cd backend
npx prisma validate
npm run prisma:migrate -- --name describe_change
```

Production migrations:

```powershell
cd backend
npm run prisma:migrate:deploy
```

## Cloudflare R2

Create the bucket:

```powershell
cd frontend
npx wrangler login
npx wrangler r2 bucket create appifylab-media
```

Apply browser upload CORS:

```powershell
npx wrangler r2 bucket cors set appifylab-media --file ../backend/r2-cors.example.json
npx wrangler r2 bucket cors list appifylab-media
```

R2 dashboard:

1. Open `R2` -> `appifylab-media` -> `Settings`.
2. Add a production custom domain such as `media.example.com`.
3. Create an R2 API token scoped to Object Read & Write for this bucket.
4. Store the access key only in backend `.env`, Lambda parameters, and GitHub secrets.

Upload flow:

```text
Browser -> authenticated presign endpoint -> short-lived signed PUT
Browser -> R2 S3 endpoint -> image bytes
Browser -> posts endpoint -> R2 object key
Feed -> R2 custom domain -> image
```

Accepted images: JPEG, PNG, WebP, maximum 5 MB. Signed URLs expire after five minutes and bind the object key, content type, and byte length.

## API

Infrastructure endpoint:

| Method | Path |
| --- | --- |
| `GET` | `/health` |

Versioned application endpoints:

| Method | Path |
| --- | --- |
| `POST` | `/api/v1/auth/register` |
| `POST` | `/api/v1/auth/login` |
| `POST` | `/api/v1/auth/logout` |
| `GET` | `/api/v1/auth/me` |
| `GET`, `POST` | `/api/v1/posts` |
| `PATCH`, `DELETE` | `/api/v1/posts/:postId` |
| `GET`, `POST`, `DELETE` | `/api/v1/posts/:postId/likes` |
| `GET`, `POST` | `/api/v1/posts/:postId/comments` |
| `GET` | `/api/v1/comments/:commentId/replies` |
| `GET`, `POST`, `DELETE` | `/api/v1/comments/:commentId/likes` |
| `POST` | `/api/v1/uploads/post-images/presign` |

Feed, comments, replies, and liker lists use cursor pagination.

## Verify

Backend:

```powershell
cd backend
npm run lint
npm run typecheck
npm test
npm run build
npm run sam:validate
npm run sam:build
```

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run cf:types:check
npm run cf:dry-run
```

## Deploy backend

Never store deployment parameter values in `samconfig.toml`.

```powershell
cd backend

$databaseUrl = Read-Host "Neon pooled DATABASE_URL"
$dummyPasswordHash = Read-Host "Dummy bcrypt hash"
$r2AccessKeyId = Read-Host "R2 access key ID"
$r2SecretAccessKey = Read-Host "R2 secret access key"

npm run sam:validate
npm run sam:build

sam deploy `
  --stack-name appifylab-api-production `
  --region ap-southeast-1 `
  --resolve-s3 `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides `
  Stage=production `
  AppOrigin=https://appifylab.mhsalman.me `
  DatabaseUrl="$databaseUrl" `
  DummyPasswordHash="$dummyPasswordHash" `
  R2AccountId=CLOUDFLARE_ACCOUNT_ID `
  R2BucketName=appifylab-media `
  R2AccessKeyId="$r2AccessKeyId" `
  R2SecretAccessKey="$r2SecretAccessKey"
```

Health check:

```powershell
Invoke-RestMethod "https://API_ID.execute-api.ap-southeast-1.amazonaws.com/production/health"
```

## Deploy frontend

```powershell
cd frontend
$env:NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example.com"
npm run deploy
```

Production Worker variables are defined in `frontend/wrangler.jsonc`.

## GitHub Actions

`CI` runs on pull requests and pushes to `main`.

- Backend lint, types, tests, TypeScript build, SAM validation, SAM build
- Frontend lint, types, tests, Next build, Cloudflare types, Worker dry run

`Deploy production` runs after successful `main` CI or by manual dispatch.

Production environment secrets:

- `AWS_ROLE_ARN`
- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `DUMMY_PASSWORD_HASH`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_API_TOKEN`

Production environment variables:

- `AWS_REGION`
- `APP_ORIGIN`
- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

AWS authentication uses GitHub OIDC. No long-lived AWS access key is required.

## Security

- Passwords use bcrypt cost 12.
- Invalid email and password checks use the same bcrypt path.
- Sessions are random, hashed in PostgreSQL, HTTP-only, SameSite=Lax, and Secure in production.
- Private posts are filtered in feed, comment, reply, like, and liker endpoints.
- Zod validates all request boundaries and response contracts.
- Helmet, exact-origin CORS, API Gateway throttling, and one-megabyte JSON limits are enabled.
- R2 credentials never enter the frontend bundle or browser.
- Deployment logs mask database, password-hash, and R2 credential parameters.

## Scale

- Stateless Lambda API
- Neon pooled runtime connections and direct migration connection
- Cursor pagination on indexed `(createdAt, id)` access paths
- Denormalized like, comment, and reply counters updated transactionally
- Composite unique keys make likes idempotent
- Direct-to-R2 uploads keep image bytes out of Lambda
- Cloudflare Worker edge delivery and R2 zero-egress media delivery
