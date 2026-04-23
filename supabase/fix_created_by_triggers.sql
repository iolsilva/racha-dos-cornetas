begin;

drop trigger if exists stamp_match_created_by on public.matches;
drop trigger if exists stamp_expense_created_by on public.expenses;
drop function if exists public.stamp_created_by();

create or replace function public.stamp_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

create trigger stamp_match_created_by
before insert on public.matches
for each row
execute function public.stamp_created_by();

create trigger stamp_expense_created_by
before insert on public.expenses
for each row
execute function public.stamp_created_by();

commit;
