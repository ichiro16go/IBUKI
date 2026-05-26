insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'suki-card-photos',
    'suki-card-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Public can read suki card photos'
    ) then
        create policy "Public can read suki card photos"
            on storage.objects
            for select
            to public
            using (bucket_id = 'suki-card-photos');
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Users can upload own suki card photos'
    ) then
        create policy "Users can upload own suki card photos"
            on storage.objects
            for insert
            to authenticated
            with check (
                bucket_id = 'suki-card-photos'
                and (storage.foldername(name))[1] = auth.uid()::text
            );
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
          and policyname = 'Users can update own suki card photos'
    ) then
        create policy "Users can update own suki card photos"
            on storage.objects
            for update
            to authenticated
            using (
                bucket_id = 'suki-card-photos'
                and (storage.foldername(name))[1] = auth.uid()::text
            )
            with check (
                bucket_id = 'suki-card-photos'
                and (storage.foldername(name))[1] = auth.uid()::text
            );
    end if;
end $$;
