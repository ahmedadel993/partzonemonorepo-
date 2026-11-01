# Deployment Guide

## Backend + Admin Dashboard — monsterasp.net (IIS, SQL Server)

### Prerequisites
- .NET 8 runtime installed on the server (framework-dependent publish)
- SQL Server instance with a database created
- IIS with ASP.NET Core Module v2 installed

### 1. Build the backend

```bash
cd backend
dotnet publish src/PartZone.Host/PartZone.Host.csproj \
  -c Release \
  -r win-x86 \
  --self-contained false \
  -o ./publish
```

### 2. Build and copy admin dashboard

```bash
cd admin-dashboard
pnpm build
# Copy dist/ into backend's wwwroot/admin/
cp -r dist/* ../backend/publish/wwwroot/admin/
```

### 3. Configure production secrets

Edit `backend/publish/appsettings.Production.json` (never commit secrets):

```json
{
  "ConnectionStrings": {
    "Default": "Server=...;Database=PartZone;User Id=...;Password=...;TrustServerCertificate=True"
  },
  "Jwt": {
    "SecretKey": "<min-32-char-random-secret>",
    "Issuer": "https://yourdomain.com",
    "Audience": "partzone-clients"
  }
}
```

Alternatively use environment variables in the IIS application pool or `web.config` `<environmentVariables>`.

### 4. Apply database migrations

**Option A (development/staging):** Set `APPLY_MIGRATIONS=true` in environment — the app migrates on startup.

**Option B (production — recommended):** Generate a SQL script and apply it via SSMS:

```bash
cd backend
dotnet ef migrations script \
  --project src/PartZone.Host/PartZone.Host.csproj \
  --idempotent \
  --output migrations.sql
# Apply migrations.sql via SQL Server Management Studio
```

### 5. Deploy via FTP / Web Deploy

Upload the contents of `backend/publish/` to your monsterasp.net site root. The `web.config` is included and handles:
- ASP.NET Core hosting (in-process)
- SPA fallback: `/admin/*` requests without a matching file rewrite to `/admin/index.html`

### 6. Verify

- `GET https://yourdomain.com/health` returns `{"status":"Healthy"}`
- Navigate to `https://yourdomain.com/admin/` — should load the React SPA

---

## Storefront — Vercel

### 1. Connect the repository

In the Vercel dashboard, import the `partzonemonorepo-` repository.

### 2. Configure the project

- **Framework Preset:** Next.js
- **Root Directory:** `storefront`
- **Build Command:** `pnpm build` (auto-detected)
- **Install Command:** `pnpm install`

### 3. Environment variables

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api/v1` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `ar` |

### 4. Deploy

Push to `main` (or your production branch). Vercel auto-builds and deploys.

### 5. Verify

- `https://your-storefront.vercel.app/ar` — Arabic RTL home page
- `https://your-storefront.vercel.app/en` — English LTR home page

---

## Development (local)

```bash
# Install all JS dependencies
pnpm install

# Start all JS apps
pnpm dev

# Start backend (separate terminal)
cd backend
dotnet run --project src/PartZone.Host

# Endpoints
# Backend health:     http://localhost:5000/health
# GraphQL playground: http://localhost:5000/graphql
# Storefront:         http://localhost:3000/ar
# Admin dashboard:    http://localhost:5173
```
