
---

## 🆕 Mise à jour : vraie connexion Google/Discord + vraies images produits

### ⚠️ Étape de sécurité obligatoire d'abord
Exécute le fichier **`supabase_setup_v2.sql`** (une seule fois) :
1. Supabase → **Authentication → Users** → clique sur ton compte staff →
   copie son **"User UID"**
2. Ouvre `supabase_setup_v2.sql`, remplace `'TON-UID'` par ton vrai UID
   (garde les guillemets, ex : `'08f1b1ce-f27f-400d-87c8-7e24f68be191'`)
3. Supabase → **SQL Editor** → **New query** → colle tout le contenu → **Run**
4. Supabase → **Authentication → Sign In / Providers → Email** →
   **réactive** "Allow new users to sign up" (les clients doivent pouvoir
   créer un compte maintenant — ce n'est plus un risque : seul ton compte,
   listé dans la nouvelle table `staff_members`, a les droits d'écriture)

### Configurer Google (connexion cliente)
1. Va sur **https://console.cloud.google.com/**
2. Crée un projet (ou utilise un projet existant)
3. Menu ☰ → **APIs & Services** → **OAuth consent screen** → configure-le
   en type "External", remplis le nom de l'appli, ton e-mail → Save
4. **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID** → type **Web application**
5. Dans **"Authorized redirect URIs"**, ajoute :
   `https://fyugbxlhqvdusfdptzvf.supabase.co/auth/v1/callback`
   (remplace par ton URL Supabase si différente)
6. Crée → copie le **Client ID** et le **Client Secret**
7. Supabase → **Authentication → Sign In / Providers** → **Google** →
   active-le → colle Client ID + Client Secret → **Save**

### Configurer Discord (connexion cliente)
1. Va sur **https://discord.com/developers/applications**
2. **New Application** → donne-lui un nom → Create
3. Menu de gauche → **OAuth2** → **General**
4. Dans **"Redirects"**, clique **Add Redirect** et mets :
   `https://fyugbxlhqvdusfdptzvf.supabase.co/auth/v1/callback`
5. Copie le **Client ID** et clique **Reset Secret** pour obtenir le
   **Client Secret**
6. Supabase → **Authentication → Sign In / Providers** → **Discord** →
   active-le → colle Client ID + Client Secret → **Save**

### Vraies images produits
Rien à configurer : le script `supabase_setup_v2.sql` crée automatiquement
l'espace de stockage. Dans le panneau Staff, quand tu ajoutes/modifies un
produit, utilise le champ **"Ou importer une image depuis ton ordinateur"**
— l'image est maintenant vraiment hébergée (jusqu'à 5 Mo), plus besoin de
passer par un lien externe (même si l'option URL reste disponible).

---

## 🔄 Comment mettre à jour le site sans rien casser

**Règle d'or : ne modifie jamais un fichier en supprimant des lignes que tu
ne comprends pas.** Si tu veux juste changer un produit, une couleur ou un
texte → utilise le **panneau Staff** sur le site, pas le code.

Tu n'as besoin de toucher aux fichiers que pour :
- Changer tes identifiants Supabase (`supabase-config.js`)
- Appliquer une mise à jour que je te fournis (nouveau fichier à remplacer)

**Pour republier un fichier modifié sur GitHub Pages :**
1. Va sur ton repository GitHub → clique sur le fichier concerné
2. Icône crayon ✏️ (en haut à droite du contenu) → modifie
3. Descends en bas → **"Commit changes"** (bouton vert)
4. Attends 1-2 minutes, recharge le site en navigation privée (ou Ctrl+Shift+R)

**Avant toute modification de fichier**, tu peux faire une copie de
sauvegarde : sur GitHub, à côté du nom du fichier, clique sur l'historique
(icône horloge) pour voir/récupérer une version précédente à tout moment
— rien n'est jamais perdu définitivement sur GitHub.

**Si quelque chose casse après une modif :**
1. F12 → Console → regarde l'erreur en rouge
2. Envoie-moi une capture, je te dis quoi corriger
3. En dernier recours : sur GitHub, ouvre l'historique du fichier concerné
   (icône horloge à côté du nom du fichier) et reviens à la version d'avant
