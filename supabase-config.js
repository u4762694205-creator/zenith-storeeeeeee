/* ==========================================================================
   CONNEXION SUPABASE
   -------------------------------------------------------------------------
   Remplace les deux valeurs ci-dessous par celles de TON projet Supabase :
   Project Settings (icône ⚙️) > API > "Project URL" et "anon public" key.

   La clé "anon public" est PRÉVUE pour être visible publiquement dans le
   code du site — ce n'est pas un secret. La vraie sécurité est assurée par
   les règles RLS (Row Level Security) définies dans supabase_setup.sql :
   tout le monde peut LIRE, seul ton compte staff connecté peut ÉCRIRE.
   ========================================================================== */

const SUPABASE_URL = "https://dolqsmviidmdfbymmljb.supabase.co";
const SUPABASE_ANON_KEY = "TA_CLE_ANON_PUBLIC";

const supabaseClient = (SUPABASE_URL.includes("TON-PROJET"))
  ? null // pas encore configuré
  : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
