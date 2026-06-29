# Shared Config Implementation

The monorepo now has one active frontend/runtime stack: **Next.js App Router**.

## Shared configuration ownership

- TypeScript base configs: `packages/tooling/tsconfig`
- Tailwind preset: `packages/tooling/tailwind-preset`
- App UI tokens: `apps/app/app/globals.css`

## App-specific configuration

`apps/app` owns:

- `next.config.ts`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `tsconfig.json`
- `tsconfig.typecheck.json`

## Removed configuration model

The repository uses shared tooling packages for the active Next.js monorepo only.
