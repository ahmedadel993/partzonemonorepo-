# Architecture Decision Log

## ADR-001: GraphQL for Admin, REST for Storefront

**Decision:** HotChocolate GraphQL on `/graphql` for the admin dashboard. Minimal API REST on `/api/v1/` for the storefront server actions.

**Reason:** Admin uses Apollo Client, which benefits from GraphQL's normalized cache, schema introspection, and type generation. Storefront uses Next.js Server Actions that call the backend directly — REST/fetch is simpler and avoids the Apollo Client bundle on the user-facing site. Both layers call the same MediatR handlers, so there is no business logic duplication.

**Trade-off:** Two API surface areas to maintain. Mitigated by both being thin layers over MediatR.

## ADR-002: Admin Dashboard Served from Backend wwwroot/admin

**Decision:** Vite build output copied to `backend/src/PartZone.Host/wwwroot/admin/`. IIS serves it via `web.config` rewrite rules. Vite base URL set to `/admin/`.

**Reason:** Single IIS site — no CORS, simpler monsterasp.net deployment, one SSL cert, unified auth cookies if needed. The spec listed this as the preferred option.

**Trade-off:** Admin rebuild requires redeploying the backend. Mitigated by path-filtered CI.

## ADR-003: HotChocolate Annotation-Based (Code-First)

**Decision:** Use C# attributes (`[GraphQLType]`, `[UseProjection]`, etc.) — no `.graphql` SDL files in source.

**Reason:** Single source of truth in C#. Schema is exported to SDL at build time for client consumption (`dotnet graphql export`). More idiomatic for .NET developers; avoids SDL/code sync issues.

**Trade-off:** SDL is a derived artifact, not the source. Trade-off accepted for team simplicity.

## ADR-004: IBM Plex Sans Arabic

**Decision:** IBM Plex Sans Arabic via `next/font/google`, weight range 300–700.

**Reason:** Designed specifically for Arabic UI (unlike Inter, Geist, or Space Grotesk which are Latin-first). Covers both Arabic and Latin scripts in one font family. Satisfies Anti-Slop R-06 (not the AI default pick).

## ADR-005: Dark-Only Theme in Phase 1

**Decision:** Ship dark theme only in Phase 1. Light mode is Phase 2.

**Reason:** Mockup is dark. Anti-Slop R-34 requires BOTH modes to be fully functional before shipping. We do not ship a broken light mode. Phase 2 will implement a complete light/dark toggle.

## ADR-006: packages/shared for Design Tokens

**Decision:** Add `packages/shared` with `tokens.ts`, `tailwind.preset.ts`, and `schemas/index.ts`.

**Reason:** Avoids color token drift between two frontends. Shared Zod schemas (Money, Locale, Pagination) eliminate copy-paste. Adds one small package — justified by concrete duplication prevented.

## ADR-007: EF Core Migrations via Feature Flag

**Decision:** `APPLY_MIGRATIONS=true` env flag for dev/staging. SQL script (`dotnet ef migrations script`) for production monsterasp.net deployment.

**Reason:** monsterasp.net IIS hosting does not support SSH for CLI migrations. The feature flag approach is safe for dev. Production uses a pre-generated script applied via SQL Server Management Studio or a deploy step.

## ADR-008: Two Brand Concepts (Brand vs VehicleMake)

**Decision:** `Brand` = part manufacturer (Bosch, Mann, KYB). `VehicleMake` = vehicle brand (Toyota, Kia, BMW). Never merged.

**Reason:** These are fundamentally different entities. A product has a `Brand` (who made the part) and a `ProductFitment` (which vehicles it fits). Merging them would corrupt catalog queries. Page blocks can bind to either `Brand` or `VehicleMake` for marketing flexibility.
