-- Apply once to the existing Fuel project. No existing meals are changed.
drop policy if exists "Update own meals" on public.meals;
create policy "Update own meals" on public.meals for update to authenticated using ((select auth.uid())=owner) with check ((select auth.uid())=owner);
drop policy if exists "Delete own meals" on public.meals;
create policy "Delete own meals" on public.meals for delete to authenticated using ((select auth.uid())=owner);
grant update,delete on public.meals to authenticated;
create or replace function public.delete_my_fuel_account() returns void
language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid := auth.uid();
begin
 if current_user_id is null then raise exception 'Authentication required'; end if;
 delete from auth.users where id=current_user_id;
end; $$;
revoke all on function public.delete_my_fuel_account() from public,anon;
grant execute on function public.delete_my_fuel_account() to authenticated;
