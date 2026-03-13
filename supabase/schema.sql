create extension if not exists pgcrypto;

create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  market_name text not null,
  stall_name text not null,
  stall_no text,
  contact_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  product_name text not null,
  product_type text,
  created_at timestamptz not null default now()
);

create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  ingredient_name text not null,
  origin text,
  supplier_name text,
  supplier_address text,
  created_at timestamptz not null default now()
);
