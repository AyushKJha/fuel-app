# Fuel Android 2.0.0

Android versionCode 6; package com.fuelmealjournal.app. The update preserves the existing Expo-managed signing identity. Install the signed APK over Fuel; do not uninstall first. Backend: https://fuel-journal.vercel.app.

Native WebView app with Camera / Photos / Barcode controls, JPEG resizing, acknowledged photo transfer, permission guidance, picker feedback, Android pending-result recovery and a legacy system document picker. Photos start server-side Gemini estimates automatically. Review portions, corrections and hidden ingredients before saving; exact macros cannot be established from a photo.

Photo delivery retries until acknowledged, with visible status and a Retry transfer control if the journal misses the result. Barcode scanning uses expo-camera; label lookup and serving review use the website and Open Food Facts.

Includes account-scoped drafts, searchable saved meals, weight history and offline logging/sync, favourites/recipes, weekly progress, privacy controls, native export sharing, version/update information and local Android reminders. AI/cloud changes require internet; the cached journal works after an online visit.

Notification permission is required. Reminders are scheduled up to 30 days and renewed when the app opens. Today's message can include the latest recorded totals; future reminders ask you to open Fuel. Android battery settings can delay delivery. Logout cancels Fuel reminders and clears the active device journal; sync or export pending meals first.

Back closes forms/details, returns other journal views to Today, then returns to welcome; Back on welcome exits. Login replaces its history entry. Logout returns to welcome.

JSON/CSV exports use Android's share sheet. Account deletion requires typed confirmation and the current password. Disabling photo retention affects future Fuel uploads, not Google's analysis. Free-tier Google submissions may be reviewed and used for product improvement. No AI key is shipped in the APK.

## Build and validation

npm ci, npx expo start. APK: npx eas-cli build --platform android --profile preview. The production profile produces a store bundle. Use your own Expo account/project and preserve signing credentials for updates. No Google Play submission was performed.

TypeScript and Android Metro export passed. Native mocks cover camera/gallery, bridge readiness, cancellation, denied permission, origin filtering, Back and reminder scheduling/cleanup. Physical camera, notification delivery and native sharing still need device verification. No temporary Supabase account was created for this upgrade.

Non-breaking audit repairs were applied. The current npm audit reports 24 transitive dependency advisories (8 moderate, 16 high). Expo/xcode/node-forge development tooling was previously affected; the proposed forced fix substantially downgrades Expo and was not applied. Review before store publication. Permissions exclude microphone and broad storage access.

Version 2.0 adds hosted text meal estimation, editable per-food macros, label conversion and quantity scaling. Select Type foods & amounts to calculate nutrition without a photo. Under each analyzed food, apply the package values to update meal totals. The Android package and signing identity are unchanged.
