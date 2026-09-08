# Bloom release-readiness audit

Scope: repository `sarahalaeddine-ops/bloom-app`, initial master commit `eff6afa1f9e7bde1014c32511a0d12b52da32954`.
Work branch: `fix/bloom-release-readiness`. No deployment, real patient records, emails, invitations or paid services were activated.

## Stack and baseline

Next.js 16.3 App Router, React 19.2, JavaScript/JSX, TypeScript build configuration, Tailwind 3, Lucide, and an installed but unused Supabase client. No API routes, database migration, admin portal or backend configuration existed. The original app's visual navigation and input selection worked in code, but most clinical state was hardcoded or component-local.

Baseline findings below are from source inspection. A complete baseline browser journey was not possible: the supplied cloud browser rejected the local URL with `ERR_BLOCKED_BY_CLIENT`. This is not evidence of a site bot block. The updated app was built and served locally (HTTP 200), and React journeys were exercised in jsdom. Do not describe those as a completed visual browser review.

| Journey                | Original behaviour                                                                                                                               | Changes / current boundary                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Signup/login           | Module-memory account dictionary; passwords persisted in `bloom_user`; re-login failed after reload; editable browser object trusted as identity | Supabase signup, verified-user lookup, session restoration, email-confirmation state, generic login errors; old plaintext record discarded                                           |
| Recovery               | Missing                                                                                                                                          | Reset request, generic acknowledgement, reset-link screen and password update; provider failures surfaced; live emails still untested                                                |
| Onboarding             | Fixed stimulation day and protocol defaults; non-stimulation users asked for stim day; fake mandatory therapist/session booking                  | One explicit clinic-recorded cycle form, phase/date selection, validation, database save; no therapy promise                                                                         |
| Profile                | Local-only edits, stale account dictionary                                                                                                       | Owner-scoped database profile update and real signout                                                                                                                                |
| Cycle/home             | Fixed E2, follicle map, “mature” classification, scan time and estimated retrieval                                                               | Actual selected cycle and saved doses/appointments/results; cycle day from entered start date, explicitly not stim day; no predicted dates                                           |
| Medications            | Fixed named medications/doses; mostly pre-marked taken; all occurrences shared one medication status; logs lost; history/schedule placeholders   | Empty records until entered; each occurrence has exact clinic instruction, UTC schedule, own status, actual taken time, site/note; create/edit/delete and account persistence        |
| Reminders              | No functioning reminder delivery                                                                                                                 | Per-dose ICS download with unique ID and UTC timestamp; generic content avoids medication detail in external calendar; import/alert setup and stale-event limitations clearly stated |
| Appointments           | Fixed relative dates, fake countdown and generic preparation instructions; expansion button did not reveal details                               | Create/edit/delete clinic-arranged appointments with clinic-entered preparation text; actual upcoming sorting; no booking claim                                                      |
| Results/charts         | Charts placeholder; fabricated results on home                                                                                                   | Numeric results with explicit test/unit/date, zero supported; bars group identical tests/units, display values; no clinical ranges or interpretations                                |
| Cycle report           | Coming-soon screen                                                                                                                               | JSON export of selected cycle, doses, appointments and results; private entries opt-in; no automatic sharing                                                                         |
| Mood/symptom check-in  | “Saved” only toggled a screen; fixed follicle count and unreviewed weight alert                                                                  | Database acknowledgement before success, error state retains input, saved history, optional weight; fixed OHSS threshold removed                                                     |
| Secret Space/journal   | Any PIN with four characters unlocked it; notes lost; canned chat replies; absolute privacy claim                                                | Account-owned journal CRUD, no fake PIN/vault or monitored-chat claim; partner sharing unavailable                                                                                   |
| Nora AI                | Direct browser request to Anthropic without a working backend; hardcoded patient data and “promising” prognosis                                  | Generative feature disabled, no external request; clearly labelled question-draft/support surface; no invented dose, trigger timing, result interpretation or success prediction     |
| Insights               | Filters/article buttons worked; “videos” were text; unsourced medical claims and false personalisation                                           | Practical organisational notes only; clinical articles/videos withheld for review; no fake video buttons or popularity/personalisation claims                                        |
| Other visible features | Partner, community, therapy, two-week wait, pregnancy, failed-cycle support mostly coming-soon; fake subscription prices/CTA                     | Explicit unavailable list; no fake payments, promises, booking or invites                                                                                                            |
| Admin                  | No admin implementation or data intake system                                                                                                    | No client admin privilege added. Supabase policies restrict every record to its owner. Future staff access requires separately designed permissions and audit controls               |

## What has been implemented

Supabase Auth integration plus a versioned SQL migration for seven tables. Each clinical row has a user owner; composite foreign keys prevent a user attaching records to another user's cycle. RLS applies to reads, inserts, updates and deletes. Profile edits can update only the name. Anonymous access is revoked. No role supplied through signup metadata grants administrative access. No partner permissions exist.

User-data writes wait for database acknowledgement. Reload/remount loads data from the backend; the app does not use a browser health-record cache. UI transport tests use synthetic in-memory fixtures as mocks, not a runtime fallback. Passwords are never part of profile records.

Multi-cycle selection, empty states, editable clinic instructions, individual doses and history, appointments, results and per-unit charts, check-ins, journaling and report export use a common record provider. Existing cream/lavender/rose/teal colours and rounded card/mobile tab layout are retained. Duplicate conflicting PostCSS configuration was removed and a missing icon supplied.

## Verification evidence and limits

- Production build and lint passed.
- Local production server returned HTTP 200 and Bloom HTML.
- 51 automated tests passed: React workflows with mock transport; actual auth/data adapters using a mock provider; pure data/calendar/report functions; actual migration executed in PGlite PostgreSQL with two synthetic users.
- RLS tests cover all six clinical tables plus profiles, anonymous denial, read isolation, forged ownership, cross-owner updates/deletes, cross-owner cycle references, profile privilege escalation, owner CRUD, duplicate dose protection and status/timestamp constraints.
- React tests cover onboarding, failed-load retry, save-failure honesty, check-in history after remount, two independent doses, appointment/result/journal forms, zero-valued results, cycle isolation, report privacy opt-in, deletion confirmation and auth error/recovery states.
- NOT yet verified: a hosted Supabase instance, real JWT gateway behaviour and Auth triggers there, email confirmation/recovery delivery and expiry, password rules/rate limits in provider settings, full real-browser responsive/accessibility review, iOS/Android calendar imports/alarms, real cross-tab/session-expiry behaviour, backup restoration or deployment security headers.
- PGlite tests use a minimal Auth schema and `auth.uid()` equivalent for policy testing; they are not a substitute for two-user testing against the configured Supabase project.

## Required clinical review

No clinical threshold is enabled. A qualified reproductive-medicine reviewer must review any reintroduced educational or clinical content, including the original OHSS weight-change threshold, follicle “maturity” cutoff, E2 interpretation, trigger/retrieval estimates, diet/caffeine, exercise/yoga, intercourse restrictions, embryo grading, and claims about stress/cortisol. Review the clinic-escalation wording and emergency pathways for each launch jurisdiction. Organisational notes and nonclinical support copy also need editorial signoff.

Nora must remain unavailable until a server-side integration has enforceable scope, consent/data minimisation, security and clinical evaluation. Do not send health data to an AI provider from the browser. Do not add an API key to the client. Evaluations must include dose requests, missed doses, trigger timing, result interpretation, pregnancy/success predictions, emergencies and prompt injection. A disclaimer alone is insufficient.

Medication and appointment data must continue to follow the clinic's instructions. The app has no clinical monitoring service; do not advertise automatic OHSS detection, emergency response or clinician notifications.

## Recommended first-release scope

Keep authenticated individual accounts, manual cycle records, explicit clinic-prescribed dose occurrences, optional calendar reminders, appointments, result recording, basic charts, check-ins, journals and record export. Label all entries as user-entered and not clinic-verified.

Postpone partner sharing, community, therapist discovery/booking, generative Nora, paid subscriptions, unreviewed treatment articles/videos, automated treatment forecasts and staff clinical dashboards. Reliable push/SMS reminders need a server scheduler, timezone and rescheduling rules, delivery observability and user permission; calendar export is only a limited alternative, not equivalent delivery.

## Test-project acceptance checklist (launch blockers)

1. Provision/authorise a separate test backend, apply the migration, configure the public environment variables and allowed Auth redirects. This step has not been performed on any live project.
2. Verify signup, duplicate signup, confirmed-email login, wrong-password error, logout, reload, reset email, valid/expired/used reset links, signout in another tab and expired sessions. Enforce provider-side password policy, rate limiting and email delivery configuration.
3. With synthetic accounts A and B, create every record type, edit it, reload and delete where supported. Attempt direct REST reads/writes with B's IDs while signed in as A, then anonymously. Verify denial at the database/gateway, not just hidden buttons.
4. Test two same-day occurrences of one medicine; log only one taken and the other missed/pending. Check the home summary, schedule/history, report and persistence. Test network interruption, repeated clicks and invalid input. Confirm copied clinic text and units remain exact.
5. Import each dose reminder into iOS/Android calendars. Verify local timezone, daylight-saving transitions, travel and alarm settings. Test changed/deleted doses: old imported events require manual correction. Until verified, do not promote these reminders as reliable medication delivery.
6. Review the app in a real browser at mobile and desktop sizes, keyboard-only and screen-reader use. Check navigation, scrolling, focus, form errors, long names/notes, date inputs, exports and reload. The cloud-browser test here was blocked.
7. Agree privacy notice, consent, retention, account deletion and data-subject request process; hosting region/legal obligations; project administrator access, MFA, backup/restore and incident handling. A project operator with privileged database credentials can access records; do not claim “only you can ever see” or end-to-end encryption.
8. If staff/admin features are required for first release, define who needs which fields and why, read/write scopes, clinic boundaries, audit trails and revocation before implementing. The Supabase dashboard is privileged infrastructure access, not a clinic-safe admin portal. Do not use a client-supplied `admin` flag.
9. Obtain clinical approval of content and escalation wording. Decide whether the limited calendar reminder and JSON report are sufficient for the first release or whether push delivery and clinic-friendly PDF reports are release requirements.
10. Review the branch, CI/dependency checks and staging configuration. Deployment requires separate approval; this work does not publish or merge the app.
