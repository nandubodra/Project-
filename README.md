# Sahayak – AI Government Document Assistant

Sahayak is a bilingual English/Hindi React portal that helps citizens prepare government-service applications from uploaded documents and gives officers a workflow for reviewing and tracking those applications.

> **Important:** Sahayak is an assistance portal, not an official government website. Users must complete final submission through the relevant official government portal.

## Features

### Citizen experience

- Browse available services:
  - PAN Card
  - Voter ID Card
  - Income Certificate
  - Driving License
  - Date of Birth Certificate
- Register and log in as a citizen.
- Maintain a basic profile.
- Upload PDF, JPG, JPEG or PNG documents.
- Enforce a 5 MB limit per uploaded file in the browser.
- Give explicit consent before document reading.
- Review and edit extracted fields before submission.
- Submit an application and receive a tracking ID.
- View application status, timeline, form data and uploaded document metadata.
- Switch between English and Hindi from the navigation bar.

### Government officer experience

- Officer login and protected dashboard.
- View submitted applications.
- Open citizen application details.
- Move applications through verification and review.
- Approve, reject or forward an application.
- Keep an application event history with actor, status, stage, timestamp and note.

### Backend and AI foundation

- Supabase PostgreSQL schema for profiles, services, applications and audit events.
- Row-level security policies for citizens and officers.
- Private Supabase Storage bucket policies for documents.
- Officer action PostgreSQL RPC with server-side role validation.
- Claude vision Edge Function for structured document extraction.
- Local demo mode for running the UI without Supabase credentials.

## Technology

- React 18
- Vite
- React Router
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase Edge Functions
- Anthropic Claude vision API
- `lucide-react` icons

## Project structure

```text
.
├── index.html
├── package.json
├── .env.example
├── src
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   ├── contexts
│   │   ├── AuthContext.jsx
│   │   └── I18nContext.jsx
│   ├── data
│   │   └── services.js
│   └── lib
│       ├── localStore.js
│       └── supabase.js
└── supabase
    ├── schema.sql
    └── functions
        └── extract-document
            └── index.ts
```

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A Supabase project for production backend features
- An Anthropic API key for document extraction

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Local demo mode

The application can run without Supabase environment variables.

### Citizen demo

1. Open `/login`.
2. Select **Citizen**.
3. Use **New user? Register**.
4. Create an account.
5. Open a service and start an application.

In demo mode, the session and submitted application records are stored in browser `localStorage`. They are not shared across browsers or devices.

### Officer demo

```text
Email:    officer@gov.in
Password: gov123
```

The officer dashboard is available at `/dashboard`.

The demo credentials are only for local development. Replace them with Supabase Auth users before deployment.

## Environment variables

Copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These `VITE_` variables are exposed to the browser. The Supabase anonymous key is intended for client-side use and is protected by RLS. Never place service-role keys or Anthropic keys in `.env` variables prefixed with `VITE_`.

The Edge Function requires this server-side secret:

```bash
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Supabase setup

### 1. Create a project

Create a project in the Supabase dashboard, then install and authenticate the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Apply the database schema

Run the complete schema in the Supabase SQL Editor, or use:

```bash
npx supabase db push
```

The schema creates:

| Table | Purpose |
|---|---|
| `profiles` | Citizen and officer profile data |
| `services` | Service names, required documents and fields |
| `applications` | Submitted application data and current status |
| `application_events` | Immutable-style tracking events and officer actions |
| `storage.objects` policies | Private document access rules |

It also creates:

- `citizen` and `officer` role values.
- Application statuses: `P` pending, `I` in process, `A` approved, `R` rejected.
- RLS policies for citizens and officers.
- A private `documents` Storage bucket.
- The `officer_action` RPC for validated officer actions.

### 3. Deploy the extraction function

```bash
npx supabase functions deploy extract-document
npx supabase secrets set ANTHROPIC_API_KEY=your-anthropic-api-key
```

The function accepts:

```json
{
  "fileBase64": "base64-encoded-file",
  "mediaType": "image/jpeg",
  "fields": ["name", "date_of_birth", "address"]
}
```

Supported media types:

- `application/pdf`
- `image/jpeg`
- `image/png`

The function rejects unsupported media types and oversized encoded payloads. It instructs Claude to return JSON, use `null` for missing values and avoid guessing sensitive information.

### 4. Configure the frontend

Set `.env` with the project URL and anonymous key, then restart Vite:

```bash
npm run dev
```

## Application workflow

```text
Choose service
      ↓
Upload documents
      ↓
Give AI-reading consent
      ↓
Extract and confirm fields
      ↓
Review application
      ↓
Submit
      ↓
Officer verification
      ↓
Officer review
      ↓
Approved / Rejected
```

Application stages are:

1. Application Submitted
2. Document Verification
3. Officer Review
4. Final Approval

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Home page and service cards |
| `/about` | Public | Product description |
| `/login` | Public | Citizen/officer login |
| `/service/:id` | Public | Service requirements |
| `/apply/:id` | Citizen | Upload, extraction and confirmation |
| `/applications` | Citizen | Citizen application list |
| `/profile` | Citizen | Citizen profile |
| `/application/:id` | Authenticated | Application details and timeline |
| `/dashboard` | Officer | Officer application dashboard |

## Security and privacy

- Full Aadhaar numbers should not be stored in production.
- The database schema stores only the last four Aadhaar digits.
- Documents are intended for a private Storage bucket.
- Citizens can access only their own applications.
- Officers can review applications through role-based policies.
- Officer actions are validated by the `officer_action` database function.
- Keep the Anthropic API key exclusively in Edge Function secrets.
- Do not trust browser-only role checks; enforce authorization in Supabase RLS and RPC functions.
- Add retention and deletion policies before handling real identity documents.
- Add rate limiting, malware scanning and file-content validation before production launch.
- Use HTTPS in every deployed environment.

## Current demo limitations

The repository includes a complete frontend and production backend foundation, but the default UI intentionally supports local demo mode:

- Without Supabase variables, auth uses local demo state.
- Local demo applications use browser `localStorage`.
- The current browser flow stores uploaded file name, size and type metadata locally rather than uploading binary files to Storage.
- The Claude Edge Function is provided separately and must be wired to the frontend upload/extraction request for a full production AI flow.
- Supabase realtime subscriptions should be added to the dashboard when live cross-user updates are required.
- Email OTP, password reset, profile creation trigger and officer provisioning should be configured in Supabase Auth for production.

## Production checklist

- [ ] Configure Supabase Auth email provider and redirect URLs.
- [ ] Add a profile creation trigger for new users.
- [ ] Provision officers through an admin-only process.
- [ ] Apply `supabase/schema.sql`.
- [ ] Verify RLS policies with citizen and officer test accounts.
- [ ] Create and test the private `documents` bucket.
- [ ] Upload documents to Storage using user-scoped paths.
- [ ] Connect the frontend extraction flow to `extract-document`.
- [ ] Store only extracted fields that are required for the selected service.
- [ ] Add document deletion and retention jobs.
- [ ] Add antivirus/content-type validation and rate limits.
- [ ] Add Supabase Realtime subscriptions for application events.
- [ ] Configure error monitoring and audit-log retention.
- [ ] Replace demo credentials and local fallback before launch.
- [ ] Deploy the frontend to Vercel, Netlify or another HTTPS host.

## Troubleshooting

### The app shows only demo behavior

Check that `.env` exists and contains both:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Restart the Vite server after changing environment variables.

### Supabase requests return permission errors

Confirm that:

1. `supabase/schema.sql` was applied.
2. The signed-in user has a matching `profiles` row.
3. The user role is correct.
4. RLS policies are enabled and have not been replaced by broader policies.

### Extraction fails

Check the Edge Function logs:

```bash
npx supabase functions logs extract-document
```

Also verify that `ANTHROPIC_API_KEY` is configured as a Supabase secret and that the file media type is supported.

## License and disclaimer

This project is a prototype/starting point for a government-assistance workflow. Review legal, accessibility, privacy, security and government-integration requirements before using it with real citizen data.
