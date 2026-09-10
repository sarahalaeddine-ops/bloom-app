# Bloom test backend — setup verification

A separate `bloom-test` Supabase project was created with an explicitly confirmed quote of $0/month, in eu-central-1 (Frankfurt). Existing projects were not changed. This is a synthetic-data test backend, not a production launch.

The existing initial schema was applied to the hosted project. All seven tables have row-level security enabled. Supabase security advisors returned no findings at setup time.

Live SQL checks passed for profile creation via the Auth trigger, owner reads/updates, cross-user isolation, forged ownership, cross-user cycle references and anonymous denial. These checks used temporary synthetic users inside a transaction that was rolled back. Follow-up counts confirmed zero Auth users, cycles and journal entries remained.

The public Auth settings endpoint returned HTTP 200: email signup enabled, signup allowed, and email auto-confirmation disabled (email verification required). An anonymous REST request for journal IDs returned HTTP 401 / PostgreSQL code 42501, as expected.

Local `.env.local` now uses the test project's URL and publishable client key and is gitignored. No privileged keys or passwords were committed. Other machines and hosting environments still need their own configuration; this does not deploy the application.

This supersedes the earlier audit's statement that no hosted project or schema exists. Real email delivery, reset-link behaviour, hosted two-user JWT/REST journeys, browser/mobile checks, provider-side password/redirect settings and clinical/privacy review remain outstanding. No email was sent, no paid service enabled and no app deployed.
