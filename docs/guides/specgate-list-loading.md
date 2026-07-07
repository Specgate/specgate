# SpecGate list loading

The backlog/spec list should load through the bundled summary endpoint:

```txt
GET /api/specgate/specs/summary?projectId=...
```

Before:

```txt
1 spec list request + N requests for comments + N requests for decisions + N requests for assets + N requests for checks
```

After:

```txt
1 spec summary request
```

Full comments, decisions, assets, and spec checks are loaded lazily when a spec detail page is opened.

For production-like local timing, use:

```bash
pnpm build:app
pnpm --filter @corely/app start
```

Next.js dev mode still compiles pages and route handlers lazily on first hit, so cold dev requests can remain slow even when the request shape is fixed.
