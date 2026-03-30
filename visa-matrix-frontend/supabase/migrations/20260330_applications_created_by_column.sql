alter table public.applications
  add column if not exists created_by uuid references public.users(id);
