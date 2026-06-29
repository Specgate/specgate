# Corely Architecture

**Version:** 2.0  
**Date:** 2026-04-06

## Intent

Corely is a **modular monolith** built around:

- one Next.js App Router runtime in `apps/app`
- shared business modules in `packages/modules/*`
- shared contracts in `packages/contracts`
- shared persistence schema in `packages/data/prisma`
- shared storage adapters in `packages/storage`

The repository treats Next.js route handlers as the synchronous transport layer, while business logic stays in shared packages.

## Active runtime surfaces

- **App (`apps/app`)**: public pages, admin pages, auth entrypoints, and synchronous API route handlers.
- **Database (`packages/data/prisma`)**: Prisma schema, migrations, and generated client source of truth.
- **Shared module packages (`packages/modules/*`)**: domain entities, application use cases, ports, and infrastructure adapters.
- **Storage package (`packages/storage`)**: runtime adapters for GCS and Vercel Blob behind `ObjectStoragePort`.

## Core rules

1. UI and HTTP transport live in `apps/app`.
2. Business logic lives in `packages/modules/*`.
3. `packages/contracts` is the wire-format source of truth.
4. Prisma access stays behind adapters, not in page components.
5. Route handlers are thin orchestration/serialization layers.
6. Shared modules must stay framework-free.

## Current implementation status

The first extracted module is `todos`, which already follows the new shape:

- Next pages under `apps/app/app/(dashboard)/todos/*`
- route handlers under `apps/app/app/api/todos/*`
- module package under `packages/modules/todos`

Additional legacy domains must follow the same extraction pattern before they become part of the new runtime.
