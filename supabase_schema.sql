-- Habilita extensão para UUIDs
create extension if not exists "uuid-ossp";

-- Tabela de Configurações de Materiais
create table if not exists materiais (
  id text primary key default uuid_generate_v4(),
  nome text not null,
  preco_por_kg numeric not null default 0,
  cor text not null default '#000000',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Custos Fixos
create table if not exists custos_fixos (
  id text primary key default uuid_generate_v4(),
  descricao text not null,
  valor numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Modelos
create table if not exists modelos (
  id text primary key default uuid_generate_v4(),
  nome text not null,
  consumo_por_material jsonb default '{}'::jsonb, -- Armazena objeto { id_material: consumo }
  mao_obra_por_material jsonb default '{}'::jsonb, -- Armazena objeto { id_material: valor }
  custo_ferro numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela Unificada de Transações (Vendas, Despesas, Retiradas)
create table if not exists transacoes (
  id text primary key default uuid_generate_v4(),
  data timestamp with time zone not null default now(),
  descricao text,
  valor numeric not null default 0,
  tipo text not null check (tipo in ('entrada', 'saida', 'retirada')),
  
  -- Campos específicos de Venda
  modelo_id text references modelos(id),
  material_id text references materiais(id),
  custo_operacao numeric,
  mao_obra numeric,
  margem_excedente numeric,
  tipo_operacao text check (tipo_operacao in ('reforma', 'fabricacao')),
  
  -- Campos específicos de Despesa
  categoria text, -- 'insumos', 'gasolina', 'epis', 'outros'
  
  -- Campos para itens múltiplos (Venda ou Despesa com vários itens)
  itens jsonb default '[]'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- POLÍTICAS DE SEGURANÇA (RLS)
-- Como o app não tem login por enquanto, vamos liberar acesso público (cuidado em produção!)
alter table materiais enable row level security;
alter table custos_fixos enable row level security;
alter table modelos enable row level security;
alter table transacoes enable row level security;

-- Criar policies para permitir tudo para acesso anônimo (com a chave anon do projeto)
create policy "Acesso total a materiais" on materiais for all using (true) with check (true);
create policy "Acesso total a custos_fixos" on custos_fixos for all using (true) with check (true);
create policy "Acesso total a modelos" on modelos for all using (true) with check (true);
create policy "Acesso total a transacoes" on transacoes for all using (true) with check (true);
