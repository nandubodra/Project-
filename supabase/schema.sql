create extension if not exists pgcrypto;

create type public.user_role as enum ('citizen', 'officer');
create type public.application_status as enum ('P', 'I', 'A', 'R');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'citizen',
  name text not null default '',
  mobile text, father text, dob date, gender text, address text, state text,
  aadhaar_last4 text check (aadhaar_last4 is null or aadhaar_last4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.services (
  id text primary key, name text not null, required_documents jsonb not null default '[]', required_fields jsonb not null default '[]',
  fee text, processing_time text, created_at timestamptz not null default now()
);
create table public.applications (
  id uuid primary key default gen_random_uuid(), applicant_id uuid not null references public.profiles(id),
  service_id text not null references public.services(id), status public.application_status not null default 'P',
  stage smallint not null default 0 check (stage between 0 and 3), extracted_fields jsonb not null default '{}',
  documents jsonb not null default '[]', submitted_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.application_events (
  id bigint generated always as identity primary key, application_id uuid not null references public.applications(id) on delete cascade,
  actor_id uuid references public.profiles(id), stage smallint not null, status public.application_status not null,
  note text not null default '', created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
create policy "services are public" on public.services for select using (true);
create policy "users read own profile" on public.profiles for select using (id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'officer'));
create policy "users update own profile" on public.profiles for update using (id = auth.uid());
create policy "citizens create applications" on public.applications for insert with check (applicant_id = auth.uid());
create policy "citizens read own applications" on public.applications for select using (applicant_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'officer'));
create policy "officers update applications" on public.applications for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'officer'));
create policy "application events visible to participants" on public.application_events for select using (exists (select 1 from public.applications a where a.id = application_id and (a.applicant_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'officer'))));
create policy "participants create events" on public.application_events for insert with check (actor_id = auth.uid());

insert into public.services (id,name,required_documents,required_fields,fee,processing_time) values
('pan','PAN Card','["Aadhaar Card","Passport size photo","Date of birth proof","Address proof"]','["Applicant Type","Area Code"]','₹107','15–20 days'),
('voter','Voter ID Card','["Aadhaar Card","Passport size photo","Age proof","Address proof"]','["Assembly Constituency","Relative Name"]','Free','30 days'),
('income','Income Certificate','["Aadhaar Card","Ration Card","Address proof","Income proof"]','["Annual Income (₹)","Occupation"]','₹30','7–15 days'),
('dl','Driving License','["Aadhaar Card","Passport size photo","Age proof","Learner license"]','["Vehicle Class","Blood Group"]','₹200–1000','15–30 days'),
('dob','Date of Birth Certificate','["Hospital birth record","Parent Aadhaar","Address proof"]','["Place of Birth","Mother Name"]','₹20','7 days')
on conflict (id) do nothing;
