# Changelog

## 0.4.0 — October 3, 2026

- Added native Android food-barcode scanning and community label lookup with serving review.
- Added account-scoped photo/meal drafts and recovery after closing or reloading.
- Materialized selected photo bytes immediately to avoid expired file references during draft storage.
- Stored meals on device before upload; kept stable retry IDs after ambiguous responses.
- Added visible sync state, saved-meal search, body-weight history and entry averages.
- Added password recovery UI, safe auth-callback routing and page-error recovery.
- Added photo-transfer retries, visible native status and an in-app notice for newer APKs.
- Updated offline assets to cache version 4 and migrated old settings with empty weight history.
- Added regression coverage for drafts, durable saves, label units, servings and native barcode delivery.

Validation: production web build, TypeScript, Android Metro export, mocked regression suites, synthetic browser flows, public-provider checks and original APK signing-certificate comparison. Physical Android camera/barcode/notifications/sharing and authenticated cloud operations remain to be verified.

## 0.3.0

Offline journal, private storage, reviewed photo estimates, recipes/favourites, weekly comparisons, exports, privacy controls, local reminders and native photo bridge.
