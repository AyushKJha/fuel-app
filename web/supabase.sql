create table if not exists public.meals (
 id uuid primary key, owner uuid not null references auth.users(id) on delete cascade,
 date date not null, payload text not null, photo_key text
);
create index if not exists meals_owner_date on public.meals(owner,date);
create table if not exists public.settings (
 owner uuid primary key references auth.users(id) on delete cascade, payload text not null
);
alter table public.meals enable row level security;
alter table public.settings enable row level security;
create policy "Read own meals" on public.meals for select to authenticated using ((select auth.uid())=owner);
create policy "Insert own meals" on public.meals for insert to authenticated with check ((select auth.uid())=owner);
create policy "Read own settings" on public.settings for select to authenticated using ((select auth.uid())=owner);
create policy "Insert own settings" on public.settings for insert to authenticated with check ((select auth.uid())=owner);
create policy "Update own settings" on public.settings for update to authenticated using ((select auth.uid())=owner) with check ((select auth.uid())=owner);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('meal-photos','meal-photos',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy "Read own photos" on storage.objects for select to authenticated using (bucket_id='meal-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Upload own photos" on storage.objects for insert to authenticated with check (bucket_id='meal-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Remove own photos" on storage.objects for delete to authenticated using (bucket_id='meal-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
grant usage on schema public to authenticated;
grant select,insert on public.meals to authenticated;
grant select,insert,update on public.settings to authenticated;
