# Paystub Generator — OWeb satellite

This app runs on **One OS** Supabase (`ebjzdcnphkfpxfldnatm`) with domain data in the **`paystub`** Postgres schema.

## Environment (Vercel / local)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://auth.oweb.one` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | One OS anon key |
| `NEXT_PUBLIC_PAYSTUB_DB_SCHEMA` | `paystub` |
| `NEXT_PUBLIC_OWEB_URL` | `https://oweb.one` |

Auth uses storage key `ao-supabase-auth` (see `utils/supabase/auth-options.ts`).

## OneID

- App id: `paystub` (`lib/oweb/config.ts`)
- After sign-in or SSO, the app calls `POST /api/oweb/activate` (app + workspace activation + `paystub.profiles` upsert).
- **Continue with OWeb:** `oweb.one/login?launch=paystub` → App Store mint → `/sso?launch_token=…` (see `SATELLITE_AUTH_RETURN.md` on OWeb).

## Server env

| Variable | Purpose |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Redeem `ao_ecosystem_launch_tokens` in `POST /api/oweb/sso` |

## OWeb App Store

Register in OWeb `src/lib/ecosystem-apps.ts` with `launchUrl` pointing at this Vercel deployment (see companion PR on `MasterSoler/OWeb`).

## Database

Apply migrations under `supabase/migrations/` to One OS, and ensure **`paystub`** is listed under Supabase **Project Settings → API → Exposed schemas** (same pattern as `schedulingpoll`, `corpus`, etc.).
