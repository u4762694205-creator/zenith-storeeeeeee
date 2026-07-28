/* ==========================================================================
   ZENITH STORE — APP.JS (site public)
   Charge produits + réglages depuis Supabase (base partagée par tout le
   monde) et se met à jour EN DIRECT quand le staff modifie quelque chose,
   grâce à l'abonnement temps réel Supabase.
   ========================================================================== */

let liveSettings = null;
let liveProducts = [];

/* Déclarées ici (avant tout appel) pour éviter l'erreur
   "Cannot access before initialization" au premier chargement. */
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', async () => {

  I18n.init();

  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const noResults = document.getElementById('noResults');

  if (!DataLayer.ready()) {
    showSetupNotice();
    return;
  }

  await loadEverything();
  DataLayer.subscribeToChanges(async () => {
    await loadEverything();
    renderProducts();
  });

  initUI();

  async function loadEverything() {
    const [settingsRow, productsRows] = await Promise.all([DataLayer.getSettings(), DataLayer.getProducts()]);
    liveSettings = mapSettingsFromDb(settingsRow) || fallbackSettings();
    liveProducts = productsRows.map(mapProductFromDb);
    applyTheme(liveSettings.theme);
    applyGeneral(liveSettings);
    applyDiscordLinks(liveSettings.discordLink);
    renderProducts();
  }

  function fallbackSettings() {
    return {
      siteName: 'Zenith Store', heroEyebrow: '', heroTitle: 'Bienvenue sur Zenith Store',
      heroSubtitle: '', discordLink: '#',
      theme: { violet: '#7c5cff', pink: '#ff6f9c', amber: '#ffb26b', bg: '#05060c' },
      statSold: 0, statClients: 0, statDelivery: 0, statUptime: 0
    };
  }

  function applyTheme(theme) {
    const root = document.documentElement.style;
    root.setProperty('--violet', theme.violet);
    root.setProperty('--pink', theme.pink);
    root.setProperty('--amber', theme.amber);
    root.setProperty('--bg', theme.bg);
  }

  function applyGeneral(general) {
    document.title = `${general.siteName} — Produits & services numériques`;
    document.querySelectorAll('#logoText, #logoTextFooter').forEach(el => {
      el.innerHTML = general.siteName.replace(/(\S+)$/, '<span>$1</span>');
    });
    document.getElementById('footerSiteName').textContent = general.siteName;
    document.getElementById('heroEyebrow').textContent = general.heroEyebrow;
    document.getElementById('heroTitle').innerHTML = `Bienvenue sur <span class="gradient-text">${general.siteName}</span>`;
    document.getElementById('heroSubtitle').textContent = general.heroSubtitle;
    document.getElementById('statSold').dataset.target = general.statSold;
    document.getElementById('statClients').dataset.target = general.statClients;
    document.getElementById('statDelivery').dataset.target = general.statDelivery;
    document.getElementById('statUptime').dataset.target = general.statUptime;
  }

  function applyDiscordLinks(link) {
    document.querySelectorAll('.discord-link').forEach(el => el.setAttribute('href', link || '#'));
  }

  function showSetupNotice() {
    document.getElementById('loader').classList.add('hidden');
    const notice = document.createElement('div');
    notice.style.cssText = 'position:fixed;inset:0;z-index:9998;background:#05060c;color:#f1eefc;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;font-family:Poppins,sans-serif;';
    notice.innerHTML = `
      <div style="max-width:480px;">
        <h1 style="font-size:1.4rem;margin-bottom:1rem;">⚙️ Connexion Supabase non configurée</h1>
        <p style="color:#8a87a3;line-height:1.7;">Ouvre <code style="background:#151322;padding:0.2em 0.5em;border-radius:6px;">js/supabase-config.js</code> et renseigne ton URL de projet et ta clé "anon public" (voir le README).</p>
      </div>`;
    document.body.appendChild(notice);
  }

  /* ---------------------------------------------------------------------
     RENDU DES PRODUITS (pas de panier — CTA Discord/ticket)
     --------------------------------------------------------------------- */

  function formatPrice(price) {
    return Number(price).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function createProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card' + (product.inStock ? '' : ' out-of-stock');
    card.style.animationDelay = `${(index % 9) * 0.06}s`;

    const badgeHTML = !product.inStock
      ? `<span class="product-badge badge-outofstock">${I18n.t('stock_out')}</span>`
      : product.badge === 'new' ? `<span class="product-badge badge-new">${I18n.t('badge_new')}</span>`
      : product.badge === 'promo' ? `<span class="product-badge badge-promo">${I18n.t('badge_promo')}</span>`
      : '';
    const mediaHTML = product.image ? `<img src="${product.image}" alt="${escapeHTML(product.name)}">` : `<i class="${product.icon || 'fa-solid fa-box'}"></i>`;
    const stockHTML = product.inStock
      ? `<span class="stock-tag stock-in"><span class="stock-dot"></span>${I18n.t('stock_in')}</span>`
      : `<span class="stock-tag stock-out"><span class="stock-dot"></span>${I18n.t('stock_out')}</span>`;

    card.innerHTML = `
      <div class="product-media">${badgeHTML}${mediaHTML}</div>
      <h3 class="product-name">${escapeHTML(product.name)}</h3>
      <p class="product-desc">${escapeHTML(product.description)}</p>
      <div class="product-footer">
        <span class="product-price">${formatPrice(product.price)}</span>
        ${stockHTML}
      </div>
      <a href="${liveSettings.discordLink}" target="_blank" rel="noopener" class="btn btn-primary product-order" ${product.inStock ? '' : 'aria-disabled="true" onclick="return false;"'}>
        <i class="fa-brands fa-discord"></i> ${product.inStock ? I18n.t('product_order') : I18n.t('product_unavailable')}
      </a>
      ${product.inStock ? `<span class="product-ticket-hint"><i class="fa-solid fa-ticket-simple"></i> ${I18n.current === 'fr' ? 'via un ticket Discord' : 'via a Discord ticket'}</span>` : ''}
    `;
    return card;
  }

  function renderProducts() {
    const search = currentSearch.trim().toLowerCase();
    const filtered = liveProducts.filter(p => {
      const matchesFilter = currentFilter === 'all' || p.category === currentFilter;
      const matchesSearch = !search || p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
      return matchesFilter && matchesSearch;
    });
    productsGrid.innerHTML = '';
    if (filtered.length === 0) { noResults.hidden = false; }
    else { noResults.hidden = true; filtered.forEach((p, i) => productsGrid.appendChild(createProductCard(p, i))); }
  }
  window.__renderProducts = renderProducts;
  window.__getLiveSettings = () => liveSettings;

  /* ---------------------------------------------------------------------
     UI GÉNÉRALE (navbar, langue, animations, FAQ, ciel étoilé, auth client)
     --------------------------------------------------------------------- */
  function initUI() {
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 400));
    setTimeout(() => loader.classList.add('hidden'), 1200);

    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    burger.addEventListener('click', () => { burger.classList.toggle('open'); mobileMenu.classList.toggle('open'); });
    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', () => {
      burger.classList.remove('open'); mobileMenu.classList.remove('open');
    }));
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section[id], .hero');
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(section => navObserver.observe(section));

    /* Langue */
    const langToggle = document.getElementById('langToggle');
    const langMenu = document.getElementById('langMenu');
    const langCurrent = document.getElementById('langCurrent');
    const mobileLang = document.getElementById('mobileLang');
    function buildLangMenus() {
      langMenu.innerHTML = ''; mobileLang.innerHTML = '';
      LANGS.forEach(l => {
        const opt = document.createElement('button');
        opt.className = 'lang-option' + (l.code === I18n.current ? ' active' : '');
        opt.innerHTML = `${l.flag} ${l.label}`;
        opt.addEventListener('click', () => { I18n.set(l.code); langMenu.classList.remove('open'); });
        langMenu.appendChild(opt);
        const mOpt = opt.cloneNode(true);
        mOpt.addEventListener('click', () => I18n.set(l.code));
        mobileLang.appendChild(mOpt);
      });
      langCurrent.textContent = I18n.current.toUpperCase();
    }
    buildLangMenus();
    langToggle.addEventListener('click', (e) => { e.stopPropagation(); langMenu.classList.toggle('open'); });
    document.addEventListener('click', () => langMenu.classList.remove('open'));
    document.addEventListener('langchange', () => { buildLangMenus(); renderProducts(); });

    /* Reveal au scroll */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* Compteurs animés */
    function animateCounter(el) {
      const target = parseFloat(el.dataset.target) || 0;
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600; const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = target * (1 - Math.pow(1 - progress, 3));
        el.textContent = value.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); statsObserver.unobserve(entry.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(el => statsObserver.observe(el));

    /* Recherche + filtres */
    searchInput.addEventListener('input', (e) => { currentSearch = e.target.value; renderProducts(); });
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts();
      });
    });

    /* FAQ */
    document.querySelectorAll('.faq-item').forEach(item => {
      item.querySelector('.faq-question').addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });

    document.getElementById('year').textContent = new Date().getFullYear();

    /* Modale connexion client (interface uniquement, séparée du staff) */
    const authOverlay = document.getElementById('authOverlay');
    const openAuthBtn = document.getElementById('openAuthBtn');
    const openAuthBtnMobile = document.getElementById('openAuthBtnMobile');
    const authClose = document.getElementById('authClose');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmit = document.getElementById('authSubmit');
    const authSwitchText = document.getElementById('authSwitchText');
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    const authTogglePass = document.getElementById('authTogglePass');
    const authPassword = document.getElementById('authPassword');
    let isSignupMode = false;
    function openAuth() { authOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeAuth() { authOverlay.classList.remove('open'); document.body.style.overflow = ''; }
    function setAuthMode(signup) {
      isSignupMode = signup;
      authTitle.setAttribute('data-i18n', signup ? 'auth_signup_title' : 'auth_login_title');
      authSubtitle.setAttribute('data-i18n', signup ? 'auth_signup_subtitle' : 'auth_login_subtitle');
      authSubmit.setAttribute('data-i18n', signup ? 'auth_submit_signup' : 'auth_submit_login');
      authSwitchText.setAttribute('data-i18n', signup ? 'auth_switch_to_login' : 'auth_switch_to_signup');
      authSwitchBtn.setAttribute('data-i18n', signup ? 'auth_switch_to_login_btn' : 'auth_switch_to_signup_btn');
      I18n.apply();
    }
    openAuthBtn.addEventListener('click', () => { setAuthMode(false); openAuth(); });
    openAuthBtnMobile.addEventListener('click', () => { burger.classList.remove('open'); mobileMenu.classList.remove('open'); setAuthMode(false); openAuth(); });
    authClose.addEventListener('click', closeAuth);
    authOverlay.addEventListener('click', (e) => { if (e.target === authOverlay) closeAuth(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && authOverlay.classList.contains('open')) closeAuth(); });
    authSwitchBtn.addEventListener('click', () => setAuthMode(!isSignupMode));
    authTogglePass.addEventListener('click', () => {
      const isPassword = authPassword.type === 'password';
      authPassword.type = isPassword ? 'text' : 'password';
      authTogglePass.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert(I18n.current === 'fr'
        ? "Interface de connexion cliente prête ✅\n(Séparée de l'espace Staff, qui lui est déjà connecté à une vraie base de données.)"
        : "Customer login UI ready ✅\n(Separate from the Staff area, which is already wired to a real database.)");
      closeAuth();
    });

    /* Ciel étoilé */
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = []; let width, height;
    function resizeCanvas() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    function createStars() {
      const count = Math.min(140, Math.floor((width * height) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3, baseAlpha: Math.random() * 0.5 + 0.25,
        twinkleSpeed: Math.random() * 0.015 + 0.005, phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.04
      }));
    }
    let t = 0;
    function animateStars() {
      t += 1; ctx.clearRect(0, 0, width, height);
      stars.forEach(s => {
        s.y += s.drift; if (s.y > height) s.y = 0; if (s.y < 0) s.y = height;
        const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 238, 252, ${Math.max(0, alpha)})`; ctx.fill();
      });
      requestAnimationFrame(animateStars);
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resizeCanvas(); createStars(); animateStars();
      window.addEventListener('resize', () => { resizeCanvas(); createStars(); });
    }
  }

});
