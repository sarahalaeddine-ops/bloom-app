# Bloom on the App Store and Google Play (Capacitor plan)

Owned by **sa6**. Status: **plan only.** Nothing here is installed or built yet. Every package below needs the founder's approval first (section 7). Guideline quotes were checked on 2026-09-27 against the sources in section 12. Items marked **(verify)** come from sources that could not be opened from this environment and must be re-checked before submission.

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

## 7. Packages (all need founder approval, none installed)

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
1. Approve Capacitor and the v1 packages (section 7); pick one biometric plugin after a short spike.
2. App store Nora policy: live Nora only for signed-in accounts (recommended), and `NORA_REQUIRE_AUTH` in production.
3. Bloom+ on iOS: build in-app purchase, or hide it for v1 (recommended).
4. HealthKit / Health Connect in v1 or phase 2 (recommended: phase 2).
5. Budget: Apple US$99/year, Google US$25, Codemagic minutes, a Mac if needed.
6. Company details for enrolment (legal entity, D-U-N-S, who is Account Holder).
7. UAE data residency before a UAE store launch with cloud mode.

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
