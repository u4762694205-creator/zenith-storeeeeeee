-- ==========================================================================
-- ZENITH STORE — MISE À JOUR V2 (à exécuter une seule fois, en plus du
-- premier script supabase_setup.sql qui doit déjà avoir été exécuté)
-- Colle tout ça dans Supabase > SQL Editor > New query > Run.
-- ==========================================================================

-- ---------- Table des comptes staff ----------
-- Contient uniquement les UID des comptes autorisés à modifier le site.
-- Un client qui crée un compte (Google/Discord/e-mail) n'est PAS staff
-- tant que son UID n'est pas ajouté ici.
create table if not exists staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz default now()
);

alter table staff_members enable row level security;

-- Chacun peut vérifier SON PROPRE statut staff (nécessaire pour que le site
-- sache s'il doit afficher le panneau), mais ne peut pas lister les autres.
create policy "Users can check own staff status" on staff_members
  for select using (auth.uid() = user_id);

-- ⚠️ Remplace TON-UID ci-dessous par ton User UID réel
-- (Supabase > Authentication > Users > clique sur ton compte > "User UID")
insert into staff_members (user_id) values ('84e3106a-6288-498c-8542-9bd6b5878e32')
on conflict do nothing;

-- ---------- Sécurité : on resserre les règles d'écriture ----------
-- Avant : n'importe quel compte connecté pouvait écrire (risqué maintenant
-- que les clients ont aussi de vrais comptes). Après : seul un compte listé
-- dans staff_members peut modifier les produits et réglages.

drop policy if exists "Staff write products" on products;
create policy "Staff write products" on products for all
  using (auth.uid() in (select user_id from staff_members))
  with check (auth.uid() in (select user_id from staff_members));

drop policy if exists "Staff write settings" on site_settings;
create policy "Staff write settings" on site_settings for all
  using (auth.uid() in (select user_id from staff_members))
  with check (auth.uid() in (select user_id from staff_members));

-- ---------- Stockage des images produits (vraies images, pas de limite basse) ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Tout le monde peut voir les images (nécessaire pour qu'elles s'affichent sur le site)
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- Seul le staff peut ajouter/remplacer/supprimer des images
create policy "Staff upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and auth.uid() in (select user_id from staff_members)
  );

create policy "Staff update product images" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and auth.uid() in (select user_id from staff_members)
  );

create policy "Staff delete product images" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and auth.uid() in (select user_id from staff_members)
  );

-- ==========================================================================
-- ⚠️ ÉTAPES MANUELLES APRÈS CE SCRIPT :
--
-- 1. Authentication > Providers > Email > RÉACTIVE "Allow new users to
--    sign up" (les clients doivent pouvoir créer un compte maintenant —
--    ce n'est plus un risque grâce à la table staff_members ci-dessus).
--
-- 2. Authentication > Users > clique sur ton compte staff > copie son
--    "User UID" > reviens éditer la ligne "insert into staff_members"
--    plus haut avec ce UID avant de lancer ce script (ou édite-la
--    directement dans Table Editor > staff_members après coup).
--
-- 3. Configure Google et Discord comme fournisseurs de connexion
--    (voir le README pour la procédure complète).
-- ==========================================================================
