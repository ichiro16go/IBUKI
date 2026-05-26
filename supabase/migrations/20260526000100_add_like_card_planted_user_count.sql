alter table public.like_cards
    add column if not exists planted_user_count integer not null default 0;

create or replace function public.increment_like_card_planted_user_count()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    if new.source_encounter_id is null then
        return new;
    end if;

    update public.like_cards as like_card
    set planted_user_count = like_card.planted_user_count + 1
    where like_card.id = new.like_card_id
      and exists (
          select 1
          from public.encounter_cards as encounter_card
          where encounter_card.encounter_id = new.source_encounter_id
            and encounter_card.like_card_id = new.like_card_id
            and encounter_card.to_user_id = new.user_id
            and encounter_card.from_user_id = like_card.user_id
      );

    return new;
end;
$$;

revoke all on function public.increment_like_card_planted_user_count() from public;
revoke all on function public.increment_like_card_planted_user_count() from anon;
revoke all on function public.increment_like_card_planted_user_count() from authenticated;

update public.like_cards as like_card
set planted_user_count = backfill.planted_user_count
from (
    select
        planter_item.like_card_id,
        count(distinct planter_item.user_id)::integer as planted_user_count
    from public.planter_items as planter_item
    where planter_item.source_encounter_id is not null
      and exists (
          select 1
          from public.encounter_cards as encounter_card
          join public.like_cards as delivered_card
            on delivered_card.id = encounter_card.like_card_id
          where encounter_card.encounter_id = planter_item.source_encounter_id
            and encounter_card.like_card_id = planter_item.like_card_id
            and encounter_card.to_user_id = planter_item.user_id
            and encounter_card.from_user_id = delivered_card.user_id
      )
    group by planter_item.like_card_id
) as backfill
where like_card.id = backfill.like_card_id;

drop trigger if exists increment_like_card_planted_user_count_on_insert on public.planter_items;

create trigger increment_like_card_planted_user_count_on_insert
after insert on public.planter_items
for each row
execute function public.increment_like_card_planted_user_count();
