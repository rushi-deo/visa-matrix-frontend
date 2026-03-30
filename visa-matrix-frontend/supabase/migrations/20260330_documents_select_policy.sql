alter table if exists public.documents enable row level security;

drop policy if exists "allow read documents" on public.documents;
create policy "allow read documents"
on public.documents
for select
using (true);
