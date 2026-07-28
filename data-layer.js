/* ==========================================================================
   COUCHE DE DONNÉES — SUPABASE
   -------------------------------------------------------------------------
   Remplace l'ancien système localStorage. Toutes les données viennent
   maintenant d'une vraie base de données partagée par tous les visiteurs.
   La sécurité (qui a le droit de lire/écrire) est appliquée côté serveur
   par les règles RLS définies dans supabase_setup.sql, pas ici.
   ========================================================================== */

const DataLayer = {

  ready() {
    return !!supabaseClient;
  },

  async getProducts() {
    const { data, error } = await supabaseClient.from('products').select('*').order('id');
    if (error) { console.error(error); return []; }
    return data;
  },

  async getSettings() {
    const { data, error } = await supabaseClient.from('site_settings').select('*').eq('id', 1).single();
    if (error) { console.error(error); return null; }
    return data;
  },

  /* ---------- Écriture (nécessite d'être connecté en staff, vérifié côté serveur) ---------- */
  async addProduct(product) {
    const { data, error } = await supabaseClient.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  },
  async updateProduct(id, changes) {
    const { data, error } = await supabaseClient.from('products').update(changes).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteProduct(id) {
    const { error } = await supabaseClient.from('products').delete().eq('id', id);
    if (error) throw error;
  },
  async updateSettings(changes) {
    const { data, error } = await supabaseClient.from('site_settings').update(changes).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  },

  /* ---------- Temps réel : notifie quand la base change ---------- */
  subscribeToChanges(callback) {
    return supabaseClient
      .channel('public-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, callback)
      .subscribe();
  },

  /* ---------- Auth staff (réel, géré par Supabase) ---------- */
  async staffLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async staffLogout() {
    await supabaseClient.auth.signOut();
  },
  async getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  },
  onAuthChange(callback) {
    supabaseClient.auth.onAuthStateChange((_event, session) => callback(session));
  },
  async changeStaffPassword(newPassword) {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  /* ---------- Distingue un compte staff d'un compte client classique ---------- */
  async isStaff() {
    const session = await this.getSession();
    if (!session) return false;
    const { data, error } = await supabaseClient
      .from('staff_members')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) { console.error(error); return false; }
    return !!data;
  },

  /* ---------- Connexion cliente (vrais comptes : e-mail, Google, Discord) ---------- */
  async customerSignUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  async customerSignIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signInWithProvider(provider) {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) throw error;
    return data;
  },

  /* ---------- Upload d'une vraie image produit (Supabase Storage) ---------- */
  async uploadProductImage(file) {
    const ext = file.name.split('.').pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabaseClient.storage.from('product-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;
    const { data } = supabaseClient.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  }
};

/* ---------- Adapte les noms de colonnes (snake_case en base) vers le format utilisé par le front (camelCase) ---------- */
function mapSettingsFromDb(row) {
  if (!row) return null;
  return {
    siteName: row.site_name,
    heroEyebrow: row.hero_eyebrow,
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    discordLink: row.discord_link,
    theme: { violet: row.violet, pink: row.pink, amber: row.amber, bg: row.bg },
    statSold: row.stat_sold,
    statClients: row.stat_clients,
    statDelivery: row.stat_delivery,
    statUptime: row.stat_uptime
  };
}
function mapSettingsToDb(general, theme) {
  const out = {};
  if (general) {
    if (general.siteName !== undefined) out.site_name = general.siteName;
    if (general.heroEyebrow !== undefined) out.hero_eyebrow = general.heroEyebrow;
    if (general.heroTitle !== undefined) out.hero_title = general.heroTitle;
    if (general.heroSubtitle !== undefined) out.hero_subtitle = general.heroSubtitle;
    if (general.discordLink !== undefined) out.discord_link = general.discordLink;
    if (general.statSold !== undefined) out.stat_sold = general.statSold;
    if (general.statClients !== undefined) out.stat_clients = general.statClients;
    if (general.statDelivery !== undefined) out.stat_delivery = general.statDelivery;
    if (general.statUptime !== undefined) out.stat_uptime = general.statUptime;
  }
  if (theme) {
    if (theme.violet !== undefined) out.violet = theme.violet;
    if (theme.pink !== undefined) out.pink = theme.pink;
    if (theme.amber !== undefined) out.amber = theme.amber;
    if (theme.bg !== undefined) out.bg = theme.bg;
  }
  return out;
}
function mapProductFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    inStock: row.in_stock,
    badge: row.badge,
    icon: row.icon,
    image: row.image
  };
}
function mapProductToDb(product) {
  const out = {};
  if (product.name !== undefined) out.name = product.name;
  if (product.description !== undefined) out.description = product.description;
  if (product.price !== undefined) out.price = product.price;
  if (product.category !== undefined) out.category = product.category;
  if (product.inStock !== undefined) out.in_stock = product.inStock;
  if (product.badge !== undefined) out.badge = product.badge;
  if (product.icon !== undefined) out.icon = product.icon;
  if (product.image !== undefined) out.image = product.image;
  return out;
}
