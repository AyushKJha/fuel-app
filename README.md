# Fuel

Fuel is a meal journal for Android phones and laptop browsers. Photograph a meal, review the estimated foods and portions, and track nutrition against your goals over time.

**Website:** [fuel-journal.vercel.app](https://fuel-journal.vercel.app)

**Android release:** 0.4.0 · version code 5 · package ID: com.fuelmealjournal.app

## Features

- Camera and gallery input with server-side Gemini nutrition estimates and acknowledged native photo delivery.
- Android barcode scanning and Open Food Facts product lookup with editable serving sizes.
- Portion adjustments, food corrections and extra ingredients such as oils and sauces, with confirmation before saving.
- Daily calorie, protein, carbohydrate and fat totals, with supported micronutrients.
- Goal settings, monthly meal history, weekly comparisons and progress summaries.
- Searchable recent meals, favourites, recipes and editable repeated meals.
- Body-weight history, recorded-entry averages and change over time.
- Private Supabase accounts, owner-scoped meal records and private photo storage.
- Account-scoped offline journal, recoverable photo drafts and meal uploads stored on device before sending.
- Clear device/cloud sync status and stable retries after ambiguous responses.
- Android local reminders, native CSV/JSON sharing, logout and automatic update notices.
- Photo-retention settings, meal/photo deletion and password-confirmed account deletion.
- Dark charcoal and lime interface that adapts to phone and desktop screens.

## How it works

The Android app displays the hosted journal in a React Native WebView and supplies native camera, photo-picker, sharing and notification features. The website provides the journal interface and API routes. Supabase handles authentication, database records and private photo storage. Photo analysis runs on the server using Gemini; the AI key is never bundled into the browser or APK.

A photo produces an estimate, not a measured nutritional result. Users review the identified foods, serving sizes and added ingredients before saving.

## Repository layout

| Path | Contents |
| --- | --- |
| web/ | Next.js website, API routes, offline shell and Supabase SQL migrations |
| android/ | Expo Android app, native photo bridge and local reminders |
| tests/ | Repeatable checks with mocked authentication, storage and device APIs |

More detail: [web documentation](web/README.md) and [Android documentation](android/README.md).

## Local setup

### Requirements

- Node.js 22.13 or newer and npm.
- A Supabase project for authentication, database and storage.
- A Gemini API key for photo analysis.
- An Expo account for cloud Android builds; a phone or Android emulator for device testing.

### Website

Clone this private repository using an account with access:

```sh
git clone https://github.com/AyushKJha/fuel-app.git
cd fuel-app/web
npm ci
```

Copy .env.example to .env.local and fill in:

| Variable | Purpose |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Browser-safe Supabase publishable key |
| GEMINI_API_KEY | Server-only key for photo analysis |

In a new Supabase project, run supabase.sql and then supabase-upgrade.sql using the SQL editor. The migrations create meal/settings tables, owner-scoped access policies, private photo storage and deletion support. Configure Supabase Auth's site URL and allowed redirect URLs for your local and deployed origins, including /auth/callback. Email verification follows your Supabase Auth configuration.

Start development:

```sh
npm run dev
```

Open the local URL printed by Next.js. For a production build:

```sh
npm run build
npm start
```

For Vercel hosting, select web as the project root and configure the same environment variables in Vercel. Keep GEMINI_API_KEY server-only and leave .env.local out of Git.

### Android

From the repository root:

```sh
cd android
npm ci
npx expo start
```

The app currently connects to the deployed Fuel website. For your own deployment, update HOME and ORIGIN in App.tsx together. Before creating a separate Expo project, update app.json's owner and EAS project ID through your own Expo setup.

Create an installable APK:

```sh
npx eas-cli build --platform android --profile preview
```

The production build profile creates a store bundle:

```sh
npx eas-cli build --platform android --profile production
```

For updates to the existing Fuel installation, retain its package ID and signing identity and increase the Android version code. Install the signed update over the existing app. A separate developer's signing key cannot update the original installation. Signing credentials and APKs are intentionally excluded from this repository.

## Checks

Install dependencies in both web and android, then run from the repository root:

```sh
node tests/run.cjs
```

The suites cover photo delivery, duplicate suppression, Android picker/barcode behavior and permissions, bridge origin checks, account isolation, durable offline saves, draft recovery, label serving arithmetic and nutrient units, duplicate-safe meal saves, deletion safeguards and logout success/failure behavior. They use mocks and do not require accounts or credentials.

Check TypeScript separately:

```sh
cd web
npm run typecheck
cd ../android
npx tsc --noEmit
```

## Current limitations

- Real Android camera/gallery behavior, notification delivery and native sharing still need physical-device verification. Passing mocks does not establish device compatibility.
- Authenticated cloud writes and deletions were not exercised during the latest upgrade. The published tests mock those services.
- Photos cannot reliably determine exact serving weights or hidden ingredients. Unsupported micronutrients remain unknown; nutrition estimates require review.
- Photo analysis and barcode lookup need internet and are subject to provider quotas and outages. Community label data must be checked against the package. Free-tier availability is not a guarantee of unlimited usage.
- Offline access requires an earlier online visit on that device. Analysis, goals and recipe changes require internet. Logout clears the active local journal, unfinished draft and pending meals; save, sync or export first.
- Android reminders cover up to 30 days and refresh when the app opens. Future reminders prompt users to open their summary; battery restrictions can delay delivery. Website reminders require the website to stay open.
- Existing data from the original Sites version is not automatically migrated.
- Android development-toolchain dependency advisories remain; review the Android documentation before store publication.

## Privacy and data

Meal records and stored photos are scoped to the signed-in account. Photos and supplied meal details are sent to Google for analysis; free-tier submissions may be reviewed and used for product improvement. Avoid sensitive information in uploads. Disabling Fuel photo retention affects future Fuel storage, not the analysis provider's processing. CSV/JSON exports omit photo files. JSON exports include weight history. Barcode numbers go to Open Food Facts; identity, photos and meal history are not sent for lookup.

Read the published [privacy information](https://fuel-journal.vercel.app/privacy) and [account-deletion instructions](https://fuel-journal.vercel.app/delete-account).

Credentials, user data, signing keys, generated builds and APK files must remain outside Git. This private source repository does not grant a redistribution license; third-party dependencies retain their respective licenses.
