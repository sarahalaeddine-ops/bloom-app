# Bloom on the App Store and Google Play (Capacitor)

Owned by **sa6**. Status (2026-09-28): **the app is built and ready for the founder's store steps.** The founder approved Capacitor on 2026-09-27; the iOS and Android projects are in `ios/` and `android/`, the app bundle builds with `npm run build:app`, and the native features are in. What is left is mostly accounts, legal review and uploading: see **section 14, "What you need to do"**, written for a non-technical reader. Guideline quotes were checked on 2026-09-27 against the sources in section 12. Items marked **(verify)** come from sources that could not be opened from this environment and must be re-checked before submission.

Quick map of this document:
- Sections 1 to 12: the plan and the rules we designed against (kept for reference).
- Section 13: what was built, packages added, permissions, assumptions (for developers).
- **Section 14: What you need to do (founder checklist, in order).**
- Section 15: store listing drafts (English and Arabic).
- Section 16: answers for Apple's App Privacy questions and Google's Data safety form.

---

## 1. Recommendation

Ship Bloom as a **Capacitor** app that wraps the existing React code, not a React Native / Expo rewrite.

- **Why Capacitor:** Bloom is a client-rendered Next.js app (`"use client"` screens, all state in `lib/store.js`). Capacitor runs that same code in a native WebView and adds native plugins (notifications, Face ID, HealthKit). One codebase for web, iOS and Android; the web demo keeps working. An Expo rewrite would mean rebuilding every screen.
- **Main risk: Apple guideline 4.2 (Minimum Functionality).** Apple rejects apps that are just a website in a wrapper. The plan answers that with real native features (section 3) and by **bundling the app shell inside the app** (it opens and works offline) instead of pointing the WebView at bloomivfcompanion.com.
- **Rough timeline:** 6 to 9 weeks from approval to both stores, most of it waiting on accounts, legal review of the privacy policy and consent, and store review (section 10).

---

## 2. How the app build works

```
 iOS / Android app (Capacitor 8)
 ┌──────────────────────────────────────────────┐
 │ WebView loads the BUNDLED static export of   │
 │ the app shell (splash → auth → onboarding →  │   HTTPS + Authorization: Bearer <Supabase token>
 │ AppShell), same React code as the web demo   │ ─────────────────────────────────────────────▶ bloomivfcompanion.com
 │ Native plugins: notifications, Face ID,      │                                                 /api/nora, /api/account/delete
 │ privacy screen, optional HealthKit           │ ─────────────────────────────────────────────▶ Supabase (Auth + Postgres, RLS)
 └──────────────────────────────────────────────┘
```

### 2.1 A separate "app" build target
- Capacitor needs a folder of static files (`webDir`). Next 16 can produce one with `output: "export"`, but a static export **cannot include route handlers that read the request, `proxy.js`, cookies or rewrites** (`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`, "Unsupported Features"). So the app build exports only the app shell; the API routes stay on Vercel.
- Planned changes (after approval, one PR):
  - `BUILD_TARGET=app` in `next.config.ts` switches to `output: "export"` and builds only the app page (the marketing page and API routes stay in the web build).
  - `NEXT_PUBLIC_API_BASE=https://bloomivfcompanion.com` so `lib/api.js` and `store.eraseAccount()` call absolute URLs in the app (relative on the web).
  - CORS on `/api/nora` and `/api/account/delete` for the app origins only (`capacitor://localhost` on iOS, `https://localhost` on Android). They use Bearer tokens, not cookies, so no credentialed CORS is needed.
  - `lib/native.js`: small wrappers that call a Capacitor plugin when running natively and fall back to the current web code (service worker notifications, PIN lock) otherwise, so the web demo is unchanged.

### 2.2 Removing the demo password gate for the app
The web demo sits behind `proxy.js` (HTTP Basic auth, then a cookie). The app can't use that: the static export has no proxy, reviewers must not need a password, and API calls come from another origin without the cookie.

Plan (needs founder sign-off, see section 11):
1. The app build is **cloud mode only**: sign-in with a Supabase account, so every API call carries her verified token (G1, shipped).
2. `proxy.js` lets `/api/nora` requests with an `Authorization: Bearer` header through to the route, which already verifies the token with Supabase and returns `401` when it is invalid. Requests without a token still need the demo cookie. Add a `NORA_REQUIRE_AUTH=1` env var so that, in production, `/api/nora` answers local/demo-mode callers with offline replies only (no Anthropic call without a verified account).
3. `/api/account/delete` is already outside the gate and only acts for a valid session.
4. In the app build, remove the **"Try the demo as Sarah"** button (guideline 2.2: demos don't belong on the App Store; use TestFlight) and hide **"Upgrade to Bloom+"** until in-app purchase exists (3.1.1).
5. Durable per-user rate limits (G2) become important once the password gate is gone: do them before public launch.

### 2.3 Storage and sessions on the device
- `localStorage` inside the WebView keeps working, so `lib/store.js` needs no rewrite. Supabase sessions stay in WebView storage at first; moving the refresh token to the iOS Keychain / Android Keystore via a secure-storage plugin is a later hardening step (G5).
- **iCloud backups (verify with Apple):** guideline 5.1.3(ii) says apps "may not store personal health information in iCloud". WebView data lives in the app's Library folder, which is included in iCloud device backups by default. Plan: exclude the WebView data directory from backup (a few lines of native code setting `isExcludedFromBackup`) and ask Apple in the review notes if in doubt. On Android, set `android:allowBackup="false"` (or exclude the WebView data with backup rules).

---

## 3. Native features (the answer to guideline 4.2)

Guideline 4.2: *"Your app should include features, content, and UI that elevate it beyond a repackaged website. If your app is not particularly useful, unique, or 'app-like,' it doesn't belong on the App Store."*

| Feature | What she gets | Plugin (needs approval) | Notes |
|---|---|---|---|
| **Dose and appointment reminders (local notifications)** | Reminders fire on time even when Bloom is closed and the phone is offline. Today's web reminders only fire while the app is open or backgrounded. | `@capacitor/local-notifications` | Scheduled on the device from `lib/reminders.js`; no server, no data leaves the phone. Lock-screen text stays neutral ("Time for your evening reminder", no drug names). Asks permission at the moment she turns reminders on, never at launch (5.1.2(i): no forcing system features). |
| **Push notifications (server)** | Clinic-driven or server-scheduled messages later (roadmap R5). | `@capacitor/push-notifications` | Needs APNs key (Apple) and Firebase Cloud Messaging (Google, a new processor; DPA needed). Phase 2; local notifications cover v1. |
| **Face ID / Touch ID / fingerprint app lock** | Opens Bloom with Face ID instead of (or as well as) the 4-digit PIN. | `@aparajita/capacitor-biometric-auth` or `@capgo/capacitor-native-biometric` | Requires `NSFaceIDUsageDescription`. PIN stays as the fallback and on the web. |
| **Privacy screen** | The app-switcher snapshot is blurred so her cycle data isn't visible over her shoulder. | `@capacitor/privacy-screen` (official) | Small, strongly on-brand for a fertility app. |
| **Apple Health / Health Connect (optional, phase 2)** | Read her weight (OHSS watch) and cycle data she already tracks, instead of typing it twice. Read-only at first. | `@capgo/capacitor-health` (HealthKit + Health Connect) | Extra rules: 2.5.1 (integrate with the Health app for health purposes), 5.1.3 (no advertising or data mining; disclose the specific health data read; no iCloud storage), Google Play Health Connect declaration. **Recommendation: never send HealthKit data to Nora/Anthropic in v1**; if ever, only with its own explicit consent. |
| Native share sheet | Share the clinic report PDF/text to her clinic via Mail/WhatsApp. | `@capacitor/share` (optional) | Replaces the web download. |
| App shell polish | Splash screen, status bar colours, back button on Android, deep links. | `@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar` | Standard. |

With bundled offline UI, reliable offline reminders, biometric lock and a privacy screen, Bloom does things the website can't. HealthKit strengthens the case further but adds review scrutiny, so it is optional for v1.

---

## 4. Health-app review requirements

### 4.1 Apple (App Review Guidelines, last updated 8 June 2026)

| Requirement | Guideline (quoted) | Bloom status |
|---|---|---|
| **Submit as a company, not an individual** | 5.1.1(ix): *"Apps that provide services in highly regulated fields (such as … healthcare …) or that require sensitive user information should be submitted by a legal entity that provides the services, and not by an individual developer."* | **To do.** Enrol the Bloom company in the Apple Developer Program (needs a D-U-N-S number and legal authority to sign). |
| **Privacy policy** in App Store Connect and inside the app | 5.1.1(i): must say what is collected and how it's used, confirm third parties give equal protection, and *"explain its data retention/deletion policies and describe how a user can revoke consent and/or request deletion"*. | **To do (lawyer).** Section 6 of `architecture.md` has the data inventory and processor list to base it on. Link it from the Privacy Centre and the sign-up screen. |
| **Consent and withdrawal** | 5.1.1(ii): *"Apps must also provide the customer with an easily accessible and understandable way to withdraw consent."* | **Shipped (G11)**, wording DRAFT pending legal review. |
| **Third-party AI disclosure and explicit permission** | 5.1.2(i): *"You must clearly disclose where personal data will be shared with third parties, including with third-party AI, and obtain explicit permission before doing so."* | **Shipped (G11):** separate opt-in for Nora AI (Anthropic), off by default; Nora answers offline without it. Name Anthropic in the privacy policy and App Privacy details. |
| **Account deletion in the app** | 5.1.1(v): *"If your app supports account creation, you must also offer account deletion within the app."* Apple's guidance: easy to find (account settings), deletes the account and associated data the developer isn't legally required to keep. | **Shipped (G4):** Privacy Centre → Delete all my data erases the Supabase account and data. Consider a shortcut in Profile too. Apple doesn't accept "email us to delete". |
| **Medical disclaimer / see a doctor** | 1.4.1: medical apps get greater scrutiny; *"Apps should remind users to check with a doctor in addition to using the app and before making medical decisions."* 1.4.2: dosage calculators must come from approved entities. | Nora never diagnoses or changes doses and ends medical content with "confirm with your clinic"; the Nora screen says "Nora is not a doctor". **To add:** a line in onboarding and in the store description. Keep Bloom away from dose calculation. If any part gets regulatory clearance, link it in review notes. |
| **AI disclosure in the product** | 5.1.2(i) above, plus accurate metadata (2.3). | Nora is labelled "Nora AI"; add "AI companion, not a doctor" to the store description and screenshots. Be ready to explain the safety design (emergency referral, no diagnosis) in review notes: link or paste the summary from `architecture.md` section 7. |
| **Demo account for reviewers** | 2.1(a): *"include demo account info (and turn on your back-end service!) if your app includes a login."* A built-in demo mode instead needs prior approval. | **To do:** a dedicated reviewer account on the production Supabase project, pre-onboarded with realistic sample data and consent given, credentials in the App Review notes; `ANTHROPIC_API_KEY` set so live Nora works; no password gate. Delete-account test: tell reviewers to create a new account for that, or restore the reviewer account after review. |
| **App Privacy details ("nutrition label")** | App Store Connect privacy questions (Health & Fitness, Contact Info, User Content; linked to the user; no tracking). | **To do** with the privacy policy. Include "Health" (user-provided health data) and the privacy-choices URL. |
| **No ads or data mining on health data** | 5.1.3(i) and 5.1.2(vi). | Already true: no ads, no analytics SDKs. Keep it that way. |
| **In-app purchases** | 3.1.1: unlocking features or subscriptions *"must use in-app purchase"*. | "Upgrade to Bloom+" must use IAP on iOS, or be hidden in the app build for v1. |
| **Login services** | 4.8: only if a third-party/social login is added (then an equivalent private option is needed). | Email + password only today; not triggered. |
| **Age rating** | App Store Connect age-rating questionnaire (medical/treatment information, AI chat). **(verify current questions at submission)** | Expect 17+/18+ or the closest adult rating given fertility content. |

### 4.2 Google Play

| Requirement | Bloom status |
|---|---|
| **Health apps declaration** (Play Console → App content). Reproductive health / fertility treatment apps are a heightened-scrutiny category. **(verify on the Play Console help page, blocked from here)** | To do. Declare reproductive health / medical category; no use of health data for employment or insurance decisions. |
| **Data safety form** consistent with what the app collects and shares (Supabase, Anthropic, Vercel). | To do, from `architecture.md` section 6. |
| **Account deletion**: in-app path plus a **web link** where users can request deletion without reinstalling. **(verify)** | In-app shipped. To do: a public page, e.g. `bloomivfcompanion.com/delete-account`, explaining in-app deletion and offering a request form (verify identity by email). |
| **Target API level**: from 31 Aug 2026, new apps and updates must target Android 16 (API 36); extension possible to 1 Nov 2026. | Capacitor 8 targets API 36 by default. |
| **Testing requirement for new personal accounts** (closed test with at least 12 testers for 14 days before production). **(verify)** | Enrol as an **organisation** (also better for a health app) to avoid it, or plan the 2 weeks in. |
| Health Connect permissions declaration (only with the HealthKit/Health Connect phase). | Phase 2. |

---

## 5. Legal and product prerequisites (before submission)
1. Company enrolment with Apple (D-U-N-S) and Google (organisation account).
2. Privacy policy and terms, reviewed by a lawyer, covering: data inventory, processors (Supabase, Anthropic, Vercel, plus APNs/FCM if push), retention, deletion, consent withdrawal, international transfers.
3. Final consent wording (G11 is DRAFT) and the UAE data-residency decision (`architecture.md` section 9). A store launch in the UAE with cloud data outside the UAE is blocked on that decision.
4. Medical/regulatory position: Bloom supports and explains, never diagnoses or doses. Confirm with a regulatory adviser that nothing counts as a medical device in the launch markets.
5. DPAs with Supabase, Anthropic and Vercel (and Firebase if push).

---

## 6. Build pipeline

| Option | iOS | Android | Cost | Verdict |
|---|---|---|---|---|
| **Own Mac + Xcode 26** | Build, sign, upload from Xcode | Android Studio (any OS) | A Mac (Apple silicon) | Simplest to start; manual. Capacitor 8 needs Xcode 26+ and Android Studio 2025.2.1+. |
| **Codemagic** | Cloud macOS (M2/M4), code signing, upload to App Store Connect/TestFlight | Yes | Individuals: 500 free macOS M2 minutes/month; beyond that about $0.095/min (M2); team plans are paid | **Recommended for CI builds.** Works with Capacitor projects; keeps signing keys out of laptops. |
| Xcode Cloud | Yes (Apple-hosted) | No | 25 compute hours/month included in the Apple membership | Good for iOS only; Android needs another CI. |
| GitHub Actions (macOS runners) | Yes, with fastlane | Yes | Paid macOS minutes | Possible, more setup. |
| EAS Build (Expo) | Built for Expo/React Native projects | Same | n/a | **Not a fit** for a Capacitor app. |

Flow: PR → existing CI (lint, test, build) → on tag `app-v*`: `BUILD_TARGET=app next build` → `npx cap sync` → Codemagic builds iOS (TestFlight) and Android (Play internal testing). Secrets (App Store Connect API key, Android upload keystore) live only in Codemagic. Use Play App Signing.

---

## 7. Packages (plan; see 13.2 for what was actually installed)

Versions as published on npm on 2026-09-27. All are free, open-source (MIT unless noted), and add native code to the app build only; the web bundle only gains the small `@capacitor/core` bridge (tree-shaken plugin wrappers).

| Package | Version | Why | Phase |
|---|---|---|---|
| `@capacitor/core` | 8.5.2 | Runtime bridge between web code and native | v1 (runtime) |
| `@capacitor/cli` | 8.5.2 | `cap sync`, project tooling | v1 (dev) |
| `@capacitor/ios`, `@capacitor/android` | 8.5.2 | Native platform projects | v1 |
| `@capacitor/local-notifications` | 8.3.1 | Offline dose/appointment reminders | v1 |
| `@capacitor/privacy-screen` | 2.0.1 | Blur the app-switcher snapshot | v1 |
| `@capacitor/app`, `@capacitor/splash-screen`, `@capacitor/status-bar` | 8.1.1 / 8.0.2 / 8.0.3 | Lifecycle, back button, splash, status bar | v1 |
| One biometric plugin: `@aparajita/capacitor-biometric-auth` (10.0.0) **or** `@capgo/capacitor-native-biometric` (8.6.11) | see left | Face ID / fingerprint lock | v1 (pick one after a spike: maintenance, Capacitor 8 support, licence) |
| `@capacitor/push-notifications` | 8.1.2 | Server push (APNs/FCM) | Phase 2 (R5) |
| `@capgo/capacitor-health` | 8.11.4 | Apple Health + Health Connect | Phase 2, optional |
| `@capacitor/share` | (check at install) | Native share sheet | Optional |

Community plugins (`@aparajita/*`, `@capgo/*`) need a quick review of licence, maintenance and permissions before approval.

---

## 8. Accounts and running costs

| Item | Cost | Notes |
|---|---|---|
| Apple Developer Program (organisation) | US$99 / year | Needs a legal entity and D-U-N-S number (free, can take days to weeks). |
| Google Play Console (organisation) | US$25 one-time | Organisation verification documents. |
| Codemagic | $0 to start (500 min/month, individual) then pay per minute or a team plan | A full iOS + Android release build is roughly 15 to 30 minutes. |
| Mac for local debugging | One-off, if the team has none | Needed to run the iOS simulator and debug native plugins. |
| Firebase (push, phase 2) | Free tier | New processor: add to the privacy policy and processor list. |
| Existing: Vercel, Supabase, Anthropic | Unchanged | Store users add API and database load; durable rate limits (G2) before launch. |

---

## 9. Step-by-step checklist

**Phase 0: decisions and accounts (week 1 to 3, in parallel)**
- [ ] Founder approves Capacitor and the v1 package list (section 7).
- [ ] Decide the app's Nora policy (sign-in required for live Nora; `NORA_REQUIRE_AUTH`), and whether to hide Bloom+ or build IAP.
- [ ] D-U-N-S number; enrol Apple Developer Program and Google Play as an organisation.
- [ ] Lawyer: privacy policy, terms, final consent wording, UAE residency position.
- [ ] Reserve the app name and bundle id (e.g. `com.bloomivfcompanion.app`) in both consoles.

**Phase 1: app build (week 2 to 4)**
- [ ] `BUILD_TARGET=app` static export of the app shell; `NEXT_PUBLIC_API_BASE`; CORS for app origins on the two API routes; tests.
- [ ] `proxy.js` Bearer pass-through + `NORA_REQUIRE_AUTH`; durable rate limits (G2).
- [ ] Add Capacitor (`ios`, `android`), app icons, splash, status bar; hide the demo persona and Bloom+ in the app build.
- [ ] Exclude WebView data from iCloud backup; `allowBackup=false` on Android.
- [ ] Privacy policy link in the app (Privacy Centre and sign-up); medical disclaimer line in onboarding.

**Phase 2: native features (week 3 to 5)**
- [ ] Local notifications for dose/appointment reminders (neutral lock-screen text, permission asked in context).
- [ ] Biometric app lock (PIN fallback), privacy screen.
- [ ] (Optional) Apple Health / Health Connect read-only weight, with its own consent and disclosure.
- [ ] Device testing on real iPhones/Android phones in en/ar (RTL)/fr.

**Phase 3: store preparation (week 4 to 6)**
- [ ] Reviewer account on production with sample data; review notes (demo credentials, safety design summary, AI disclosure, how to test account deletion).
- [ ] App Privacy details (Apple), Data safety + Health apps declaration (Google), age rating.
- [ ] Web page for account deletion requests (Google Play).
- [ ] Screenshots (6.9" iPhone, Android phone) in English and Arabic; description with "AI companion, not a doctor".
- [ ] Codemagic pipeline: TestFlight + Play internal testing builds from a tag.

**Phase 4: beta and submission (week 6 to 9)**
- [ ] TestFlight + Play closed testing with real patients (2 weeks; covers Google's tester rule if on a personal account).
- [ ] Fix feedback, run `docs/sa6/nora-evals.md` against the live model.
- [ ] Submit to both stores; expect questions on health data and AI. Keep the reviewer account and backend up.

## 10. Timeline (indicative)

| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Decisions, accounts, D-U-N-S | ■ | ■ | ■ | | | | | | |
| Legal: policy, consent, residency | ■ | ■ | ■ | ■ | | | | | |
| App build target + gate/CORS/limits | | ■ | ■ | ■ | | | | | |
| Native features | | | ■ | ■ | ■ | | | | |
| Store prep, reviewer account, CI | | | | ■ | ■ | ■ | | | |
| Beta (TestFlight / closed test) | | | | | | ■ | ■ | | |
| Submission and review | | | | | | | | ■ | ■ |

The critical path is usually the company enrolment (D-U-N-S) and the legal review, not the code.

## 11. Decisions for the founder

Defaults applied on 2026-09-28 so work could continue. Each can be reversed; tell sa6.

| # | Decision | Default applied (assumption) | How to reverse |
|---|---|---|---|
| 1 | Capacitor and packages | **Approved** by the founder (2026-09-27). Installed list in 13.2. | n/a |
| 2 | Live Nora in the app | Only for signed-in accounts. The app has no demo gate: requests with a Supabase token pass `proxy.js` and the route verifies them. `NORA_REQUIRE_AUTH=1` (optional) also stops live AI for the web demo. | Unset `NORA_REQUIRE_AUTH`. |
| 3 | Bloom+ / Upgrade | **Hidden in the native app** for v1 (no Apple in-app purchase needed). Web unchanged. | Build IAP (StoreKit / Play Billing) first. |
| 4 | HealthKit / Health Connect | **Later**, not v1. | Phase 2 plugin + consent. |
| 5 | Reviewer access | A **reviewer login** on the production Supabase project (14, step 5). No demo persona in the app. Credentials never in the repo. | n/a |
| 6 | App id | `com.bloomivfcompanion.app`, name "Bloom". **Can't change after the first upload.** | Edit `capacitor.config.ts`, `android/app/build.gradle`, Xcode bundle id before uploading. |
| 7 | iPhone only, portrait | No iPad build (saves iPad screenshots and iPad review). | Set Xcode "Targeted device family" to iPhone + iPad. |
| 8 | Exact alarms (Android) | Not used: reminders may arrive a few minutes late in battery-saving mode, but no Play exact-alarm declaration is needed. | Add `SCHEDULE_EXACT_ALARM` + Play declaration. |
| 9 | Privacy screen | On only while the app lock (PIN) is on. On Android it also blocks screenshots. | `lib/native.js` `setPrivacyScreen`. |
| 10 | Budget | Apple US$99/year, Google US$25 once, Codemagic minutes, a Mac if needed. | n/a |
| 11 | Company details | Needed for enrolment (legal entity, D-U-N-S, Account Holder). | n/a |
| 12 | UAE data residency | Still open: needed before a UAE launch with cloud accounts (`architecture.md` section 9). | n/a |

## 12. Sources (checked 2026-09-27)
- Apple, [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) (last updated 8 June 2026): 1.4.1, 1.4.2, 2.1(a), 2.2, 2.5.1, 3.1.1, 4.2, 4.8, 5.1.1(i), (ii), (v), (ix), 5.1.2(i), (vi), 5.1.3.
- Apple, [Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
- Apple, [App privacy details on the App Store](https://developer.apple.com/app-store/app-privacy-details/).
- Apple, [Enrollment](https://developer.apple.com/programs/enroll/) (organisation, D-U-N-S), [Membership details](https://developer.apple.com/programs/whats-included/), [Xcode Cloud](https://developer.apple.com/xcode-cloud/) (25 compute hours/month included), [program fee help](https://developer.apple.com/help/account/membership/program-enrollment/) (US$99/year).
- Android Developers, [Target API level requirements for Google Play](https://developer.android.com/google/play/requirements/target-sdk) (API 36 from 31 Aug 2026).
- Google Play Console Help, [Health apps declaration form](https://support.google.com/googleplay/android-developer/answer/14738291?hl=en), [Health app categories](https://support.google.com/googleplay/android-developer/answer/13996367?hl=en), [Health Content and Services](https://support.google.com/googleplay/android-developer/answer/16679511?hl=en) (blocked from this environment; summarised from search results, **verify**). Also [Publish your health app on Google Play](https://developer.android.com/health-and-fitness/health-connect/publish).
- Google Play fee and tester rule: [Afkar Software](https://afkarsoftware.com/en/blog-detail/google-play-console-account-2026-one-time-25-fee/), [IconikAI](https://www.iconikai.com/blog/google-play-developer-account-fee-2026) (secondary sources, **verify** in Play Console).
- Capacitor 8 requirements: [Updating to 8.0](https://capacitorjs.com/docs/updating/8-0), [Environment setup](https://capacitorjs.com/docs/getting-started/environment-setup), [Capawesome upgrade guide](https://capawesome.io/blog/how-to-upgrade-your-capacitor-app-to-capacitor-8/) (iOS 15+, Xcode 26+, minSdk 24, target/compile SDK 36; capacitorjs.com was blocked from here, values from search results, **verify**). Package versions from the npm registry.
- Codemagic, [Pricing docs](https://docs.codemagic.io/billing/pricing/) and [pricing page](https://codemagic.io/pricing/) (500 free macOS M2 minutes/month for individuals; per-minute rates).
- Next.js 16 static export limits: `node_modules/next/dist/docs/01-app/02-guides/static-exports.md`.

---

## 13. What was built (for developers)

### 13.1 Build targets
| Command | Output | Notes |
|---|---|---|
| `npm run build` | Web (Vercel): marketing site, `/demo-7q4x`, `/privacy`, `/support`, `/delete-account`, API routes, `proxy.js` | Unchanged behaviour. |
| `npm run build:app` | `out/`: static export of the app only | `scripts/build-app.mjs` sets `BUILD_TARGET=app`, `NEXT_PUBLIC_BUILD_TARGET=app`, `NEXT_PUBLIC_API_BASE` (default `https://bloomivfcompanion.com`). `next.config.ts` then uses `output: "export"` with `pageExtensions: ["app.jsx"]`, so only `app/layout.app.jsx` and `app/page.app.jsx` are routes; `route.js` handlers and `proxy.js` are left out. |
| `npm run app:sync` | `build:app` + `cap sync` | Copies `out/` into `ios/App/App/public` and `android/app/src/main/assets/public` (both git-ignored) and updates plugins. |
| `npm run app:ios` / `app:android` | Opens Xcode / Android Studio | |
| `npm run app:icons` | Icons, splash, notification icon | `scripts/app-icons.mjs` renders them from the Bloom star with Playwright/Chromium. PNGs are committed. |

- **API from the app:** `lib/config.js` `apiUrl()` makes `/api/nora` and `/api/account/delete` absolute. `lib/cors.js` answers CORS only for `capacitor://localhost` (iOS) and `https://localhost` (Android), without credentials. `proxy.js` lets Bearer requests and preflights to `/api/nora` through; the route verifies the Supabase token, and refuses a token when the server has no Supabase config (never falls back to demo mode).
- **Public pages:** the app opens `siteUrl("/privacy")` etc. on bloomivfcompanion.com in the system browser.
- **CI:** `.github/workflows/ci.yml` also runs `build:app` and compiles the Android debug app (`./gradlew assembleDebug`) on GitHub's runners.

### 13.2 Packages added (founder-approved 2026-09-27)
All free and open source. Only `@capacitor/core` and lazily loaded plugin wrappers reach the web bundle; the plugins run only inside the native app (`lib/native.js` imports them on demand).

| Package | Version | Licence | Why |
|---|---|---|---|
| `@capacitor/core` | ^8.5.2 | MIT | Bridge between the web code and native. |
| `@capacitor/cli` (dev) | ^8.5.2 | MIT | `cap sync`, `cap open`. |
| `@capacitor/ios`, `@capacitor/android` | ^8.5.2 | MIT | The native projects (`ios/`, `android/`). |
| `@capacitor/local-notifications` | ^8.3.1 | MIT | Dose and appointment reminders that fire with Bloom closed and offline (guideline 4.2). |
| `@capacitor/app` | ^8.1.1 | MIT | Android back button, foreground/background (re-lock, re-plan reminders). |
| `@capacitor/status-bar` | ^8.0.3 | MIT | Dark status-bar text on Bloom's light background. |
| `@capacitor/splash-screen` | ^8.0.2 | MIT | Native launch screen in Bloom colours, hidden once the app is ready. |
| `@capacitor/keyboard` | ^8.0.5 | MIT | Resizes the view when the keyboard opens so the chat box stays visible (`resize: native`). |
| `@capacitor/privacy-screen` | ^2.0.1 | MIT | Hides her data in the app switcher while the app lock is on. |
| `@capgo/capacitor-native-biometric` | ^8.6.11 | **MPL-2.0** | Face ID / Touch ID / fingerprint unlock. **The only non-official package.** |

**Why this biometric plugin.** There is no official Capacitor biometrics plugin. The two candidates were `@capgo/capacitor-native-biometric` and `@aparajita/capacitor-biometric-auth`. We picked Capgo because: it declares Capacitor 8 as a peer dependency only (the other one pins `@capacitor/android`, `/ios`, `/app`, `/core` as hard dependencies, which risks duplicate native versions); it was updated in September 2026 (the other in February 2026); it supports Swift Package Manager, which our iOS project uses; and it can later keep the Supabase refresh token in the iOS Keychain / Android Keystore (gap G5) without another package. Licence: MPL-2.0 is file-level copyleft; using it unmodified in a closed app is fine, and only changes to its own files would have to be published. Keep the licence notice in the app's open-source notices.

Not added: `@capacitor/push-notifications` (server push is phase 2 and adds Firebase as a processor), `@capacitor/preferences` (not needed; `localStorage` works in the WebView), `@capacitor/assets` (icons are generated with Playwright instead), HealthKit plugins (phase 2).

### 13.3 Native features (guideline 4.2)
| Feature | Where | Behaviour |
|---|---|---|
| Offline reminders | `lib/reminders.js` `nativePlan`, `syncNative`; `lib/native.js` | The next 7 days of reminders (max 60, iOS limit 64) are scheduled on the phone. Re-planned when she changes settings, logs a dose, or opens the app. Title "Bloom", neutral body ("Time for your 9:00 PM dose"), no medicine names on the lock screen, in her language. Tapping opens Medications or Appointments. Permission asked only when she turns reminders on. |
| Face ID / fingerprint unlock | `components/LockScreen.jsx`, Privacy Centre | Optional, on top of the PIN (PIN always works). Device-only setting (`bloom_lock_bio`, never synced). Turning it on asks for Face ID once. |
| Re-lock and privacy screen | `components/BloomApp.jsx` | With the lock on: locks again after 60 s in the background; app-switcher snapshot hidden. |
| Back button (Android) | `components/AppShell.jsx` | Closes quick log, then the open More screen, then goes Home, then sends Bloom to the background. |
| Safe areas | `app/globals.css` (`.native-app`) | Edge-to-edge WebView; padding for notch, status bar and home indicator. |
| No backups of health data | `ios/App/App/AppDelegate.swift`, Android manifest | iOS: `Library/WebKit` and `Caches` excluded from iCloud backup (5.1.3(ii)). Android: `allowBackup=false` and data-extraction rules exclude everything. |

### 13.4 Permissions and usage strings
| Platform | Entry | Text / reason |
|---|---|---|
| iOS | `NSFaceIDUsageDescription` | "Bloom uses Face ID to unlock your private IVF journal and cycle data. Your face data never leaves your iPhone." (English only; add `ar.lproj`/`fr.lproj` InfoPlist.strings in Xcode for translated prompts.) |
| iOS | Notifications | Asked at runtime when she turns reminders on (no Info.plist key needed). |
| iOS | `ITSAppUsesNonExemptEncryption = false` | Bloom only uses standard encryption (HTTPS, AES in the browser crypto API). Confirm in App Store Connect's export compliance questions. |
| Android | `POST_NOTIFICATIONS` | Reminders (Android 13+ asks at runtime). |
| Android | `USE_BIOMETRIC` | Face / fingerprint unlock. |
| Android | `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK` | Added by the notifications plugin: restores scheduled reminders after a restart. |
| Android | `SCHEDULE_EXACT_ALARM` | **Removed** on purpose (see 11, row 8). |
| Android | `INTERNET` | Accounts, sync, Nora. |

### 13.5 Real accounts vs the demo
Real accounts no longer see Sarah's follicles, E2, check-ins or dose history: Home, Charts, the Cycle Report and More show her own logged scans, or an empty state with **Log a scan result**. **Still demo data for everyone (next priority, see the report):** the medication list and schedule (`MEDS`) and appointments (`APPOINTMENTS`), so reminders follow the demo schedule until she can enter her own medicines. **Do not start external testing with real patients before that is fixed.**

### 13.6 Verified here vs not
- Verified in this environment: lint, 124 unit tests, web build, app build, `cap sync` (iOS + Android), Playwright on the static app bundle at 390x844 in English and Arabic (sign-up, onboarding disclaimer, empty states, scan logging, Nora AI disclosure, Upgrade hidden, profile wording, reminders and lock screen in Arabic), the web demo unchanged, CORS and gate behaviour with curl.
- **Not verified:** a real iOS build (needs a Mac and Xcode) and an Android compile (the Android SDK download is blocked in this sandbox; CI compiles it on GitHub). Native plugins (notifications, Face ID, back button, status bar, privacy screen) have only been exercised through their no-op web paths. **Test on real phones before submission** (checklist step 7).

---

## 14. What you need to do (founder checklist)

Plain language, in order. Tick each box. Anything technical can be handed to a developer with this page.

### Step 1. Accounts (start today: they take the longest)
- [ ] **D-U-N-S number** for the Bloom company (free, from Dun & Bradstreet; can take 1 to 3 weeks). Apple needs it for a company account. Apple requires health apps to be published by a company, not a person.
- [ ] **Apple Developer Program as an organisation** (US$99 a year): developer.apple.com/programs/enroll. You need the company's legal name, D-U-N-S number, a website on the company domain, and the authority to sign for the company.
- [ ] **Google Play Console as an organisation** (US$25 once): play.google.com/console. Have company documents ready for verification. An organisation account also avoids the "12 testers for 14 days" rule for new personal accounts **(verify)**.
- [ ] In App Store Connect, create the app: name **Bloom: IVF Companion**, bundle id **com.bloomivfcompanion.app**, primary language English. In Play Console, create the app with the same name.

### Step 2. Settings on Vercel (the website that runs Bloom's servers)
In Vercel → your project → Settings → Environment Variables (Production), make sure these are set, then redeploy:
- [ ] `ANTHROPIC_API_KEY` (Nora's live answers).
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (accounts).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (lets people delete their account in the app; Apple and Google require it). Keep it secret; never share it.
- [ ] `DEMO_PASSWORD` (keeps the web demo private, unchanged).
- [ ] Optional: `NORA_REQUIRE_AUTH` = `1` if you want live Nora only for real accounts (the password-protected web demo then gets offline answers). Leave it unset while you still use the web demo for pitches.
- [ ] Do **not** set `NEXT_PUBLIC_API_BASE` on Vercel (it is only for the app build).
- [ ] Check that bloomivfcompanion.com/privacy, /support and /delete-account open.

### Step 3. Supabase (the database and sign-in)
- [ ] Supabase → SQL editor → paste and run `supabase/schema.sql` (safe to run again).
- [ ] Authentication → Providers → Email: decide whether new accounts must confirm their email. If on, new users see "Check your email" before they can sign in (fine for the stores, but tell the reviewer account in step 5 to be pre-confirmed).
- [ ] Note which **region** your Supabase project is in: the privacy policy needs it.

### Step 4. Legal (before you submit)
- [ ] A lawyer reviews and finalises: `/privacy` (currently marked DRAFT, with items in [square brackets] to fill in: company name and address, Supabase region, transfer safeguards, backup retention, Anthropic's terms), the consent wording in the app, and terms of use. Arabic and French versions need a professional check too.
- [ ] Sign data processing agreements with Supabase, Anthropic and Vercel.
- [ ] Decide the UAE data-residency question before launching in the UAE with accounts.
- [ ] Confirm with a regulatory adviser that Bloom is not a medical device in your launch countries (it shows her own numbers and never interprets them or doses).
- [ ] When final, remove the DRAFT banner (ask a developer: `lib/legal-i18n.js`).

### Step 5. Reviewer login (Apple and Google both test the app with it)
- [ ] In Supabase → Authentication → Users → **Add user**: an address you control (for example reviewer@bloomivfcompanion.com), a strong password, tick "Auto confirm". **Never put this password in the code or in email threads; keep it in a password manager.**
- [ ] On a phone with the app (step 7), sign in with it once: finish onboarding, allow cloud sync and Nora AI, turn reminders on, log two check-ins and two scan results so the screens look alive.
- [ ] In App Store Connect → App Review Information: enter the reviewer email and password, and paste these notes: "Bloom is an IVF companion. Nora is an AI companion (Anthropic Claude) that never diagnoses or changes doses, refers emergencies to the clinic and asks for explicit consent before any AI processing (Privacy Centre). To test account deletion, please create a new account (More → Privacy Centre → Delete all my data) rather than deleting the reviewer account."
- [ ] Same credentials in Play Console → App content → **App access**.
- [ ] After each review, check the reviewer account still works.

### Step 6. Build the apps
A developer can do this in about an hour once accounts exist. Two ways:

**Option A: your own Mac (for iOS) and any computer (for Android).**
1. Install Node.js 22, Xcode 26 (Mac App Store) and Android Studio (2025.2 or newer).
2. In the project folder create `.env.production.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the same public values as on Vercel). Nothing secret goes in the app.
3. Run `npm ci`, then `npm run app:sync`.
4. **iOS:** `npm run app:ios` opens Xcode. Select the "App" target → Signing & Capabilities → choose your company team. Set Version (for example 1.0) and Build (1, then +1 every upload). Product → Archive → Distribute App → App Store Connect → Upload. The build appears in TestFlight after processing (10 to 30 minutes).
5. **Android:** `npm run app:android` opens Android Studio. Build → Generate Signed App Bundle → create a new **upload key** (store the key file and passwords safely; losing it is painful). Choose "release". Upload the `.aab` in Play Console → Testing → **Internal testing** → Create release. Before each new upload, raise `versionCode` in `android/app/build.gradle`.

**Option B: Codemagic (no Mac needed; recommended for regular releases).**
1. Sign up at codemagic.io with the GitHub account and add the bloom-app repository.
2. Teams → Integrations: connect **App Store Connect** with an API key (App Store Connect → Users and Access → Integrations → Keys; role "App Manager").
3. Code signing: let Codemagic create the iOS distribution certificate and profile for `com.bloomivfcompanion.app`; upload your Android upload keystore.
4. Environment variables (group "bloom"): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Workflow (Capacitor template): scripts `npm ci`, `npm run app:sync`; iOS: build the `ios/App` Xcode project, publish to TestFlight; Android: `cd android && ./gradlew bundleRelease`, publish to Play "internal" track.
6. Start a build. About 15 to 30 minutes; 500 free Mac minutes a month for individuals, then pay per minute.

### Step 7. Test on real phones (1 to 2 weeks)
- [ ] Install from TestFlight (iPhone) and Play internal testing (Android). Test in English and Arabic: sign up, onboarding, reminders arrive with the app closed (set one 5 minutes ahead), Face ID / fingerprint unlock, back button on Android, Nora answers, log a scan, delete an account, the privacy link opens.
- [ ] Invite a few real patients only after the medication list is theirs (13.5).

### Step 8. Store listing (texts in section 15, privacy answers in section 16)
- [ ] **Screenshots** in English and Arabic **(verify sizes at upload)**:
  - Apple: iPhone 6.9" display, 1320 x 2868 px (or 1290 x 2796), 3 to 10 per language. No iPad needed (iPhone-only app).
  - Google Play: at least 2 phone screenshots (portrait, 1080 x 1920 or larger, 9:16), plus a **feature graphic** 1024 x 500 and the **app icon** 512 x 512.
  - Suggested screens: Home (cycle ring), Nora chat (with the "AI" label visible), Reminders, Check-in, Charts, Privacy Centre. Use the reviewer account, never real patient data.
- [ ] Apple: App Privacy answers (16.1), age rating questionnaire (answer "Medical/Treatment Information: frequent/intense"; expect 17+ **(verify)**), category **Medical** (secondary Health & Fitness), privacy policy URL `https://bloomivfcompanion.com/privacy`, support URL `https://bloomivfcompanion.com/support`, export compliance "standard encryption only".
- [ ] Google: Data safety form (16.2), **Health apps declaration** (reproductive health), target audience 18+, content rating questionnaire, account deletion URL `https://bloomivfcompanion.com/delete-account`, category **Medical**.

### Step 9. Submit
- [ ] Apple: submit version 1.0 for review from App Store Connect. Expect questions about health data and AI; answer with the reviewer notes above.
- [ ] Google: promote the internal test to **Production** (or a closed test first). Health apps can take several days.
- [ ] Keep Vercel, Supabase and the reviewer account up during review.

---

## 15. Store listing drafts

Limits **(verify at upload)**: Apple name 30, subtitle 30, keywords 100, promotional text 170, description 4,000 characters. Google title 30, short description 80, full description 4,000. Every text says Nora is AI and not a doctor (guidelines 1.4.1, 2.3).

### 15.1 English
- **Name:** Bloom: IVF Companion
- **Subtitle (Apple):** Cycle, meds & support for IVF
- **Short description (Google):** IVF companion: reminders, cycle tracking and Nora, an AI guide. Not a doctor.
- **Keywords (Apple):** ivf,fertility,egg retrieval,embryo transfer,injection reminder,two week wait,stimulation,journal
- **Promotional text (Apple):** Dose reminders that work offline, your own scan results in one place, and Nora, an AI companion for the 2 AM questions.
- **Description:**

> IVF asks a lot of you. Bloom holds it in one calm place.
>
> Bloom is a companion app for women going through IVF, from the first injection to the two-week wait and beyond.
>
> REMINDERS YOU CAN COUNT ON
> Dose and appointment reminders are saved on your phone, so they arrive even when Bloom is closed or you are offline. Lock-screen alerts never show medicine names.
>
> YOUR CYCLE, YOUR NUMBERS
> Log your E2 levels and follicle sizes after each scan and see them as clear charts. Check in each day with your mood, symptoms and weight. Share a tidy cycle report with your clinic.
>
> NORA, YOUR AI COMPANION
> Nora is an AI companion who answers questions about IVF in plain language, in English, Arabic or French. She is not a doctor: she never diagnoses or changes your treatment, and she points you to your clinic straight away if something sounds urgent. Nora only uses AI after you allow it.
>
> PRIVATE BY DESIGN
> Face ID or fingerprint lock, a Secret Space journal encrypted on your phone, no ads and no trackers. You choose whether your data syncs to your account, and you can download or delete everything at any time.
>
> SUPPORT FOR YOUR MIND
> Breathing and movement videos, stories for each stage, room for your partner, and gentle support whatever the outcome.
>
> Bloom supports you alongside your clinic. It does not provide medical advice. Always check with your doctor before making medical decisions. In an emergency, contact your clinic or emergency services.

### 15.2 Arabic (العربية)
- **الاسم:** Bloom: رفيقة أطفال الأنابيب (27 حرفًا)
- **العنوان الفرعي (Apple):** تذكيرات ودعم لرحلة الحقن (24 حرفًا)
- **الوصف القصير (Google):** رفيقتكِ في أطفال الأنابيب: تذكيرات ومتابعة الدورة ونورا بالذكاء الاصطناعي.
- **الكلمات المفتاحية (Apple):** أطفال الأنابيب,حقن مجهري,خصوبة,سحب البويضات,إرجاع الأجنة,تذكير الحقن,انتظار الأسبوعين,دعم
- **النص الترويجي (Apple):** تذكيرات بالجرعات تعمل دون اتصال، ونتائج فحوصكِ في مكان واحد، ونورا، رفيقة بالذكاء الاصطناعي لأسئلة منتصف الليل.
- **الوصف:**

> رحلة أطفال الأنابيب تطلب منكِ الكثير. Bloom يجمعها لكِ في مكان واحد هادئ.
>
> Bloom تطبيق يرافق المرأة خلال رحلة أطفال الأنابيب، من أول حقنة إلى انتظار الأسبوعين وما بعده.
>
> تذكيرات تعتمدين عليها
> تُحفظ تذكيرات الجرعات والمواعيد على هاتفكِ، فتصلكِ حتى عندما يكون Bloom مغلقًا أو دون اتصال. تنبيهات شاشة القفل لا تعرض أسماء الأدوية أبدًا.
>
> دورتكِ وأرقامكِ
> سجّلي مستويات E2 وأحجام البصيلات بعد كل فحص وشاهديها في رسوم بيانية واضحة. سجّلي مزاجكِ وأعراضكِ ووزنكِ يوميًا، وشاركي تقرير دورة مرتبًا مع عيادتكِ.
>
> نورا، رفيقتكِ بالذكاء الاصطناعي
> نورا رفيقة بالذكاء الاصطناعي تجيب عن أسئلتكِ حول أطفال الأنابيب بلغة بسيطة، بالعربية أو الإنجليزية أو الفرنسية. نورا ليست طبيبة: لا تشخّص ولا تغيّر علاجكِ، وتوجّهكِ فورًا إلى عيادتكِ إذا بدا الأمر عاجلًا. لا تستخدم نورا الذكاء الاصطناعي إلا بعد موافقتكِ.
>
> خصوصيتكِ أولًا
> قفل بـ Face ID أو البصمة، ومساحة سرية مشفّرة على هاتفكِ، دون إعلانات أو أدوات تتبّع. أنتِ من تختارين مزامنة بياناتكِ مع حسابكِ، ويمكنكِ تنزيل كل شيء أو حذفه في أي وقت.
>
> دعم لنفسيتكِ
> فيديوهات للتنفس والحركة، وقصص لكل مرحلة، ومساحة لشريككِ، ودعم لطيف مهما كانت النتيجة.
>
> يدعمكِ Bloom إلى جانب عيادتكِ ولا يقدّم نصيحة طبية. استشيري طبيبكِ دائمًا قبل اتخاذ أي قرار طبي. في حالة الطوارئ، تواصلي مع عيادتكِ أو خدمات الطوارئ.

Arabic listing text needs a native-speaker review before upload.

---

## 16. Privacy answers for the stores (draft, confirm with the lawyer)

Based on the data inventory (`architecture.md` section 6) and the privacy policy draft. Bloom has **no ads, no analytics SDKs and no tracking**. Answers assume cloud accounts are on (they are for the store app).

### 16.1 Apple App Privacy ("nutrition label")
Tracking: **No**, Bloom does not track users across other companies' apps or websites.

| Data type (Apple's list) | Collected? | Linked to her? | Used for tracking? | Purpose |
|---|---|---|---|---|
| Health & Fitness → **Health** (cycle, symptoms, weight, scans, doses) | Yes | Yes | No | App Functionality |
| Contact Info → **Name** | Yes | Yes | No | App Functionality |
| Contact Info → **Email Address** | Yes | Yes | No | App Functionality |
| User Content → **Other User Content** (check-in notes, Nora chats; Secret Space is encrypted and unreadable to Bloom) | Yes | Yes | No | App Functionality |
| Identifiers → **User ID** (account id) | Yes | Yes | No | App Functionality |
| Location, Contacts, Photos, Browsing, Search, Purchases, Financial, Usage Data, Diagnostics, Sensitive Info | No | | | |

Notes: Face ID / fingerprint data never reaches Bloom (not collected). Data kept only on the device is not "collected" in Apple's sense. Nora's AI provider processes messages on Bloom's behalf (disclosed in the policy; Apple 5.1.2(i) is covered by the in-app AI consent).

### 16.2 Google Play Data safety
- Does the app collect or share user data? **Yes, collects.**
- Is all data encrypted in transit? **Yes.**
- Can users request deletion? **Yes** (in the app and at bloomivfcompanion.com/delete-account).
- Shared with third parties? **No.** Supabase, Anthropic and Vercel act as service providers processing on Bloom's behalf, which Google does not count as sharing **(verify wording with the lawyer)**.

| Category → type | Collected | Optional? | Purpose |
|---|---|---|---|
| Personal info → **Name** | Yes | Required (account) | App functionality, Account management |
| Personal info → **Email address** | Yes | Required | App functionality, Account management |
| Personal info → **User IDs** | Yes | Required | Account management |
| Health and fitness → **Health info** | Yes | Optional (only synced with her cloud consent) | App functionality |
| Messages → **Other in-app messages** (Nora chats) | Yes | Optional (AI consent / cloud consent) | App functionality |
| App activity, Location, Financial, Photos, Audio, Files, Calendar, Contacts, Web browsing, Device IDs, App info and performance | No | | |

Also in Play Console → App content: **Health apps** declaration (reproductive / fertility health), **Target audience** 18+, **Ads**: no ads, **Government app**: no, **Financial features**: none.
