# Fuel

A meal journal for the web and Android, with photo-based nutrition estimates, private Supabase storage, offline meal logging and daily summaries. All four source releases are published.

## Run locally

Use Node 22.13 or newer. Run npm ci in web and android, configure web/.env.example locally, and follow web/README.md for the Supabase migrations. Start the website with npm run dev from web. See android/README.md for Android setup.

## Verify

After installing both projects' dependencies, run node tests/run.cjs from the repository root. These checks cover photo delivery and duplicate suppression, Android permission/cancellation feedback and origin validation, account isolation, retry-safe meal saves, deletion safeguards and logout behavior. Authentication, storage and device APIs are mocked; no account or credentials are required. Run npm run typecheck in web and npx tsc --noEmit in android for source checks.

Physical Android camera/gallery and notification validation remains necessary. Photo nutrition values are estimates and require portion confirmation. Credentials, user data, signing keys and APKs are excluded from this repository.
