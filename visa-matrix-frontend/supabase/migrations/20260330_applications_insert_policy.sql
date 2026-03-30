drop policy if exists applications_select_authenticated on public.applications;
create policy applications_select_authenticated
on public.applications
for select
to authenticated
using (true);

drop policy if exists applications_insert_authenticated on public.applications;
create policy applications_insert_authenticated
on public.applications
for insert
to authenticated
with check (created_by = auth.uid());
