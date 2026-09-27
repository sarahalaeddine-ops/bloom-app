# Bloom architecture record

Owned by **sa6** (full-stack / AI). This is the living record of how Bloom is built, what data goes where, the known risks and the technical roadmap. Update it with every feature.

Last updated: 2026-09-27

---

## 1. Summary

Bloom is a mobile-first Next.js 16 (App Router, React 19) web app, installable as a PWA. It is a working demo: all state lives on the device by default, and an optional cloud mode syncs to Supabase. The server code is three route handlers (Nora chat, account erasure and the waitlist) and a password gate (`proxy.js`). Routes that act for a signed-in user verify her Supabase access token server-side and reach the database with her own token (RLS) through plain fetch (`lib/supabase-server.js`); the service-role key is used for one call only (account deletion).

Design principles:

1. **Works with zero env vars.** Local mode, scripted Nora and the demo persona must always work.
2. **Device first, cloud optional.** Anything sensitive that doesn't need to leave the device doesn't.
3. **LLM calls are server-side only** and always have a scripted fallback.
4. **Minimal dependencies.** Runtime packages: `next`, `react`, `react-dom`, `@supabase/supabase-js`, `lucide-react`. Third-party APIs are called with plain `fetch`.

---

## 2. System diagram

```
                     Browser (PWA, 430px column)
 ┌──────────────────────────────────────────────────────────────────────┐
 │  app/page.jsx (public landing + waitlist form)                       │
 │  app/demo-7q4x/page.jsx  splash → auth → onboarding → AppShell       │
 │    lib/store.js   localStorage "bloom_*"  ── LOCAL_ONLY keys stay here│
 │    lib/crypto.js  PBKDF2 hashes, AES-256-GCM Secret Space            │
 │    lib/reminders.js + public/sw.js  local notifications, .ics export │
 └──────┬───────────────────────────┬────────────────────────┬──────────┘
        │ POST /api/nora            │ GET/POST /api/waitlist │ supabase-js (anon key + user JWT)
        ▼                           ▼                        │
 ┌─────────────────────────────┐    │                        │
 │ proxy.js (Node runtime)     │    │ (not gated: public)    │
 │ matcher: /demo-7q4x*, /api/nora  │                        │
 │ Basic auth once → httpOnly  │    │                        │
 │ cookie (DEMO_PASSWORD)      │    │                        │
 └──────┬──────────────────────┘    │                        │
        ▼                           ▼                        ▼
 ┌─────────────────────────────┐ ┌──────────────────────┐ ┌───────────────────────────┐
 │ app/api/nora/route.js       │ │ app/api/waitlist/    │ │ Supabase (Postgres + Auth)│
 │ validate → rate limit →     │ │ route.js             │ │ auth.users                │
 │ Anthropic Messages API      │ │ validate → rate limit│ │ public.user_state (RLS:   │
 │ (fetch) or lib/nora.js      │ │ → Vercel Blob REST   │ │   own row only, jsonb)    │
 │ scripted fallback           │ │ (private blobs)      │ └───────────────────────────┘
 └──────┬──────────────────────┘ └──────────┬───────────┘
        ▼                                   ▼
   api.anthropic.com                  Vercel Blob store "bloom-waitlist"

 Hosting: Vercel (Node runtime functions, env vars, Blob). Supabase hosted separately.
```

---

## 3. Components

### 3.1 Front end
- **Routes:** `/` is the public marketing page with the waitlist form (`components/site/WaitlistForm.jsx`). `/landing` redirects to `/` (`next.config.ts`). `/demo-7q4x` is the app demo, gated by `proxy.js` and marked `noindex`.
- **App state machine** (`app/demo-7q4x/page.jsx`): splash → `AuthScreen` → `LockScreen` (if a PIN is set) → `OnboardingScreen` → `AppShell` (5 tabs + More sections opened by state, no routing).
- **i18n:** `lib/i18n.js` (en / ar RTL / fr).
- **PWA:** `public/manifest.json`, `public/sw.js` (no offline caching on purpose; handles `push` and `notificationclick`, ready for a push server).

### 3.2 Gate: `proxy.js`
- Next 16 renamed `middleware` to `proxy` (Node runtime by default; `runtime` config not allowed).
- Matcher: `/demo-7q4x`, `/demo-7q4x/:path*`, `/api/nora`.
- Pages: HTTP Basic auth prompt once, then an `httpOnly; Secure; SameSite=Lax` cookie `bloom_demo` (30 days) holding `SHA-256("bloom-demo:" + DEMO_PASSWORD)`.
- API: cookie only, otherwise `401` JSON. With no `DEMO_PASSWORD` both stay locked (fail closed).
- This is a **demo gate, not user auth.** Real user auth for server routes is the Supabase Bearer token checked in each route (R1, section 4.1).

### 3.3 API routes (Node runtime)
| Route | Purpose | Auth | Limits | Fallback |
|---|---|---|---|---|
| `POST /api/nora` | Nora chat. Server-side Anthropic call. | Demo cookie (proxy). Cloud mode: `Authorization: Bearer <Supabase access token>` verified server-side; per-account limits | Body ≤ 64 KB, ≤ 20 turns, ≤ 4,000 chars/turn, profile fields sanitised, `max_tokens` 500, 20 s timeout, per-IP rate limit | `lib/nora.js` scripted replies (no key, API error, timeout) |
| `GET /api/waitlist` | Waitlist count (cached 60 s at the edge) | Public | Paged, max 50 pages | `503/502` generic error |
| `POST /api/account/delete` | Full erasure of a cloud account (G4) | Bearer token verified server-side; body `{ "confirm": true }`; not behind the demo gate | Body ≤ 1 KB, per-IP 5 / 10 min | `404` when cloud mode is off, `503` without the service-role key, `502` if the admin delete fails (nothing deleted on the device) |
| `POST /api/waitlist` | Save an email as a private blob `waitlist/<email>.json` | Public | Body ≤ 2 KB, strict email check (`lib/validate.js`, no path characters), per-IP rate limit 5 / 10 min | `503/502` generic error |

### 3.4 Data layer: `lib/store.js`
- **Local mode (default):** everything in `localStorage` under `bloom_*`. Local accounts store salted PBKDF2-SHA256 hashes (210k iterations) in `bloom_users`.
- **Cloud mode** (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`): Supabase Auth (email + password). **Only with her consent to cloud sync** (G11, section 3.6), every write schedules a debounced (1.5 s) upsert of a snapshot of all non-`LOCAL_ONLY` keys into `public.user_state.data` (one jsonb row per user). Without it, the row holds only her consent record. Sign-in pulls the row back (including the consent record).
- **`LOCAL_ONLY`** (never synced): `users`, `lock_pin`, `secret` (legacy plaintext), `lang`, `reminders_fired`.
- **Secret Space:** `secret_vault` holds AES-256-GCM ciphertext with a PBKDF2-derived, non-extractable key from the user's passphrase. It syncs as ciphertext only.
- **Sign-out (cloud):** pushes, signs out and wipes the user's `bloom_*` keys from the device.
- **Delete everything** (`store.eraseAccount()`): cloud mode calls `/api/account/delete` (account + synced data erased on the server), then clears the local session and all `bloom_*` keys except `lang`; on failure nothing local is deleted. Local mode wipes the device (`resetDemo`).

### 3.5 Schema: `supabase/schema.sql`
- `public.user_state(user_id uuid pk → auth.users on delete cascade, data jsonb, updated_at)`.
- `public.consent_events(id, user_id → auth.users on delete cascade, version, cloud, ai, created_at)`: append-only consent log. RLS: select and insert own rows only, no update/delete policies; a trigger sets `created_at = now()` so the client can't back-date a consent.
- RLS enabled; four policies (select/insert/update/delete) `to authenticated` with `(select auth.uid()) = user_id`.
- Size guard: `data` capped at 2 MB (check constraint added `not valid`, so existing rows aren't re-checked).
- Idempotent (safe to re-run).

### 3.6 Consent (G11)

> **DRAFT: the consent wording is not legally reviewed.** The copy (`cons.*` keys in `lib/i18n.js`, en/ar/fr) and the consent model below must be reviewed by a lawyer for GDPR Art. 9(2)(a) and UAE PDPL / health-data rules before real patients use cloud sync or live Nora. Version `2026-09-27-draft1` (`CONSENT_VERSION` in `lib/store.js`); bump it when the text changes and everyone is asked again.

- **Granular, opt-in, never a condition of use.** Two separate choices, both unticked by default: (1) *sync my health data to my Bloom account* (Supabase; shown only for cloud accounts) and (2) *let Nora answer with AI* (Anthropic). Saying no keeps Bloom fully usable on the device with offline Nora answers.
- **What the screen says:** what stays on the device; what goes to Supabase and why; what goes to Anthropic for Nora (messages, first name except in anonymous mode, phase, stim day, protocol, clinic, E2); that providers may process data outside her country; that she can withdraw at any time in the Privacy Centre, withdrawal stops future processing and doesn't affect earlier processing.
- **Where it is asked:** onboarding step 2 (before any cycle details are collected, after sign-up), and a one-time `ConsentScreen` for onboarded users who haven't answered the current version (existing accounts). The demo persona (fictional data) is never asked and always uses the AI path.
- **Record:** `bloom_consent = { version, cloud, ai, at, history[≤20] }` on the device (synced as a record even without cloud consent, so the server can see her AI choice) and, for cloud accounts, one `consent_events` row per change with a database timestamp.
- **Enforcement:**
  - Sync: `schedulePush`/`pushNow` run only when `consent.cloud === true`.
  - Withdrawing cloud sync: the cloud row is replaced by `{ consent }` alone (health data removed from Supabase, kept on the device) and syncing stops. Her account (email) remains; full erasure is "Delete everything".
  - Nora AI: the route calls Anthropic only if consent allows. Cloud: `user_state.data.consent.ai === true` read server-side with her token (and the client didn't send `ai: false`). Local/demo: the client sends `ai: true`. Otherwise the scripted reply with `aiOff: true`, and the Nora screen explains how to turn AI on. Emergencies are answered either way.
- **Privacy Centre → Your consent:** both toggles (grant/withdraw), the consent version and the time of the last change.

---

## 4. Data flows

### 4.1 Nora chat
1. `NoraScreen` calls `askNora()` (`lib/api.js`), which sends `{ user: noraProfile(user), messages, lang }` to `/api/nora`, plus `Authorization: Bearer <access token>` when she is signed in to a cloud account (`auth.accessToken()`; supabase-js refreshes it if expired). `noraProfile` holds only first name (none in anonymous mode), phase, stim day, protocol, clinic, E2 (legacy demo defaults dropped) and `demo: true` for the demo persona only.
2. `proxy.js` checks the demo cookie.
3. Route: body size check → JSON parse → filter/trim/cap messages → emergency detection → per-IP rate limit → **caller resolution** (G1, `lib/supabase-server.js`, plain fetch):
   - No Bearer header, or cloud mode not configured on the server → local/demo mode: the client profile is used after sanitising.
   - Bearer header → `GET {SUPABASE_URL}/auth/v1/user` with the anon key and her token. 4xx → `401 {"error":"Not signed in"}` (emergencies still get the referral, `200`). 5xx/timeout → offline reply with no profile and no AI call.
   - Verified → per-account rate limit (10/min, 200/day, per instance) → `GET /rest/v1/user_state?user_id=eq.<verified id>&select=data` **with her token**, so RLS applies. Her synced `data.user` is the context (client fields ignored); without a synced profile (cloud sync off) the client's fields are used, sanitised. The demo persona can never be switched on for an account.
   - Sanitise (`sanitizeUser`: unknown fields stay unknown, G15).
4. No key → scripted `demoReply` (emergency reply first when detected). With key → Anthropic Messages API with `system` from `buildSystemPrompt` (versioned, `NORA_PROMPT_VERSION`), top-level `cache_control` (automatic prompt caching), `max_tokens` 500, 20 s timeout.
5. Logs one JSON line per call: model, prompt version, caller mode (`local`/`user`), token counts (incl. cache read/write), stop reason, latency. **No content, no IP, no user id, no user fields.**
6. The chat history is stored on the device in `bloom_nora` and, in cloud mode, synced to `user_state` like other app data.

### 4.2 Waitlist
Landing form → `POST /api/waitlist` → email check + rate limit → Vercel Blob REST `PUT` (private, overwrite) → `{ ok }`. The count is read with `GET` and cached for 60 s.

### 4.3 Accounts and sync
Local: `auth.signUp/signIn` hash and compare on the device. Cloud: Supabase Auth issues a session (stored by supabase-js in `localStorage`), and the client reads/writes its own `user_state` row directly under RLS. There is no Bloom server between the client and Supabase.

### 4.4 Reminders
Client-side scheduler + service worker notifications while Bloom is open or backgrounded; `.ics` export with alarms for when the app is closed. No server push yet (R5).

### 4.6 Consent
Onboarding / `ConsentScreen` / Privacy Centre toggle → `consent.set({ cloud, ai })` → `bloom_consent` on the device → cloud accounts: insert into `consent_events` (her token, RLS) and upsert `user_state` (full snapshot if cloud consent, else `{ consent }` only). `/api/nora` reads `data.consent.ai` from her row when she is signed in.

### 4.5 Export and delete
Privacy Centre → **Download my data** builds a JSON file on the device (no password hashes). **Delete everything** calls `store.eraseAccount()`: cloud → `POST /api/account/delete` with her token → server verifies, deletes `auth.users` (service key; cascades to `user_state` and `consent_events`), then any leftover row with her token → client clears the session and device. Local → device wipe.

---

## 5. Environment variables

All optional. Without any of them Bloom runs as an offline demo (but the gated demo page and Nora API stay locked until `DEMO_PASSWORD` is set).

| Var | Where used | Secret? | Notes |
|---|---|---|---|
| `DEMO_PASSWORD` | `proxy.js` | Yes | Unlocks `/demo-7q4x` and `/api/nora`. Unset = locked. |
| `ANTHROPIC_API_KEY` | `app/api/nora/route.js` | Yes | Enables live Nora. Unset = scripted replies. |
| `NORA_MODEL` | `app/api/nora/route.js` | No | Default `claude-sonnet-4-6`. |
| `BLOB_READ_WRITE_TOKEN` | `app/api/waitlist/route.js` | Yes | Set automatically when a Vercel Blob store is connected. |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase.js` | No (public) | Enables cloud mode with the key below. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | `lib/supabase.js`, `lib/supabase-server.js` | No (public, RLS protects data) | Never put the service-role key in a `NEXT_PUBLIC_` var. |
| `SUPABASE_SERVICE_ROLE_KEY` | `app/api/account/delete/route.js` only | **Yes, server-only** | Bypasses RLS: used for one call, the Admin API user delete, after the user's own token is verified. Legacy JWT keys are sent as `apikey` + Bearer, new `sb_secret_…` keys as `apikey` only. |

---

## 6. Data inventory and processors

| Data | Where it lives | Leaves the device? | Processor |
|---|---|---|---|
| Account email, password | Local: hash in `bloom_users`. Cloud: Supabase Auth | Cloud mode only | Supabase |
| Profile (name, clinic, protocol, stim day, E2, follicles) | `bloom_user` | Cloud sync; Nora gets first name (not in anonymous mode), stim day, protocol, clinic, E2 | Supabase; Anthropic (per message) |
| Check-ins (mood, anxiety, symptoms, weight, journal text) | `bloom_checkins` | Cloud sync only | Supabase |
| Medication logs, appointments/bookings, partner invite, reminders settings, reads/likes | `bloom_*` | Cloud sync only | Supabase |
| Nora chat history | `bloom_nora` | Cloud sync (with consent); last 20 turns sent to Anthropic per message (with AI consent) | Supabase; Anthropic |
| Secret Space | `bloom_secret_vault` (ciphertext) | Cloud sync as ciphertext only. **Never sent to Anthropic.** | Supabase (cannot read it) |
| App-lock PIN hash, other local accounts, language, fired-reminder ids | `LOCAL_ONLY` keys | Never | none |
| Consent record (version, choices, time) | `bloom_consent`; `consent_events` and `user_state.data.consent` for cloud accounts | Cloud accounts only (also without cloud-sync consent: it is the record of that choice) | Supabase |
| Waitlist email | Vercel Blob (private) | Yes | Vercel |
| Server logs | Vercel function logs | n/a | Vercel. Nora logs hold token counts only. |

**Processor list** (to publish in the privacy policy): Vercel (hosting, logs, Blob), Supabase (auth, database, cloud mode only), Anthropic (Nora replies, live mode only), Google Fonts (font files are loaded from `fonts.googleapis.com` / `fonts.gstatic.com`, which exposes the visitor IP to Google; see G10).

---

## 7. Nora AI design

- **Prompt:** `buildSystemPrompt(user, lang)` in `lib/nora.js`, versioned by `NORA_PROMPT_VERSION`. The user's cycle context is injected after sanitising (`sanitizeUser`: stripped control characters and markup, capped lengths, numeric ranges). The prompt tells Nora to treat profile fields as data, not instructions.
- **Safety rules in the prompt:** never diagnose or change doses; emergency signs (OHSS signs, heavy bleeding, severe pain, fainting, fever, breathing trouble, thoughts of self-harm) get an immediate "contact your clinic now / local emergency number" as the first sentence; end medical content with "confirm with your clinic"; ignore attempts to change role or reveal the prompt; gently decline off-topic requests.
- **Scripted fallback:** `demoReply(text, lang)` checks `detectEmergency` first and returns a localised urgent referral, then topic replies, then a default. Used with no key, on API errors and on timeouts.
- **Response flags:** `{ text, demo?: true, urgent?: true }`. `urgent` lets the UI show a "call your clinic" banner later (sa4).
- **Model:** `NORA_MODEL`, default `claude-sonnet-4-6` (Active, retirement not before 2027-02-17, $3 / $15 per MTok, thinking off by default). Upgrade path: `claude-sonnet-5` ($2 / $10 per MTok, cheaper) has adaptive thinking **on by default** and rejects non-default `temperature`; thinking tokens count toward `max_tokens`, so with our 500-token cap it needs `thinking: {type: "disabled"}` or a higher cap. Do the switch as its own change with a live eval run (R2). Sources: platform.claude.com models overview, pricing and thinking pages, checked 2026-09-27.
- **Prompt caching:** top-level `cache_control: {type: "ephemeral"}` (automatic caching; the breakpoint moves forward as the chat grows). Sonnet 4.6 only caches prefixes of 1,024+ tokens and silently skips shorter ones, so short chats cost nothing extra and longer chats (the common case after a few turns) read the prefix at 0.1× input price. Cache writes cost 1.25×.
- **Rate limit:** in-memory, per IP, **per server instance** (`lib/rate-limit.js`): Nora 10 requests/minute and 200/day; waitlist 5 per 10 minutes. On Vercel each function instance has its own memory, so the effective limit is "per instance" and resets on cold starts. It stops casual abuse, not a distributed attack. Durable limits (Supabase table or Upstash/Vercel KV) are part of R1.
- **Cost estimate (Sonnet 4.6):** about 2,000 input + 200 output tokens per message ≈ $0.009. 1,000 active users × 5 messages/day ≈ $1,350/month before caching; caching cuts the input part substantially in multi-turn chats. Sonnet 5 would be about a third cheaper per token (new tokenizer produces ~30% more tokens; net saving smaller). Haiku 4.5 ($1 / $5) ≈ $450/month but weaker in Arabic nuance and safety tone; eval before considering.
- **Evals:** `docs/sa6/nora-evals.md`. Run before and after any prompt or model change.

---

## 8. Quality and delivery

- `npm run lint`, `npm test` (`node --test`, no packages; a tiny resolve hook in `tests/setup/` adds `.js` to extensionless imports), `npm run build`.
- CI: `.github/workflows/ci.yml` on pull requests and pushes to `master`: Node LTS, `npm ci`, lint, test, build, no secrets. 106 tests today (lib/ logic, crypto, local auth, consent, i18n parity, Nora prompt/fallback/route with mocked Anthropic and Supabase calls, server-side Supabase helpers, account-erasure route, cloud-mode client sync/consent/erasure against a mocked Supabase, rate limiter, waitlist route, proxy gate).
- Deploy: Vercel preview per PR, production from `master`.
- Database changes: idempotent SQL in `supabase/`.

---

## 9. Known gaps and risks

Severity: **High** = fix before real users / real health data. **Med** = fix before public launch. **Low** = hygiene.

### Security
| # | Gap | Sev | Status / plan |
|---|---|---|---|
| G1 | `/api/nora` had no user auth and trusted client-supplied profile context. | High (for launch) | **Closed 2026-09-27** for cloud mode: Supabase access token verified server-side (`/auth/v1/user`), context read from her own `user_state` row with her token (RLS), per-account limits. Local/demo mode unchanged behind the demo gate. Remaining: the demo gate still fronts `/api/nora` (the app build needs it removed, see `app-store.md`), and limits are per instance (G2). |
| G2 | Rate limiting is in-memory per instance. | Med | Shipped as a first line of defence. Durable store in R1. |
| G3 | No Content-Security-Policy. | Med | Basic security headers shipped (`nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS). A nonce-based CSP needs dynamic rendering and testing with Supabase and Google Fonts; do it with G10. |
| G4 | "Delete everything" didn't delete the Supabase `auth.users` row (email stayed). | High (GDPR erasure) | **Closed 2026-09-27.** `POST /api/account/delete` verifies her token, hard-deletes her `auth.users` row via the Admin API with `SUPABASE_SERVICE_ROLE_KEY` (server-only), whose `on delete cascade` removes `user_state` and `consent_events` in the same transaction, then deletes any leftover `user_state` row with her own token (RLS) as a safety net. The client wipes the device only after the server confirms. Needs a real Supabase project to verify end to end. Open: whether to keep a minimal proof-of-consent/deletion record (lawyer), Supabase backups retain data until they roll off (disclose in the privacy policy). |
| G5 | Supabase session tokens live in `localStorage` (supabase-js default), so an XSS could steal them. | Med | Keep XSS surface small (no `dangerouslySetInnerHTML` with user data today), add CSP (G3). Cookie-based SSR auth is possible later. |
| G6 | Demo gate cookie is a deterministic hash of the password; comparison is not constant-time. | Low | Acceptable for a demo gate. Rotating `DEMO_PASSWORD` invalidates all cookies. Replace with real auth at launch. |
| G7 | Local-mode accounts are only as safe as the device (hashes are in `localStorage`). | Low | By design for the demo; cloud mode is the production path. |
| G8 | `user_state` is one jsonb blob per user, last write wins across devices. | Med | Fine for the demo. Move to per-entity tables with `updated_at` merge when multi-device use matters (R1/R3). |
| G13 | Supabase auth error messages are shown as-is (e.g. "User already registered"), which allows email enumeration. | Low | Map to generic messages when cloud mode goes live (with sa4, needs i18n strings). |
| G14 | Rate limiting keys on `x-forwarded-for`. Behind Vercel the platform sets it; behind another proxy it could be spoofed. | Low | Re-check if hosting changes. |
| G15 | The Nora cycle context fell back to demo values (Stim Day 7, E2 1,840, fixed follicle sizes) when a real user hadn't entered them. | Med (launch) | **Closed 2026-09-27.** Persona values only when the request is for the demo persona (`demo: true`, sent only for `id === "demo"`). Real users: unknown fields are "not recorded" in the prompt and a new rule forbids guessing them; scripted fallback replies have persona-free versions (en/ar/fr); `newProfile` no longer writes E2/follicle defaults and `noraProfile` drops the legacy ones; persona-free Nora welcome. Prompt `2026-09-27.2`. |

### Security pass 2026-09-27: fixed
- Nora: profile fields were injected into the system prompt unvalidated (prompt injection, unbounded size). Now sanitised and placed in a delimited data block; body capped at 64 KB; a trailing assistant turn (prefill) is rejected; API error logging no longer echoes provider error messages.
- Nora: anonymous mode still sent her full name to Anthropic. Now only the first name is sent, and none in anonymous mode.
- Scripted Nora answered "severe pain since retrieval" with reassurance and ignored heavy bleeding, OHSS signs and self-harm. Now an immediate referral (see `nora-evals.md`).
- No rate limits on Nora or the waitlist. Added (per instance).
- Waitlist: the loose email regex allowed `/` and `..` in an email that becomes a blob path, and the body size was unbounded. Tightened and capped.
- `proxy.js`: token comparison is now constant-time. The stale "not password-protected" comment in `app/demo-7q4x/layout.jsx` is corrected.
- Security headers added in `next.config.ts` (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, HSTS) and `x-powered-by` removed.
- `user_state` 2 MB size guard; "Delete everything" copy no longer claims to delete a cloud account it doesn't delete; Privacy Centre now names Anthropic and what Nora receives.
- `DEMO_PASSWORD` and `BLOB_READ_WRITE_TOKEN` were undocumented. Now in `README.md` and `.env.example`.

Reviewed and fine: RLS policies (all four operations, `to authenticated`, `(select auth.uid()) = user_id`, cascade delete), no service-role key anywhere in the client, `LOCAL_ONLY` keys excluded from sync and from the export, export excludes password and PIN hashes, Secret Space only syncs ciphertext, no `dangerouslySetInnerHTML` or `eval` in the app, the service worker caches nothing.

### Privacy
| # | Gap | Sev | Status / plan |
|---|---|---|---|
| G9 | Nora sends the last 20 turns plus profile context to Anthropic (US). | Med | Minimised (first name only, none in anonymous mode; sanitised fields; no Secret Space; no check-in journal). Privacy Centre now says what goes to Anthropic. Consent wording before launch is a founder/lawyer decision. |
| G10 | Google Fonts loaded from Google's CDN exposes visitor IPs to Google (an issue under GDPR in some EU rulings). | Med | Self-host fonts with `next/font` (no new package) in a design-safe pass with sa5. |
| G11 | No explicit consent capture (health data is special-category data under GDPR Art. 9 and sensitive data under UAE PDPL). | High (launch) | **Closed (technically) 2026-09-27; wording is DRAFT.** Granular opt-in consent in onboarding and a gate for existing users, versioned + timestamped records (`bloom_consent`, `consent_events`), grant/withdraw in the Privacy Centre, withdrawal stops cloud sync (and removes synced health data from the cloud) and Nora's AI path. See 3.6. **Needs legal review of the text and model before launch.** |
| G12 | Chat history and journals sync in plaintext jsonb (encrypted at rest by Supabase, readable by the operator). | Med | Option: extend device-side encryption to journals/Nora history (breaks server-side tools and RAG over user data). Founder trade-off. |

### Compliance (flag for a lawyer; not decided here)
- **UAE:** Federal Law No. 2 of 2019 (ICT in health fields) generally requires health data to be stored and processed **inside the UAE** unless an exception applies; DoH Abu Dhabi and DHA Dubai have their own health-data standards; PDPL (Federal Decree-Law 45/2021) covers personal data. Supabase and Anthropic process outside the UAE today. **Data residency is a blocking founder/legal decision before any UAE patient data is stored in the cloud.** Options: keep UAE users in local mode, a UAE-region database (e.g. a UAE cloud region), or a legal exception/consent route.
- **GDPR (EU/UK users):** Art. 9 explicit consent, DPIA before launch, DPAs with Vercel/Supabase/Anthropic, records of processing, export (have JSON export) and erasure (G4), EU region for Supabase.
- **HIPAA-style (US clinics):** only relevant if Bloom acts for a covered entity (clinic partnerships, results import). Would need BAAs with every processor (Anthropic, Supabase, Vercel offer BAAs on specific plans; verify), audit logs, access controls.
- **Medical device risk:** Nora explains and supports but must not diagnose or recommend doses. If features start interpreting results for treatment decisions (e.g. results import + advice), software-as-medical-device rules may apply. Founder + regulatory advice.

---

## 10. Technical roadmap (ranked)

Effort: S ≤ 2 days, M ≤ 1–2 weeks, L > 2 weeks. Costs are running costs on top of today's.

| Rank | Item | What | Effort | Cost | Founder decisions |
|---|---|---|---|---|---|
| R1 | **Real auth on server routes + erasure** (mostly shipped 2026-09-27: G1, G4, G11, G15 closed; durable limits G2 still open) | Verify the Supabase JWT in `/api/nora` (and future routes), read cycle context from the user's own row instead of trusting the client, durable per-user rate limits/quotas, full account deletion (G4), consent step (G11). | M | ~$0 (Supabase free/pro tier) | Consent wording (lawyer); whether Nora needs an account (demo stays open?); free-tier message quota. |
| R2 | **Nora model upgrade + live evals** | Run `docs/sa6/nora-evals.md` against a live key, then try `claude-sonnet-5` with thinking disabled and compare. | S | Eval run < $1; production cost ~−30% vs Sonnet 4.6 | Approve an API key and a monthly budget cap in the Anthropic Console. |
| R3 | **Nora tool use (read-only)** | Tools: `get_today_meds`, `get_next_appointment`, `get_checkin_trends(days)`. Server runs them for the signed-in user (cloud: reads `user_state` with the user's JWT under RLS; local mode: client sends a minimal, explicit snapshot). Bounded loop (max 3 tool rounds). | M | +~500 tokens/request for tool definitions (cacheable) | Which data Nora may read (journals? weight?), and how that is shown in the Privacy Centre. |
| R4 | **Grounded answers (RAG)** | Phase 0: vetted content (protocol guides, med instructions, FAQs) small enough to put in the cached system prompt, with citations; no new vendor. Phase 1 (content > ~50k tokens): pgvector in Supabase, ingestion script in `scripts/`, chunk sources + citations shown in the UI. **Needs an embeddings provider: Anthropic has no embeddings API.** Options: Voyage AI, OpenAI, Cohere, Google; or Supabase's built-in `gte-small` model in Edge Functions (no new vendor, weaker in Arabic; verify). | M (phase 0) / L (phase 1) | Phase 0: cache writes/reads only. Phase 1: embeddings are cents per thousand docs; pgvector is included in Supabase. | **Embeddings provider (new vendor + DPA)**; who on the Medical Review Board signs off content; languages covered. |
| R5 | **Server push reminders** | Web Push (VAPID, no vendor) so doses fire with the app closed; subscriptions in a new RLS table; scheduler via Supabase `pg_cron` + Edge Function or Vercel Cron. Payload encryption (RFC 8291) by hand with Web Crypto, or the `web-push` package (needs approval). iOS needs the PWA installed (16.4+). Lock-screen text must not reveal treatment ("Time for your evening reminder", not drug names). | M | Cron + function invocations, ~$0–20/month at demo scale | Approve `web-push` or hand-rolled crypto; lock-screen wording; opt-in UX. |
| R6 | **Clinic results import** | Phase 1: user uploads a PDF/photo of scan or blood results → Claude vision extracts follicles/E2 into a draft she confirms (never auto-applied). Phase 2: clinic integrations (HL7/FHIR, clinic portals). | M (P1) / L (P2) | ~$0.01–0.03 per document | Clinic partnerships and data-sharing agreements; storage of source documents (or discard after extraction); medical-device implications of interpreting results. |
| R7 | **Native wrapper** | Capacitor around the existing web app (reuses all code; adds native push, HealthKit, app-store presence) rather than an Expo rewrite. Full plan, review requirements, packages, costs and checklist: [`app-store.md`](app-store.md). | L | Apple $99/yr, Google $25 once, CI build minutes | Only when app-store distribution, reliable iOS push or HealthKit is required. |
| R8 | **Observability and cost dashboard** | Aggregate the Nora usage log lines (tokens, latency, fallback rate) in Vercel logs/drains; alert on fallback spikes and spend. | S | ~$0 with Vercel log drains on existing plan (verify) | Budget alert thresholds. |

## 11. Open questions for the founder
1. Data residency for UAE users (blocking for cloud mode with real patients).
2. Embeddings provider for RAG (new vendor), or start with phase 0 (no vendor).
3. Consent and Privacy Centre wording for AI processing (lawyer review).
4. Anthropic API budget cap and whether to move Nora to `claude-sonnet-5` after evals.
5. Should Nora require a signed-in account at launch (enables per-user quotas and tools)?
6. Consent (G11): lawyer review of the draft wording and model (granular opt-in; withdrawal removes synced health data from the cloud but keeps the account; whether to keep consent/deletion proof after erasure, which the cascade currently deletes).
7. Sign-out with cloud sync off wipes the device, so unsynced data is lost. Warn first, or keep data on sign-out when sync is off (shared-device privacy vs data loss)?
8. App store: whether the app build keeps the demo gate in front of `/api/nora` (it can't, see `app-store.md`) and whether signed-in users get Nora without the demo password on the web too.

## 12. Change log
- 2026-09-27 (R1): Server-side Supabase token checks for `/api/nora` (G1), full account erasure route (G4), health-data consent with versioned records and enforcement (G11, draft wording), no demo persona values for real users (G15, prompt `2026-09-27.2`), Privacy Centre in en/ar/fr, `consent_events` table, `SUPABASE_SERVICE_ROLE_KEY`. App Store plan in `docs/sa6/app-store.md`.
- 2026-09-27: Record created (sa6). Added tests, CI, Nora hardening (rate limit, caching, usage logs, emergency handling, input sanitising), evals, security headers, waitlist hardening, `user_state` size guard.
