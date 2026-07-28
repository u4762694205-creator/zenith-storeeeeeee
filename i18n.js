/* ==========================================================================
   TRADUCTIONS (FR / EN)
   -------------------------------------------------------------------------
   Chaque élément traduisible porte un attribut data-i18n="cle" dans le HTML.
   Pour ajouter une langue : dupliquer le bloc "fr", changer les valeurs,
   puis ajouter le code langue dans la liste LANGS plus bas.
   ========================================================================== */

const translations = {
  fr: {
    nav_home: "Accueil",
    nav_products: "Produits",
    nav_faq: "FAQ",
    nav_discord: "Discord",
    nav_login: "Connexion",

    hero_cta_products: "Voir les produits",
    hero_cta_discord: "Rejoindre le Discord",

    stat_sold: "Produits vendus",
    stat_clients: "Clients satisfaits",
    stat_delivery: "Livraison sous",
    stat_uptime: "Disponibilité",

    why_title: "Pourquoi nous choisir ?",
    why_1_title: "Livraison rapide",
    why_1_text: "Ton accès est préparé et transmis rapidement après ta commande sur Discord.",
    why_2_title: "Support disponible",
    why_2_text: "Une équipe réactive sur Discord pour répondre à toutes tes questions.",
    why_3_title: "Prix avantageux",
    why_3_text: "Des tarifs pensés pour rester accessibles, sans sacrifier la qualité.",
    why_4_title: "Commande simple",
    why_4_text: "Un ticket Discord suffit : pas de compte bancaire à saisir sur le site.",

    products_eyebrow: "Catalogue",
    products_title: "Nos produits",
    products_subtitle: "Parcours la sélection, puis rejoins le Discord pour commander.",
    ticket_banner: "Ce site présente nos produits — la commande et le paiement se font uniquement sur Discord, via un ticket.",
    ticket_banner_cta: "Ouvrir un ticket",
    search_placeholder: "Rechercher un produit...",
    filter_all: "Tous",
    filter_streaming: "Streaming",
    filter_vpn: "VPN",
    filter_software: "Logiciels",
    filter_accounts: "Comptes",
    no_results: "Aucun produit ne correspond à ta recherche.",
    stock_in: "En stock",
    stock_out: "Rupture",
    badge_new: "Nouveau",
    badge_promo: "Promo",
    product_order: "Commander sur Discord",
    product_unavailable: "Indisponible",

    reviews_eyebrow: "Témoignages",
    reviews_title: "Ce que disent nos clients",
    reviews_empty_title: "Pas encore d'avis",
    reviews_empty_text: "Les premiers avis de vrais clients s'afficheront ici dès qu'ils seront disponibles.",
    reviews_empty_cta: "Laisser un avis sur Discord",

    faq_eyebrow: "Questions fréquentes",
    faq_title: "FAQ",
    faq_q1: "Comment recevoir mon produit ?",
    faq_a1: "Rejoins notre Discord et ouvre un ticket dans la catégorie commande : notre équipe s'occupe du reste après validation du paiement.",
    faq_q2: "Quels moyens de paiement acceptez-vous ?",
    faq_a2: "Les moyens de paiement sont indiqués directement dans le ticket Discord au moment de la commande.",
    faq_q3: "Le support est-il disponible ?",
    faq_a3: "Oui, notre équipe est disponible sur Discord tous les jours pour répondre à tes questions.",
    faq_q4: "Puis-je payer directement sur le site ?",
    faq_a4: "Non, ce site sert uniquement à présenter le catalogue. Toute commande et tout paiement se font via un ticket sur notre Discord.",

    footer_tagline: "Produits et services numériques, présentés ici, commandés sur Discord.",
    footer_discord: "Discord",
    footer_contact: "Contact",
    footer_terms: "Conditions d'utilisation",
    footer_privacy: "Politique de confidentialité",
    footer_staff: "Espace Staff",
    footer_rights: "Tous droits réservés.",

    auth_login_title: "Connexion",
    auth_login_subtitle: "Accède à ton compte Zenith Store.",
    auth_signup_title: "Créer un compte",
    auth_signup_subtitle: "Rejoins Zenith Store en quelques secondes.",
    auth_google: "Continuer avec Google",
    auth_discord: "Continuer avec Discord",
    auth_or: "ou",
    auth_email: "Adresse e-mail",
    auth_password: "Mot de passe",
    auth_submit_login: "Se connecter",
    auth_submit_signup: "Créer mon compte",
    auth_switch_to_signup: "Pas encore de compte ?",
    auth_switch_to_signup_btn: "Créer un compte",
    auth_switch_to_login: "Déjà un compte ?",
    auth_switch_to_login_btn: "Se connecter"
  },

  en: {
    nav_home: "Home",
    nav_products: "Products",
    nav_faq: "FAQ",
    nav_discord: "Discord",
    nav_login: "Log in",

    hero_cta_products: "View products",
    hero_cta_discord: "Join Discord",

    stat_sold: "Products sold",
    stat_clients: "Happy customers",
    stat_delivery: "Delivery within",
    stat_uptime: "Uptime",

    why_title: "Why choose us?",
    why_1_title: "Fast delivery",
    why_1_text: "Your access is prepared and sent quickly after your order on Discord.",
    why_2_title: "Support available",
    why_2_text: "A responsive team on Discord to answer all your questions.",
    why_3_title: "Fair prices",
    why_3_text: "Rates designed to stay affordable, without cutting corners on quality.",
    why_4_title: "Simple ordering",
    why_4_text: "Just one Discord ticket — no card details entered on this site.",

    products_eyebrow: "Catalog",
    products_title: "Our products",
    products_subtitle: "Browse the selection, then join Discord to place an order.",
    ticket_banner: "This site showcases our products — ordering and payment happen only on Discord, via a ticket.",
    ticket_banner_cta: "Open a ticket",
    search_placeholder: "Search a product...",
    filter_all: "All",
    filter_streaming: "Streaming",
    filter_vpn: "VPN",
    filter_software: "Software",
    filter_accounts: "Accounts",
    no_results: "No product matches your search.",
    stock_in: "In stock",
    stock_out: "Out of stock",
    badge_new: "New",
    badge_promo: "Deal",
    product_order: "Order on Discord",
    product_unavailable: "Unavailable",

    reviews_eyebrow: "Testimonials",
    reviews_title: "What our customers say",
    reviews_empty_title: "No reviews yet",
    reviews_empty_text: "Real customer reviews will show up here as soon as they come in.",
    reviews_empty_cta: "Leave a review on Discord",

    faq_eyebrow: "Frequently asked questions",
    faq_title: "FAQ",
    faq_q1: "How do I receive my product?",
    faq_a1: "Join our Discord and open a ticket in the order category: our team takes care of the rest once payment is confirmed.",
    faq_q2: "What payment methods do you accept?",
    faq_a2: "Payment methods are shared directly in the Discord ticket when you order.",
    faq_q3: "Is support available?",
    faq_a3: "Yes, our team is available on Discord every day to answer your questions.",
    faq_q4: "Can I pay directly on the site?",
    faq_a4: "No, this site only showcases the catalog. All ordering and payment happens through a ticket on our Discord.",

    footer_tagline: "Digital products and services, showcased here, ordered on Discord.",
    footer_discord: "Discord",
    footer_contact: "Contact",
    footer_terms: "Terms of service",
    footer_privacy: "Privacy policy",
    footer_staff: "Staff area",
    footer_rights: "All rights reserved.",

    auth_login_title: "Log in",
    auth_login_subtitle: "Access your Zenith Store account.",
    auth_signup_title: "Create an account",
    auth_signup_subtitle: "Join Zenith Store in a few seconds.",
    auth_google: "Continue with Google",
    auth_discord: "Continue with Discord",
    auth_or: "or",
    auth_email: "Email address",
    auth_password: "Password",
    auth_submit_login: "Log in",
    auth_submit_signup: "Create my account",
    auth_switch_to_signup: "Don't have an account?",
    auth_switch_to_signup_btn: "Create an account",
    auth_switch_to_login: "Already have an account?",
    auth_switch_to_login_btn: "Log in"
  }
};

const LANGS = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" }
];

const I18N_STORAGE_KEY = "zenithStoreLang";

const I18n = {
  current: "fr",

  init() {
    const saved = localStorage.getItem(I18N_STORAGE_KEY);
    const browserLang = navigator.language ? navigator.language.slice(0, 2) : "fr";
    this.current = saved || (translations[browserLang] ? browserLang : "fr");
    this.apply();
  },

  set(lang) {
    if (!translations[lang]) return;
    this.current = lang;
    localStorage.setItem(I18N_STORAGE_KEY, lang);
    this.apply();
  },

  t(key) {
    return (translations[this.current] && translations[this.current][key]) || key;
  },

  apply() {
    document.documentElement.setAttribute("lang", this.current);
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", this.t(key));
    });
    document.dispatchEvent(new CustomEvent("langchange"));
  }
};
