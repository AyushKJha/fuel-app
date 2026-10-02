# Fuel 0.3 — web journal

Responsive charcoal/lime meal journal: https://fuel-journal.vercel.app. Hosted on Vercel Hobby, with Supabase login, owner-only database policies and private photo storage. No service-role or AI secret is shipped to the browser or APK.

## Configure and run

Use Node 22.13 or newer: npm ci, npm run dev, npm run build. Copy .env.example to .env.local and supply your own values. Initialize a new database with supabase.sql, then apply supabase-upgrade.sql. The existing deployed project has both migrations.

## Included

- Server-side photo estimates, portion multipliers, corrected foods, extra ingredients and a review gate before saving.
- Recent meals, favourites, recipes, editable repeats, monthly history, daily summaries and weekly comparisons.
- Account-scoped IndexedDB journal and photo outbox. Offline meals sync with stable UUIDs after reconnecting; conflicting or cross-account writes are rejected. AI analysis, goals and recipe changes require internet.
- Cached offline shell; open the account online on this device first. Logout removes the active device journal and pending meals, so sync or export first.
- Native Android camera/photo bridge, version/update information and JSON/CSV sharing; normal downloads on the website.
- Photo retention choice, individual meal deletion, stored-photo deletion and password-confirmed account deletion. Exports omit photos. Public privacy details: /privacy.
- Android local reminders scheduled up to 30 days ahead and renewed when Fuel opens. Today's reminder can show the latest recorded totals; later reminders ask you to open the summary. Android power settings can delay delivery. Website reminders require the website to remain open.
- Optional rough activity equivalents, without instructions to compensate for food.

## Estimates and privacy

Gemini uses a server-only GEMINI_API_KEY. Free billing is used; quotas and provider outages can interrupt analysis. Photos and supplied meal details go to Google; free-tier submissions may be reviewed and used to improve its products. Avoid personal or sensitive information. Unsupported micronutrients remain unknown. Photos cannot measure hidden oils or exact serving weight; measured recipes and labels improve accuracy.

## Validation

Production builds and TypeScript passed. Tests exercise account-scoped offline storage, Blob photo queues, idempotent retries, CSV injection protection, settings migration, authentication/origin guards and cross-account sync rejection. Synthetic local UI fixtures verified file selection, automatic analysis flow, doubled portions, review-before-save, recipe/repeat controls and phone navigation without overflow at 390×844. Fixtures do not establish AI accuracy.

Native picker/reminder mocks passed; physical Android testing remains necessary. No temporary Supabase account was created for this upgrade, as the user declined it. Authenticated cloud writes/deletions were not exercised for this upgrade. Existing real-photo analysis checks passed on the earlier version, but estimates remain approximate. No personal meal data was used. Original Sites data has not been automatically transferred.
