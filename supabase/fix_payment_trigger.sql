begin;

drop trigger if exists stamp_payment_recorded_by on public.payments;
drop function if exists public.stamp_recorded_by();

create or replace function public.stamp_recorded_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.recorded_by is null then
    new.recorded_by = auth.uid();
  end if;
  return new;
end;
$$;

create trigger stamp_payment_recorded_by
before insert on public.payments
for each row
execute function public.stamp_recorded_by();

commit;
