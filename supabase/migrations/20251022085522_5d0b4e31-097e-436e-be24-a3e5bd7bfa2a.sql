-- Fix search path for update_updated_at_column function
drop function if exists public.update_updated_at_column() cascade;

create or replace function public.update_updated_at_column()
returns trigger 
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Recreate trigger
create trigger update_expenses_updated_at
  before update on public.expenses
  for each row
  execute function public.update_updated_at_column();