# Sahayak – AI Government Document Assistant

React + Vite implementation of the supplied bilingual Sahayak prototype. It includes:

- Citizen and officer routes with guarded access.
- English/Hindi navigation and service definitions.
- Document upload limits, consent, extraction confirmation and application review.
- Local demo persistence so the app works without credentials.
- Supabase schema with profiles, applications, events, services and RLS.
- Claude vision Edge Function for production document extraction.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Without Supabase environment variables, use the local demo mode. Citizen registration works directly; the demo officer is `officer@gov.in` / `gov123`.

## Supabase setup

1. Create a Supabase project and run `supabase/schema.sql`.
2. Create a private `documents` Storage bucket and add policies appropriate to your deployment.
3. Set `ANTHROPIC_API_KEY` and deploy `supabase/functions/extract-document`.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then build with `npm run build`.

The portal is an assistance service, not an official government website. Do not store full Aadhaar numbers; the production schema stores only the last four digits.
