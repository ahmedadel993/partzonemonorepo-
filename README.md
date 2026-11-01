# PartZone

Arabic-first e-commerce platform for auto spare parts.

## Architecture

| App | Tech | Host |
|---|---|---|
| `backend/` | ASP.NET Core 8, Modular Monolith, EF Core, MediatR, HotChocolate | monsterasp.net (IIS + SQL Server) |
| `admin-dashboard/` | React 18, Vite, TanStack Router, Apollo Client | monsterasp.net — served from backend `/admin` |
| `storefront/` | Next.js 14 (App Router), next-intl, Arabic RTL default | Vercel |
| `packages/shared/` | Design tokens, Tailwind preset, shared Zod schemas | (internal) |

## Getting started

### Prerequisites

- Node.js >= 20, pnpm >= 9
- .NET 8 SDK
- SQL Server (or SQL Server LocalDB / Docker for dev)

### Install JS dependencies

```bash
pnpm install
```

### Run all JS apps in dev mode

```bash
pnpm dev
```

### Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/PartZone.Host
```

## Docs

- `docs/architecture.md` — ERD, module boundaries, API split
- `docs/deployment.md` — Deployment steps for each target
- `docs/design-system.md` — Color tokens, typography, Anti-Slop checklist
- `docs/decisions.md` — Architecture decision log

## Locales

Default locale is **Arabic (ar, RTL)**. English (en, LTR) is secondary. Locale prefix: `/ar/...` and `/en/...`.
