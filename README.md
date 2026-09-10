# Bloom — IVF treatment companion

Bloom keeps the existing cream, lavender and pastel design. The release-readiness branch replaces prototype account storage and fabricated treatment information with Supabase Auth and owner-scoped records.

**Not ready for patient launch yet.** See [the audit and launch checklist](docs/RELEASE_READINESS.md). No live database, mail service, generative AI, payment system or deployment is provisioned by this repository.

## Run locally

Use Node 22 or newer, with a version supported by the locked Next.js dependencies.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Without configuration, Bloom opens a clear setup-pending account screen and does not accept or save patient information. There is no insecure demo-account fallback.

## Connect an isolated Supabase test project

1. Choose a test project with synthetic data only. Confirm hosting region, privacy requirements and costs separately before production use.
2. Apply `supabase/migrations/202609080001_bloom.sql` to the **test** project's SQL editor or your existing migration pipeline. Do not apply to production without review. This creates profiles, cycles, doses, appointments, results, check-ins and journals; an Auth trigger creates profiles.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Use the project's publishable key, **never** a secret/service-role key. The public key is intended for the browser; PostgreSQL row-level security enforces ownership.
4. Configure Auth's local site URL and allowed redirect URLs, including `http://localhost:3000` and `http://localhost:3000/?recovery=1`. Add only your approved staging URL when ready. Require email confirmation, set a password minimum of 12 characters, and review rate limits/email delivery settings.
5. Restart the dev server. Create two synthetic test accounts, confirm their emails and complete the checklist in `docs/RELEASE_READINESS.md`.

Do not paste secrets into chat, commit `.env.local`, or configure a service-role key in a browser environment variable. No database credentials are needed by the automated tests.

## Verify

```sh
npm test
npm run lint
npm run build
npm start
```

Tests cover React UI journeys with mock transport, the actual auth/data adapters with a mock provider, treatment-data validation, calendar/report generation, and the actual SQL migration/RLS policies in isolated PGlite PostgreSQL. They do not prove live Supabase email delivery, hosted gateway configuration, mobile calendar notifications or browser rendering.

## Data and limitations

- Passwords go to Supabase Auth. Bloom never persists passwords. The old `bloom_user` plaintext prototype record is discarded, not migrated.
- All clinical entries are user-entered copies of clinic instructions. There is no clinic integration or automatic medical interpretation.
- Each dose is one dated occurrence. Calendar exports are optional, generic reminders; users must import them and check their calendar alert settings. Editing/deleting a Bloom dose does not update an imported event.
- Records save only after a successful database response; failures stay visible. Treatment records reload from the database rather than local storage.
- Reports download as JSON; sensitive check-in/journal entries are excluded unless explicitly selected. Reports are not sent automatically.
- Partner access, staff/admin workflows, chat AI, paid services and appointments booking are not implemented. They are labelled unavailable.
- The old PowerShell prototype generators are retired because they would overwrite the maintained app with insecure demo code.
