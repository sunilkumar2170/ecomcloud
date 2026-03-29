create extension if not exists "uuid-ossp";

create table if not exists tenants (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  owner_id   uuid,
  logo_url   text,
  created_at timestamptz default now()
);

create table if not exists users (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  password_hash text not null,
  name          text not null,
  role          text not null default 'store_owner',
  tenant_id     uuid references tenants(id) on delete set null,
  created_at    timestamptz default now()
);

alter table tenants
  add constraint fk_tenant_owner
  foreign key (owner_id) references users(id) on delete set null;

create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  name       text not null,
  created_at timestamptz default now()
);

create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name        text not null,
  description text,
  price       numeric(10,2) not null default 0,
  stock       integer not null default 0,
  image_url   text,
  created_at  timestamptz default now(),
  updated_at  timestamptz
);

create table if not exists orders (
  id                       uuid primary key default uuid_generate_v4(),
  tenant_id                uuid not null references tenants(id) on delete cascade,
  user_id                  uuid references users(id) on delete set null,
  customer_email           text not null,
  status                   text not null default 'pending',
  total                    numeric(10,2) not null default 0,
  stripe_payment_intent_id text,
  line_items               jsonb not null default '[]',
  created_at               timestamptz default now(),
  updated_at               timestamptz
);

create index if not exists idx_products_tenant  on products(tenant_id);
create index if not exists idx_orders_tenant    on orders(tenant_id);
create index if not exists idx_orders_status    on orders(status);
create index if not exists idx_users_tenant     on users(tenant_id);

create or replace function decrement_stock(p_product_id uuid, p_qty integer)
returns void language plpgsql as $$
begin
  update products set stock = greatest(stock - p_qty, 0), updated_at = now() where id = p_product_id;
end;
$$;

insert into users (id, email, password_hash, name, role)
values (uuid_generate_v4(), 'admin@ecomcloud.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Super Admin', 'admin')
on conflict (email) do nothing;
