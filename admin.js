/* ==========================================================================
   ZENITH STORE — ADMIN.JS (panneau Staff, connecté à Supabase)
   -------------------------------------------------------------------------
   Authentification RÉELLE (Supabase Auth : mots de passe chiffrés, session
   sécurisée). Les droits d'écriture sont vérifiés côté SERVEUR par les
   règles RLS (supabase_setup.sql) — impossible à contourner depuis le
   navigateur. Toute modification est instantanément visible par tous les
   visiteurs (base de données partagée + abonnement temps réel côté site).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  if (!DataLayer.ready()) return; // le message de configuration est déjà affiché par app.js

  let staffProducts = [];
  let staffSettings = null;
  let editingProductId = null;

  /* ---------------------------------------------------------------------
     CONNEXION STAFF (Supabase Auth)
     --------------------------------------------------------------------- */
  const staffLink = document.getElementById('staffLink');
  const staffGateOverlay = document.getElementById('staffGateOverlay');
  const staffGateClose = document.getElementById('staffGateClose');
  const staffGateForm = document.getElementById('staffGateForm');
  const staffGateError = document.getElementById('staffGateError');
  const staffPasswordInput = document.getElementById('staffPasswordInput');
  const staffPanel = document.getElementById('staffPanel');
  const staffLogout = document.getElementById('staffLogout');

  // Transforme le champ "mot de passe" du gate en formulaire email + mot de passe réel
  const staffEmailInput = document.createElement('input');
  staffEmailInput.type = 'email';
  staffEmailInput.id = 'staffEmailInput';
  staffEmailInput.placeholder = 'ton-email@exemple.com';
  staffEmailInput.required = true;
  const emailWrap = document.createElement('div');
  emailWrap.className = 'auth-input';
  emailWrap.innerHTML = '<i class="fa-solid fa-envelope"></i>';
  emailWrap.appendChild(staffEmailInput);
  const emailLabel = document.createElement('label');
  emailLabel.className = 'auth-label';
  emailLabel.textContent = 'E-mail staff';
  staffGateForm.insertBefore(emailWrap, staffGateForm.firstChild);
  staffGateForm.insertBefore(emailLabel, emailWrap);

  staffLink.addEventListener('click', async () => {
    const session = await DataLayer.getSession();
    if (session && await DataLayer.isStaff()) { openStaffPanel(); }
    else {
      staffGateOverlay.classList.add('open');
      staffEmailInput.focus();
    }
  });

  staffGateClose.addEventListener('click', () => staffGateOverlay.classList.remove('open'));
  staffGateOverlay.addEventListener('click', (e) => { if (e.target === staffGateOverlay) staffGateOverlay.classList.remove('open'); });

  staffGateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    staffGateError.hidden = true;
    const submitBtn = staffGateForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion...';
    try {
      await DataLayer.staffLogin(staffEmailInput.value.trim(), staffPasswordInput.value);
      const isStaff = await DataLayer.isStaff();
      if (!isStaff) {
        await DataLayer.staffLogout();
        staffGateError.textContent = "Ce compte n'a pas les droits staff.";
        staffGateError.hidden = false;
        return;
      }
      staffGateOverlay.classList.remove('open');
      staffPasswordInput.value = '';
      openStaffPanel();
    } catch (err) {
      staffGateError.textContent = "E-mail ou mot de passe incorrect.";
      staffGateError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Accéder au panneau';
    }
  });

  staffLogout.addEventListener('click', async () => {
    await DataLayer.staffLogout();
    closeStaffPanel();
  });

  async function openStaffPanel() {
    staffPanel.classList.add('open');
    document.body.style.overflow = 'hidden';
    await refreshStaffData();
  }
  function closeStaffPanel() {
    staffPanel.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function refreshStaffData() {
    const [productsRows, settingsRow] = await Promise.all([DataLayer.getProducts(), DataLayer.getSettings()]);
    staffProducts = productsRows.map(mapProductFromDb);
    staffSettings = mapSettingsFromDb(settingsRow);
    renderProductsTable();
    fillThemeForm();
    fillGeneralForm();
  }

  /* ---------------------------------------------------------------------
     ONGLETS
     --------------------------------------------------------------------- */
  document.querySelectorAll('.staff-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.staff-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.staff-view').forEach(v => v.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('view-' + tab.dataset.tab).classList.add('active');
    });
  });

  /* ---------------------------------------------------------------------
     TOAST
     --------------------------------------------------------------------- */
  let toastEl = document.querySelector('.staff-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'staff-toast';
    toastEl.innerHTML = '<i class="fa-solid fa-circle-check"></i><span></span>';
    document.body.appendChild(toastEl);
  }
  function toast(message, isError) {
    toastEl.querySelector('i').className = isError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
    toastEl.querySelector('i').style.color = isError ? 'var(--danger)' : 'var(--success)';
    toastEl.querySelector('span').textContent = message;
    toastEl.classList.add('visible');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => toastEl.classList.remove('visible'), 2600);
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  /* =======================================================================
     ONGLET PRODUITS
     ======================================================================= */
  const staffProductsBody = document.getElementById('staffProductsBody');
  const categoryLabels = { streaming: 'Streaming', vpn: 'VPN', software: 'Logiciels', accounts: 'Comptes' };

  function renderProductsTable() {
    staffProductsBody.innerHTML = '';
    staffProducts.forEach(p => {
      const tr = document.createElement('tr');
      const thumb = p.image ? `<img src="${p.image}" alt="">` : `<i class="${p.icon || 'fa-solid fa-box'}"></i>`;
      const badge = p.badge ? `<span class="staff-badge-pill ${p.badge}">${p.badge === 'new' ? 'Nouveau' : 'Promo'}</span>` : `<span class="staff-badge-pill none">—</span>`;
      tr.innerHTML = `
        <td><div class="staff-thumb">${thumb}</div></td>
        <td>${escapeHTML(p.name)}</td>
        <td>${categoryLabels[p.category] || p.category}</td>
        <td>${Number(p.price).toFixed(2)} €</td>
        <td><button class="staff-stock-toggle ${p.inStock ? 'in' : 'out'}" data-id="${p.id}" data-action="toggle-stock">
              <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span> ${p.inStock ? 'En stock' : 'Rupture'}
            </button></td>
        <td>${badge}</td>
        <td><div class="staff-row-actions">
              <button class="staff-icon-btn" data-id="${p.id}" data-action="edit" aria-label="Modifier"><i class="fa-solid fa-pen"></i></button>
              <button class="staff-icon-btn danger" data-id="${p.id}" data-action="delete" aria-label="Supprimer"><i class="fa-solid fa-trash"></i></button>
            </div></td>`;
      staffProductsBody.appendChild(tr);
    });
  }

  staffProductsBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    const product = staffProducts.find(p => p.id === id);
    if (!product) return;

    if (action === 'toggle-stock') {
      try {
        await DataLayer.updateProduct(id, { in_stock: !product.inStock });
        toast(!product.inStock ? 'Produit remis en stock' : 'Produit marqué en rupture');
      } catch (err) { toast("Erreur : " + err.message, true); }
    } else if (action === 'edit') {
      openProductModal(product);
    } else if (action === 'delete') {
      if (confirm(`Supprimer "${product.name}" ?`)) {
        try { await DataLayer.deleteProduct(id); toast('Produit supprimé'); }
        catch (err) { toast("Erreur : " + err.message, true); }
      }
    }
  });

  /* ---------- Modale produit ---------- */
  const productModalOverlay = document.getElementById('productModalOverlay');
  const productModalClose = document.getElementById('productModalClose');
  const productModalTitle = document.getElementById('productModalTitle');
  const productForm = document.getElementById('productForm');
  const addProductBtn = document.getElementById('addProductBtn');
  const pName = document.getElementById('pName');
  const pDescription = document.getElementById('pDescription');
  const pPrice = document.getElementById('pPrice');
  const pCategory = document.getElementById('pCategory');
  const pIcon = document.getElementById('pIcon');
  const pBadge = document.getElementById('pBadge');
  const pImageUrl = document.getElementById('pImageUrl');
  const pImageFile = document.getElementById('pImageFile');
  const pInStock = document.getElementById('pInStock');
  let pendingImageFile = null;

  function openProductModal(product) {
    pendingImageFile = null;
    if (product) {
      editingProductId = product.id;
      productModalTitle.textContent = 'Modifier le produit';
      pName.value = product.name; pDescription.value = product.description;
      pPrice.value = product.price; pCategory.value = product.category;
      pIcon.value = product.icon || ''; pBadge.value = product.badge || '';
      pImageUrl.value = product.image || '';
      pInStock.checked = product.inStock;
    } else {
      editingProductId = null;
      productModalTitle.textContent = 'Ajouter un produit';
      productForm.reset();
      pIcon.value = 'fa-solid fa-box';
      pInStock.checked = true;
    }
    pImageFile.value = '';
    productModalOverlay.classList.add('open');
  }
  function closeProductModal() { productModalOverlay.classList.remove('open'); }
  addProductBtn.addEventListener('click', () => openProductModal(null));
  productModalClose.addEventListener('click', closeProductModal);
  productModalOverlay.addEventListener('click', (e) => { if (e.target === productModalOverlay) closeProductModal(); });

  pImageFile.addEventListener('change', () => {
    const file = pImageFile.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image trop lourde (limite 5 Mo). Choisis une image plus légère.");
      pImageFile.value = ''; return;
    }
    pendingImageFile = file;
    pImageUrl.value = '';
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.innerHTML;

    try {
      let image = pImageUrl.value.trim() || null;
      if (pendingImageFile) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi de l\'image...';
        image = await DataLayer.uploadProductImage(pendingImageFile);
      } else if (editingProductId && !image) {
        // Aucune nouvelle image fournie en modification : on garde l'actuelle
        const current = staffProducts.find(p => p.id === editingProductId);
        image = current ? current.image : null;
      }

      const productData = mapProductToDb({
        name: pName.value.trim(),
        description: pDescription.value.trim(),
        price: parseFloat(pPrice.value) || 0,
        category: pCategory.value,
        icon: pIcon.value.trim() || 'fa-solid fa-box',
        badge: pBadge.value || null,
        image,
        inStock: pInStock.checked
      });

      if (editingProductId) await DataLayer.updateProduct(editingProductId, productData);
      else await DataLayer.addProduct(productData);
      closeProductModal();
      toast('Produit enregistré — visible par tous les visiteurs');
    } catch (err) {
      toast("Erreur : " + err.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalLabel;
    }
  });

  /* =======================================================================
     ONGLET APPARENCE
     ======================================================================= */
  const colorFields = [['colorViolet', 'colorVioletHex', 'violet'], ['colorPink', 'colorPinkHex', 'pink'], ['colorAmber', 'colorAmberHex', 'amber'], ['colorBg', 'colorBgHex', 'bg']];

  function fillThemeForm() {
    if (!staffSettings) return;
    colorFields.forEach(([colorId, hexId, key]) => {
      document.getElementById(colorId).value = staffSettings.theme[key];
      document.getElementById(hexId).value = staffSettings.theme[key];
    });
  }

  colorFields.forEach(([colorId, hexId, key]) => {
    const colorInput = document.getElementById(colorId);
    const hexInput = document.getElementById(hexId);
    async function applyColor(value) {
      try {
        await DataLayer.updateSettings(mapSettingsToDb(null, { [key]: value }));
      } catch (err) { toast("Erreur : " + err.message, true); }
    }
    colorInput.addEventListener('input', () => { hexInput.value = colorInput.value; applyColor(colorInput.value); });
    hexInput.addEventListener('change', () => {
      const val = hexInput.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) { colorInput.value = val; applyColor(val); }
      else if (staffSettings) { hexInput.value = staffSettings.theme[key]; }
    });
  });

  document.getElementById('resetThemeBtn').addEventListener('click', async () => {
    const defaults = { violet: '#7c5cff', pink: '#ff6f9c', amber: '#ffb26b', bg: '#05060c' };
    try {
      await DataLayer.updateSettings(mapSettingsToDb(null, defaults));
      fillThemeForm();
      toast('Couleurs réinitialisées');
    } catch (err) { toast("Erreur : " + err.message, true); }
  });

  /* =======================================================================
     ONGLET GÉNÉRAL
     ======================================================================= */
  const gSiteName = document.getElementById('gSiteName');
  const gHeroTitle = document.getElementById('gHeroTitle');
  const gHeroSubtitle = document.getElementById('gHeroSubtitle');
  const gHeroEyebrow = document.getElementById('gHeroEyebrow');
  const gDiscordLink = document.getElementById('gDiscordLink');
  const gStatSold = document.getElementById('gStatSold');
  const gStatClients = document.getElementById('gStatClients');
  const gStatDelivery = document.getElementById('gStatDelivery');
  const gStatUptime = document.getElementById('gStatUptime');

  function fillGeneralForm() {
    if (!staffSettings) return;
    gSiteName.value = staffSettings.siteName || '';
    gHeroTitle.value = staffSettings.heroTitle || '';
    gHeroSubtitle.value = staffSettings.heroSubtitle || '';
    gHeroEyebrow.value = staffSettings.heroEyebrow || '';
    gDiscordLink.value = staffSettings.discordLink || '';
    gStatSold.value = staffSettings.statSold || 0;
    gStatClients.value = staffSettings.statClients || 0;
    gStatDelivery.value = staffSettings.statDelivery || 0;
    gStatUptime.value = staffSettings.statUptime || 0;
  }

  document.getElementById('saveGeneralBtn').addEventListener('click', async () => {
    const changes = mapSettingsToDb({
      siteName: gSiteName.value.trim() || 'Zenith Store',
      heroTitle: gHeroTitle.value.trim(),
      heroSubtitle: gHeroSubtitle.value.trim(),
      heroEyebrow: gHeroEyebrow.value.trim(),
      discordLink: gDiscordLink.value.trim(),
      statSold: parseFloat(gStatSold.value) || 0,
      statClients: parseFloat(gStatClients.value) || 0,
      statDelivery: parseFloat(gStatDelivery.value) || 0,
      statUptime: parseFloat(gStatUptime.value) || 0
    }, null);
    try {
      await DataLayer.updateSettings(changes);
      toast('Informations générales enregistrées — visibles par tous les visiteurs');
    } catch (err) { toast("Erreur : " + err.message, true); }
  });

  /* =======================================================================
     ONGLET SAUVEGARDE (mot de passe staff réel, via Supabase Auth)
     ======================================================================= */
  const gStaffPassword = document.getElementById('gStaffPassword');
  if (gStaffPassword) {
    gStaffPassword.placeholder = 'Nouveau mot de passe';
    gStaffPassword.value = '';
    gStaffPassword.type = 'password';
  }
  const savePasswordBtn = document.getElementById('savePasswordBtn');
  if (savePasswordBtn) {
    savePasswordBtn.addEventListener('click', async () => {
      const val = gStaffPassword.value.trim();
      if (val.length < 6) { toast('Le mot de passe doit faire au moins 6 caractères.', true); return; }
      try {
        await DataLayer.changeStaffPassword(val);
        gStaffPassword.value = '';
        toast('Mot de passe staff mis à jour');
      } catch (err) { toast("Erreur : " + err.message, true); }
    });
  }

  // Le bouton "Tout réinitialiser" et l'export/import local n'ont plus de sens
  // avec une vraie base de données partagée : on masque ce bloc.
  const resetAllBtn = document.getElementById('resetAllBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  [resetAllBtn, exportBtn, importInput && importInput.closest('label')].forEach(el => { if (el) el.style.display = 'none'; });

  const staffNotice = document.querySelector('.staff-notice p');
  if (staffNotice) {
    staffNotice.innerHTML = "Tes modifications sont enregistrées <strong>en direct dans la base de données</strong> et visibles immédiatement par tous les visiteurs du site, sur n'importe quel appareil.";
  }

  /* ---------------------------------------------------------------------
     Reste connecté si une session existe déjà (ex. après un rechargement)
     --------------------------------------------------------------------- */
  DataLayer.onAuthChange((session) => {
    if (!session) closeStaffPanel();
  });

});
