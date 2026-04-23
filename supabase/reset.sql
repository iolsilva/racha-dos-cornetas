begin;

do $$
begin
  if to_regclass('public.matches') is not null then
    execute 'drop trigger if exists create_match_teams_after_match on public.matches';
    execute 'drop trigger if exists stamp_match_created_by on public.matches';
  end if;

  if to_regclass('public.payments') is not null then
    execute 'drop trigger if exists stamp_payment_recorded_by on public.payments';
  end if;

  if to_regclass('public.expenses') is not null then
    execute 'drop trigger if exists stamp_expense_created_by on public.expenses';
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'drop trigger if exists set_profiles_updated_at on public.profiles';
  end if;

  if to_regclass('public.players') is not null then
    execute 'drop trigger if exists set_players_updated_at on public.players';
  end if;

  begin
    execute 'drop trigger if exists on_auth_user_created on auth.users';
  exception
    when undefined_table then
      null;
  end;
end
$$;

drop view if exists public.team_result_stats cascade;
drop view if exists public.player_pairing_stats cascade;
drop view if exists public.match_team_assignments cascade;
drop view if exists public.attendance_overview cascade;
drop view if exists public.player_rankings_current_year cascade;

drop table if exists public.rankings cascade;
drop table if exists public.expenses cascade;
drop table if exists public.payments cascade;
drop table if exists public.attendance cascade;
drop table if exists public.match_players cascade;
drop table if exists public.match_teams cascade;
drop table if exists public.matches cascade;
drop table if exists public.players cascade;
drop table if exists public.profiles cascade;

do $$
begin
  begin execute 'drop function if exists public.get_player_home_snapshot() cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.get_financial_summary(date) cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.finalize_match_result(uuid, integer, integer) cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.refresh_rankings(integer) cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.assign_player_to_team(uuid, uuid, public.team_color, boolean, boolean, smallint) cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.stamp_created_by() cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.ensure_default_match_teams() cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.current_month_fee(date) cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.player_belongs_to_me(uuid) cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.current_player_id() cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.is_admin() cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.handle_new_user() cascade'; exception when others then null; end;
  begin execute 'drop function if exists public.set_updated_at() cascade'; exception when others then null; end;
end
$$;

do $$
begin
  begin execute 'drop type if exists public.expense_category cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.payment_type cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.attendance_status cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.team_color cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.match_status cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.position_type cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.player_type cascade'; exception when others then null; end;
  begin execute 'drop type if exists public.app_role cascade'; exception when others then null; end;
end
$$;

commit;
