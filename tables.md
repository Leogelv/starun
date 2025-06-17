create extension if not exists "pgcrypto";

create table if not exists tg_users (
id            uuid        primary key default gen_random_uuid(),
telegram_id   bigint      not null unique,
username      text,
first_name    text,
last_name     text,
photo_url     text,
created_at    timestamptz not null default now(),
updated_at    timestamptz not null default now()
);