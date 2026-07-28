-- ==========================================================================
-- ZENITH STORE — INSTALLATION SUPABASE (à exécuter UNE SEULE FOIS)
-- Copie tout ce fichier, colle-le dans Supabase > SQL Editor > New query,
-- puis clique sur "Run".
-- ==========================================================================

-- ---------- Table des produits ----------
create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null,
  price numeric not null default 0,
  category text not null default 'software',
  in_stock boolean not null default true,
  badge text,
  icon text default 'fa-solid fa-box',
  image text,
  created_at timestamptz default now()
);

-- ---------- Table des réglages du site (une seule ligne, id = 1) ----------
create table if not exists site_settings (
  id int primary key default 1,
  site_name text default 'Zenith Store',
  hero_eyebrow text default 'Livraison rapide',
  hero_title text default 'Bienvenue sur Zenith Store',
  hero_subtitle text default 'Des comptes premium et services numériques à prix avantageux.',
  discord_link text default 'https://discord.gg/qD3sqM8ufa',
  violet text default '#7c5cff',
  pink text default '#ff6f9c',
  amber text default '#ffb26b',
  bg text default '#05060c',
  stat_sold numeric default 14382,
  stat_clients numeric default 3927,
  stat_delivery numeric default 24,
  stat_uptime numeric default 99.9,
  constraint single_row check (id = 1)
);

-- ---------- Données de départ ----------
insert into site_settings (id) values (1)
  on conflict (id) do nothing;

insert into products (name, description, price, category, in_stock, badge, icon)
values
  ('Template Dashboard Pro', 'Pack de composants UI premium pour créer des tableaux de bord modernes.', 12.99, 'software', true, 'new', 'fa-solid fa-chart-line'),
  ('Pack Presets Lightroom', '40 presets professionnels pour sublimer vos photos en un clic.', 6.5, 'software', true, 'promo', 'fa-solid fa-camera-retro'),
  ('VPN Secure+ (1 an)', 'Licence officielle 1 an, navigation chiffrée sur tous vos appareils.', 24.99, 'vpn', true, null, 'fa-solid fa-shield-halved'),
  ('Kit Icônes Vectorielles', 'Plus de 2000 icônes SVG modifiables pour vos projets web.', 9.0, 'software', false, null, 'fa-solid fa-shapes'),
  ('Formation Motion Design', 'Cours vidéo complet, de débutant à avancé, avec fichiers sources.', 34.99, 'software', true, 'new', 'fa-solid fa-graduation-cap'),
  ('Espace Cloud Pro 500 Go', 'Compte de stockage cloud sécurisé avec synchronisation multi-appareils.', 15.0, 'accounts', true, null, 'fa-solid fa-cloud')
on conflict do nothing;

-- ---------- Sécurité : active les règles d'accès (RLS) ----------
alter table products enable row level security;
alter table site_settings enable row level security;

-- Tout le monde (visiteurs) peut LIRE
create policy "Public read products" on products for select using (true);
create policy "Public read settings" on site_settings for select using (true);

-- Seul un compte connecté (= toi, le staff) peut ÉCRIRE
create policy "Staff write products" on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Staff write settings" on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ==========================================================================
-- ⚠️ ÉTAPE MANUELLE OBLIGATOIRE APRÈS AVOIR EXÉCUTÉ CE SCRIPT :
-- Authentication > Providers > Email > désactive "Allow new users to sign up"
-- Sinon n'importe qui pourrait créer un compte et obtenir les droits staff.
-- Puis : Authentication > Users > Add user > crée TON compte staff
-- (ton e-mail + un mot de passe fort). C'est ce compte qui te connectera
-- au panneau Staff du site.
-- ==========================================================================
