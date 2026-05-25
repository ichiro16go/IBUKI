create table if not exists public.planter_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users (id) on delete cascade,
    like_card_id uuid not null references public.like_cards (id) on delete cascade,
    source_saved_card_id uuid references public.saved_cards (id) on delete set null,
    source_encounter_id uuid references public.encounters (id) on delete set null,
    planted_at timestamptz not null default timezone('utc', now()),
    created_at timestamptz not null default timezone('utc', now()),
    unique (user_id, like_card_id)
);

create index if not exists planter_items_user_id_planted_at_idx
    on public.planter_items (user_id, planted_at desc);

create index if not exists planter_items_like_card_id_idx
    on public.planter_items (like_card_id);

create table if not exists public.suki_action_logs (
    id uuid primary key default gen_random_uuid(),
    planter_item_id uuid not null references public.planter_items (id) on delete cascade,
    user_id uuid not null references public.users (id) on delete cascade,
    action_type text not null,
    title text not null,
    notes text,
    acted_at timestamptz not null default timezone('utc', now()),
    created_at timestamptz not null default timezone('utc', now()),
    constraint suki_action_logs_title_check check (char_length(title) > 0)
);

create index if not exists suki_action_logs_planter_item_id_acted_at_idx
    on public.suki_action_logs (planter_item_id, acted_at desc);

create index if not exists suki_action_logs_user_id_idx
    on public.suki_action_logs (user_id);

alter table public.planter_items enable row level security;
alter table public.suki_action_logs enable row level security;

create policy "Users can view own planter items"
    on public.planter_items
    for select
    using (user_id = auth.uid());

create policy "Users can insert own planter items"
    on public.planter_items
    for insert
    with check (user_id = auth.uid());

create policy "Users can update own planter items"
    on public.planter_items
    for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Users can delete own planter items"
    on public.planter_items
    for delete
    using (user_id = auth.uid());

create policy "Users can view own suki action logs"
    on public.suki_action_logs
    for select
    using (user_id = auth.uid());

create policy "Users can insert own suki action logs"
    on public.suki_action_logs
    for insert
    with check (
        user_id = auth.uid()
        and exists (
            select 1
            from public.planter_items
            where planter_items.id = planter_item_id
              and planter_items.user_id = auth.uid()
        )
    );

create policy "Users can update own suki action logs"
    on public.suki_action_logs
    for update
    using (user_id = auth.uid())
    with check (
        user_id = auth.uid()
        and exists (
            select 1
            from public.planter_items
            where planter_items.id = planter_item_id
              and planter_items.user_id = auth.uid()
        )
    );

create policy "Users can delete own suki action logs"
    on public.suki_action_logs
    for delete
    using (user_id = auth.uid());