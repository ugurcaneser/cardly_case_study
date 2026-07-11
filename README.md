# Cardly

A trading-card scanner: point your phone's camera at a physical card, and the app OCRs the name/collector number, matches it against Scryfall, and saves it (with the matched artwork, price, and metadata) into your personal history and collections — no login required.

The project is split across two repositories:

- **`cardly_case_study`** (this repo) — the Expo/React Native mobile app.
- **`cardly_case_study_backend`** — a FastAPI + PostgreSQL API, deployed separately (Render + Aiven).

## 1. Architecture decisions

The app is a thin client over a small stateless-where-possible API:

```
Mobile (Expo Router)  ──HTTP──►  FastAPI backend  ──►  Postgres (Aiven)
                                       │
                                       ├─► OCR.space   (text extraction)
                                       └─► Scryfall API (card matching)
```

- **Two independent repos/deploys**, not a monorepo — the mobile app and backend have separate release cadences, dependency ecosystems (npm vs pip), and CI concerns, and the case study explicitly called for a Python/Postgres backend distinct from the RN app.
- **The capture flow is deliberately staged**, not one atomic "scan" action: `idle → captured (local preview) → submitting (analyze) → reviewing (matched/unrecognized) → saving`. Each stage is a real, inspectable state rather than a black box, which is also what makes the loading/empty/error states straightforward to test.
- **`/enrich` is stateless.** It takes an image, returns OCR + Scryfall match data, and never touches Postgres. Persistence only happens afterward, on an explicit "Save," via a separate `/cards` call. This means a failed or abandoned scan never leaves partial data behind, and the enrichment pipeline (OCR → parse → Scryfall lookup) can be reasoned about and tested in complete isolation from storage.
- **Scan is a real tab, not a modal.** Earlier iterations tried a floating action button and a modally-presented capture screen; both made the screen feel disconnected from the rest of the app (no bottom nav, a jarring transition, and on Android a genuine dead-end with no way back). It now lives at `app/(tabs)/scan.tsx` as an ordinary tab, so leaving it is just tapping another tab.
- **No user accounts.** Each device generates and persists a random UUID (`src/services/device/deviceId.ts`) on first launch and sends it as an `X-Device-Id` header on every request; the backend scopes every row (cards, collections, collection membership) to that id. This gives real per-device data isolation without any signup/login UI, at the cost of not supporting multi-device sync or account recovery — an explicit, documented trade-off for the scope of this project.

## 2. State management choice

Two libraries, split strictly by *what kind* of state they own — this was a deliberate decision to avoid the common anti-pattern of caching server data in a general-purpose store:

- **TanStack Query** owns everything that originates from the backend: cards, collections, and all their mutations (`src/services/api/queries.ts`). It gives us request de-duping, cache invalidation on mutation, retry/backoff, and `isPending`/`isError`/`isSuccess` states for free — every screen's loading/empty/error/success branch is driven directly by a query's status, not hand-rolled flags.
- **Zustand** owns transient, client-only state that has no business being cached as "server data": the capture flow's state machine (`useCaptureStore` — current step, in-flight preview URI, enrichment result, cold-start hint) and the analytics event queue (`useAnalyticsStore`). This state is reset explicitly (on a successful save, or when the user discards) rather than persisted, since it only makes sense for the lifetime of one capture session.

Nothing here is prop-drilled — components read only the store slices they need via selectors, which keeps re-renders scoped and each store easy to unit-test independently of any UI.

## 3. Data persistence approach

Three distinct layers, each with a different lifetime and source of truth:

- **Postgres (source of truth).** Cards and collections live here permanently, scoped per device. This is what makes a card "real" — everything else is a cache or a device-local convenience.
- **TanStack Query's cache, persisted to `AsyncStorage`** (`src/services/api/persister.ts`). History and Collections render instantly from last-known data on cold start, and remain viewable (read-only) offline, without a bespoke offline-sync layer.
- **Local device files + a small `AsyncStorage` map** (`src/services/files/imageStorage.ts`, `localImageMap.ts`). The full-resolution captured photo is copied into the app's document directory and its URI is mapped to the card's id — this is what lets the card detail screen prefer a locally captured image if the Scryfall art hasn't loaded, and is intentionally *not* synced anywhere (it's meaningless outside this one device).

There is no offline write queue — saving a card or mutating a collection requires connectivity. That's a deliberate scope boundary for a case study rather than an oversight: a real write-queue (conflict resolution, retry semantics, background sync) is a substantial feature in its own right.

## 4. Backend design choice

**FastAPI + SQLModel + Alembic on Postgres**, chosen because SQLModel collapses the usual "separate Pydantic schema + separate SQLAlchemy model" duplication into one class family, and FastAPI's dependency-injection system made the device-scoping rule (below) trivial to enforce consistently.

Key decisions:

- **Synchronous endpoints**, not async. At this scale (a single Postgres connection pool, no high-concurrency requirement) sync handlers are simpler to write, simpler to test with `TestClient`, and avoid async-fixture ceremony in pytest — noted as a future extension point if load ever demanded it, not a current limitation.
- **Graceful degradation over hard failures in `/enrich`.** OCR or Scryfall being unavailable, or a card simply not matching, all resolve to a `200 unrecognized` response with the raw OCR text attached — never a 5xx. A genuine `error` status is reserved for bad uploads, missing config, and truly unhandled exceptions. The mobile app can always show *something* (a manual "save without analysis" path) rather than getting stuck on a spinner.
- **Per-device scoping via a required `X-Device-Id` header** (`app/api/deps.py`), enforced on every card/collection route, rather than a full auth system. `Collection.name` uniqueness is a composite `(user_id, name)` constraint, so two devices can each have their own "Vintage" collection without colliding.
- **Alembic migrations against the real (Aiven) Postgres instance**, applied by hand at each schema change rather than auto-run on boot — deliberate, since this is a shared database and schema changes (e.g., the migration that added `user_id`) deserve a review step before landing.
- **84 backend tests** (`pytest`, SQLite in-memory fixtures) covering the OCR text parser, the Scryfall client, the enrichment service's three-outcome contract, and full API lifecycles for cards/collections — including dedicated multi-tenancy tests (two devices never see each other's data, can reuse the same collection name, can't link a card into another device's collection).

## 5. How AI was used in the development workflow

This project was built end-to-end with Claude Code, used as a pairing partner rather than a one-shot generator: work went step by step (one screen, one endpoint, one migration at a time), with tests added alongside each change and both test suites kept green throughout. Claude also helped diagnose a few real bugs from reported symptoms (e.g. an Android-only image-loading issue, a FlatList layout bug) rather than just writing code from scratch.

## Getting started

**Backend** (`cardly_case_study_backend`):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# .env: DATABASE_URL=postgresql://..., OCR_SPACE_API_KEY=..., CORS_ORIGINS=["*"]
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pytest
```

**Mobile** (this repo):

```bash
npm install
# .env.local: EXPO_PUBLIC_API_BASE_URL=http://<your-machine-ip>:8000
npx expo start
npm test
```
