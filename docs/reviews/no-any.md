You are reviewing the SpecGate/Corely monorepo for dirty TypeScript code only.

Goal:
Strictly clean dirty code without changing product behavior.

Primary rules:

* Do not implement new features.
* Do not redesign UI.
* Do not rename domains unless required by existing architecture.
* Do not touch clean code unnecessarily.
* Only modify files that contain actual dirty code or are required to support the cleanup.
* Keep all behavior backwards-compatible.
* Prefer small, safe, reviewable commits.

Architecture rules:

* Follow Corely architecture.
* `packages/contracts` is the shared source of truth for DTOs, schemas, enums, API request/response types, events, and wire formats.
* `apps/app` route handlers must stay thin and only perform transport orchestration, auth/context extraction, validation, serialization, and use-case invocation.
* Business logic must live in `packages/modules/*`.
* Prisma access must stay behind repository/adapters, not inside UI components, hooks, or route handlers.
* Shared modules must stay framework-free. No Next.js imports inside `packages/modules/*`.

Review and refactor only the following dirty-code categories:

1. Type safety violations

* Remove all explicit `any`.
* Remove all implicit `any`.
* Remove unsafe `unknown` usage where it is used as a shortcut instead of a validated type.
* Remove `as any`.
* Remove unsafe double casts such as `as unknown as X`.
* Remove broad casts that hide type errors.
* Remove untyped object literals crossing boundaries.
* Remove loose `Record<string, any>`, `Record<string, unknown>`, and replace with specific typed records or contract schemas.
* Remove untyped arrays like `any[]` or loosely typed `Array<any>`.
* Remove untyped function params, callback params, API payloads, and event payloads.

2. Contract / DTO duplication

* Find inline DTOs, local request/response types, duplicated enums, duplicated status unions, duplicated API payload shapes, and duplicated frontend/backend types.
* Move shared wire-format types into `packages/contracts`.
* Reuse existing contract schemas/types when available.
* Add missing shared DTOs only when there is no suitable existing contract.
* Export DTOs cleanly from the relevant contract index.
* Update frontend hooks, route handlers, modules, and tests to consume shared contracts instead of duplicated local types.

3. Validation boundary cleanup

* Ensure API input validation uses shared contract schemas where applicable.
* Do not trust `request.json()` output directly.
* Parse/validate request bodies, params, and query strings before passing to use cases.
* Avoid manual ad-hoc validation if an existing shared contract schema can be used.
* Keep validation errors consistent with the existing error model.

4. Dirty route handlers

* Review all `apps/app/app/api/specgate/**/route.ts` and related route handlers.
* Remove business logic from handlers.
* Handlers should only:

  * extract tenant/user/project context
  * parse params/query/body
  * validate with contracts
  * call the correct use case
  * map result/errors to HTTP response
* Move business rules into module use cases.

5. Dirty module boundaries

* Review `packages/modules/**`.
* Remove imports from `apps/app`.
* Remove Next.js/framework dependencies from modules.
* Ensure use cases depend on ports, not concrete infrastructure.
* Ensure repositories/adapters handle Prisma access.
* Ensure cross-module communication goes through contracts/events or explicit ports, not direct table writes to another module’s domain.

6. Prisma leakage

* Search for direct Prisma usage outside allowed infrastructure/repository/adapters.
* Refactor direct Prisma calls out of UI, hooks, pages, and route handlers.
* Put Prisma logic behind repository/adapters.
* Do not expose Prisma models directly as API responses.
* Map Prisma records into domain objects or contract DTOs.

7. Unsafe JSON / metadata fields

* Review JSON fields such as metadata, config, settings, tool payloads, AI proposal payloads, asset metadata, and activity payloads.
* Replace loose JSON handling with typed schemas.
* Add narrow DTOs for known payloads.
* For truly dynamic JSON, define a safe JSON value type and validate at boundaries.
* Avoid leaking arbitrary JSON into business logic without parsing.

8. Suppression comments

* Search for:

  * `@ts-ignore`
  * `@ts-expect-error`
  * `eslint-disable`
  * `biome-ignore`
  * disabled no-explicit-any rules
* Remove suppressions where possible.
* Only keep suppressions if there is a documented unavoidable reason.
* Add a short explanation next to any suppression that remains.

9. Frontend API typing cleanup

* Review SpecGate frontend API clients, hooks, stores, and components.
* Replace duplicated local response types with contract DTOs.
* Ensure API client functions have typed inputs and outputs.
* Avoid casting fetch results blindly.
* Use shared schemas/types for parsed server responses.
* Keep UI component props strongly typed.

10. Tests and fixtures

* Update tests affected by refactors.
* Remove `any` from tests and test fixtures too.
* Use contract DTO builders or strongly typed fixture factories.
* Do not weaken test assertions to make refactors pass.

Required scan commands:

* Search for `any`.
* Search for `unknown`.
* Search for `as any`.
* Search for `as unknown as`.
* Search for `@ts-ignore`.
* Search for `@ts-expect-error`.
* Search for `eslint-disable`.
* Search for `Record<string`.
* Search for direct Prisma imports/usages outside infrastructure/adapters.
* Search for duplicated DTOs/enums/status unions across app/modules/contracts.
* Run TypeScript typecheck.
* Run lint if available.
* Run relevant tests.

Output required before editing:

1. List only dirty-code findings.
2. Group findings by severity:

   * Critical: unsafe boundary, broken contract, direct Prisma leakage, business logic in route handler
   * High: `any`, unsafe casts, duplicated DTOs crossing boundaries
   * Medium: local duplicated types, weak JSON typing, test fixture looseness
   * Low: small typing improvements
3. For each finding include:

   * file path
   * dirty-code category
   * why it violates architecture/type-safety rules
   * proposed minimal fix
4. Do not include clean files in the report.

Implementation instructions:

* Fix Critical first, then High, then Medium, then Low.
* Keep changes minimal.
* Prefer reusing existing contracts over creating new ones.
* When adding contracts, put them in the appropriate `packages/contracts` area and export them from the relevant barrel file.
* Ensure all modified code compiles without `any` or unsafe `unknown`.
* Preserve existing API behavior and response shape unless the existing shape is clearly inconsistent with the contract.
* If a response shape must change, document it clearly and update all consumers.

Definition of done:

* No explicit `any` remains in touched SpecGate/Corely code.
* No unsafe `unknown` remains in touched SpecGate/Corely code.
* No unsafe double casts remain in touched files.
* Shared DTOs/contracts are used for API boundaries.
* Route handlers are thin.
* Prisma access is only inside allowed adapters/repositories.
* Modules remain framework-free.
* Typecheck passes.
* Relevant tests pass.
* Final summary lists exactly what dirty code was cleaned and which files changed.
