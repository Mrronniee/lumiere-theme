/**
 * LUMIERE — Theme Shopify Mode
 * Wishlist, Quick View, Markets, panier AJAX, recherche predictive
 */

(function () {
  'use strict';

  const strings = window.themeStrings || {};
  const routes = window.routes || {};

  // ============================================
  // UTILITAIRES
  // ============================================
  const utils = {
    debounce(fn, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    /**
     * Formate un montant en centimes avec le money_format de la boutique.
     * Ne suppose aucune locale : c'est Shopify qui fournit le gabarit.
     */
    formatMoney(cents) {
      const format = window.themeMoneyFormat || '${{amount}}';
      if (typeof cents === 'string') cents = cents.replace('.', '');

      const placeholder = /\{\{\s*(\w+)\s*\}\}/;
      const value = Number(cents) || 0;

      function group(number, precision, thousands, decimal) {
        const fixed = (number / 100.0).toFixed(precision);
        const parts = fixed.split('.');
        const int = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
        const dec = parts[1] ? decimal + parts[1] : '';
        return int + dec;
      }

      const match = format.match(placeholder);
      if (!match) return format;

      let formatted;
      switch (match[1]) {
        case 'amount':
          formatted = group(value, 2, ',', '.');
          break;
        case 'amount_no_decimals':
          formatted = group(value, 0, ',', '.');
          break;
        case 'amount_with_comma_separator':
          formatted = group(value, 2, '.', ',');
          break;
        case 'amount_with_space_separator':
          formatted = group(value, 2, ' ', ',');
          break;
        case 'amount_no_decimals_with_comma_separator':
          formatted = group(value, 0, '.', ',');
          break;
        case 'amount_no_decimals_with_space_separator':
          formatted = group(value, 0, ' ', '');
          break;
        default:
          formatted = group(value, 2, ',', '.');
      }
      return format.replace(placeholder, formatted);
    },

    /** Remplace [token] dans une chaine traduite. */
    interpolate(str, token, value) {
      return (str || '').replace('[' + token + ']', value);
    },

    /**
     * Recupere une ou plusieurs sections rendues par Shopify.
     * C'est ce qui permet de re-rendre le panier apres une mutation AJAX.
     */
    async fetchSections(sectionNames) {
      const url = `${window.location.pathname}?sections=${sectionNames.join(',')}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Section rendering failed: ${response.status}`);
      return response.json();
    },

    /**
     * Piege le focus dans un conteneur ouvert (drawer, modale).
     *
     * Le piege est pose au niveau du document (phase de capture) et non sur le
     * conteneur : un overlay tiers insere apres le drawer dans le DOM (banniere
     * de consentement Shopify, widget de chat, barre d'apercu) reste sinon dans
     * l'ordre de tabulation et le focus s'en echappe des la premiere touche Tab.
     * Un garde `focusin` rattrape en plus tout focus pose hors du dialogue,
     * quelle qu'en soit l'origine (clic, script tiers, autofocus).
     */
    trapFocus(container, firstFocus) {
      // Une reouverture ne doit pas empiler un second piege sur le premier.
      utils.releaseFocus(container);
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

      /**
       * Elements reellement atteignables : rendus, non caches, non retires de
       * l'ordre de tabulation, et hors sous-arbre aria-hidden (le voile/scrim
       * n'est de toute facon pas dans le conteneur).
       */
      const focusable = () =>
        Array.from(container.querySelectorAll(selector)).filter((el) => {
          if (el.getClientRects().length === 0) return false;
          if (el.hasAttribute('hidden') || el.hasAttribute('disabled')) return false;
          if (el.getAttribute('aria-hidden') === 'true') return false;
          if (el.tabIndex < 0) return false;
          if (el.closest('[aria-hidden="true"]') && el.closest('[aria-hidden="true"]') !== container) return false;
          return true;
        });

      const fallback = () => {
        if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1');
        container.focus();
      };

      const keydown = (e) => {
        if (e.key !== 'Tab') return;
        // Conteneur remplace/retire par un re-rendu : le piege n'a plus d'objet.
        if (!container.isConnected) {
          utils.releaseFocus(container);
          return;
        }
        const items = focusable();
        if (!items.length) {
          e.preventDefault();
          fallback();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        // Focus hors du dialogue (overlay tiers, body apres un re-rendu) :
        // on le ramene dans le panneau au lieu de laisser filer la tabulation.
        if (!container.contains(active)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
          return;
        }
        if (e.shiftKey && (active === first || active === container)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      };

      const focusin = (e) => {
        if (!container.isConnected) {
          utils.releaseFocus(container);
          return;
        }
        if (container.contains(e.target)) return;
        const items = focusable();
        if (items.length) items[0].focus();
        else fallback();
      };

      // Capture : on passe avant les gestionnaires des overlays tiers.
      document.addEventListener('keydown', keydown, true);
      document.addEventListener('focusin', focusin, true);
      container._releaseFocusTrap = () => {
        document.removeEventListener('keydown', keydown, true);
        document.removeEventListener('focusin', focusin, true);
      };

      // Deplacement du focus dans le dialogue. Un seul frame ne suffit pas :
      // a t=0 les transitions de visibility heritees ne sont pas encore
      // resolues et l'element n'est pas encore focusable. On reessaie sur
      // quelques frames, puis on se rabat sur le conteneur lui-meme pour que
      // le focus quitte toujours le declencheur.
      let attempts = 0;
      const placeFocus = () => {
        // Deja pose (ou deplace par l'utilisateur) : on ne vole pas le focus.
        if (attempts > 0 && container.contains(document.activeElement)) return;
        const items = focusable();
        const wanted = firstFocus && items.indexOf(firstFocus) !== -1 ? firstFocus : items[0];
        if (wanted) {
          wanted.focus();
          if (container.contains(document.activeElement)) return;
        }
        if (++attempts < 8) {
          requestAnimationFrame(placeFocus);
          return;
        }
        fallback();
      };
      placeFocus();
      requestAnimationFrame(placeFocus);
    },

    releaseFocus(container) {
      if (container && container._releaseFocusTrap) {
        container._releaseFocusTrap();
        delete container._releaseFocusTrap;
      }
    },

    lockScroll(lock) {
      document.body.style.overflow = lock ? 'hidden' : '';
    }
  };

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const Notify = {
    /**
     * La region live est posee par layout/theme.liquid des le chargement.
     * On ne la cree ici qu'en secours (page sans layout, apercu partiel) et,
     * dans ce cas, on differe l'insertion du texte d'un tick : un conteneur
     * aria-live cree et rempli dans le meme tick n'est pas annonce.
     */
    region() {
      let region = document.getElementById('ThemeNotifications');
      if (region) return { region, fresh: false };
      region = document.createElement('div');
      region.id = 'ThemeNotifications';
      region.className = 'theme-notifications';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'false');
      document.body.appendChild(region);
      return { region, fresh: true };
    },

    show(message, type) {
      if (!message) return;
      const { region, fresh } = this.region();
      const note = document.createElement('div');
      note.className = 'theme-notification' + (type === 'error' ? ' theme-notification--error' : '');
      const emit = () => {
        // textContent pose APRES l'insertion du noeud : le lecteur d'ecran voit
        // une mutation de la region deja observee, donc une annonce reelle.
        region.appendChild(note);
        note.textContent = message;
        setTimeout(() => {
          note.classList.add('is-leaving');
          setTimeout(() => note.remove(), 300);
        }, 2600);
      };
      if (fresh) setTimeout(emit, 50);
      else emit();
    }
  };

  // ============================================
  // WISHLIST
  // ============================================
  const Wishlist = {
    STORAGE_KEY: 'lumiere_wishlist',
    items: [],

    init() {
      this.load();
      if (!this.bound) {
        this.bindEvents();
        this.bound = true;
      }
      this.updateUI();
    },

    load() {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        this.items = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this.items = [];
      }
    },

    save() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
      } catch (e) {
        /* quota depasse ou mode prive : on garde l'etat en memoire */
      }
    },

    has(id) {
      return this.items.some((item) => String(item.id) === String(id));
    },

    toggle(id, handle) {
      if (this.has(id)) {
        this.items = this.items.filter((item) => String(item.id) !== String(id));
      } else {
        this.items.push({ id: String(id), handle: handle });
        Notify.show(strings.wishlistAdded);
      }
      this.save();
      this.updateUI();
    },

    clear() {
      this.items = [];
      this.save();
      this.updateUI();
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wishlist-btn]');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          this.toggle(btn.dataset.productId, btn.dataset.productHandle);
          return;
        }
        if (e.target.closest('[data-wishlist-clear]')) {
          if (window.confirm(strings.wishlistClearConfirm)) this.clear();
          return;
        }
        if (e.target.closest('[data-wishlist-share]')) this.share();
      });
    },

    updateUI() {
      document.querySelectorAll('[data-wishlist-btn]').forEach((btn) => {
        const active = this.has(btn.dataset.productId);
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        const label = active ? btn.dataset.labelRemove : btn.dataset.labelAdd;
        if (label) btn.setAttribute('aria-label', label);
      });

      document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
        el.textContent = this.items.length;
        el.hidden = this.items.length === 0;
      });

      document.querySelectorAll('[data-wishlist-count-text]').forEach((el) => {
        const tpl = el.dataset.template || '';
        el.textContent = tpl.replace('[count]', this.items.length);
      });

      const grid = document.querySelector('[data-wishlist-grid]');
      if (!grid) return;

      const empty = document.querySelector('[data-wishlist-empty]');
      const actions = document.querySelector('[data-wishlist-actions]');

      if (this.items.length === 0) {
        grid.hidden = true;
        if (empty) empty.hidden = false;
        if (actions) actions.hidden = true;
      } else {
        grid.hidden = false;
        if (empty) empty.hidden = true;
        if (actions) actions.hidden = false;
        this.render(grid);
      }
    },

    async render(container) {
      const cards = await Promise.all(
        this.items.map(async (item) => {
          try {
            const res = await fetch(`${window.location.origin}/products/${item.handle}?view=card`);
            if (!res.ok) return null;
            const html = await res.text();
            return html;
          } catch (e) {
            return null;
          }
        })
      );
      container.innerHTML = cards.filter(Boolean).join('');
      this.updateUI();
    },

    async share() {
      const text = utils.interpolate(strings.wishlistShareText, 'count', this.items.length);
      const data = { title: strings.wishlistShareTitle, text: text, url: window.location.href };

      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (err) {
          // L'utilisateur a annule le partage : on ne bascule pas sur la copie.
          if (err && err.name === 'AbortError') return;
        }
      }
      this.copy(window.location.href);
    },

    copy(text) {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(() => Notify.show(strings.linkCopied));
    }
  };

  // ============================================
  // PANIER AJAX
  // ============================================
  const Cart = {
    state: { isOpen: false, isUpdating: false },
    lastFocus: null,

    init() {
      this.overlay = document.querySelector('[data-mini-cart-overlay]');
      this.drawer = document.querySelector('[data-mini-cart]');
      if (!this.bound) {
        this.bindEvents();
        this.bound = true;
      }
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const toggle = e.target.closest('[data-cart-toggle]');
        if (toggle) {
          e.preventDefault();
          this.open(toggle);
          return;
        }

        if (e.target.closest('[data-mini-cart-close]') || e.target.closest('[data-mini-cart-overlay]')) {
          this.close();
          return;
        }

        const qtyBtn = e.target.closest('[data-qty-change]');
        if (qtyBtn) {
          e.preventDefault();
          const wrapper = qtyBtn.closest('.mini-cart__item-qty, .cart-items__qty');
          const input = wrapper && wrapper.querySelector('[data-qty-input]');
          if (!input) return;
          const next = parseInt(input.value, 10) + parseInt(qtyBtn.dataset.qtyChange, 10);
          if (next >= 0) {
            input.value = next;
            this.updateItem(qtyBtn.closest('[data-cart-item]'), next);
          }
          return;
        }

        const removeBtn = e.target.closest('[data-remove-item]');
        if (removeBtn) {
          e.preventDefault();
          this.updateItem(removeBtn.closest('[data-cart-item]'), 0);
          return;
        }

        const upsellBtn = e.target.closest('[data-upsell-add]');
        if (upsellBtn) {
          e.preventDefault();
          this.addByVariantId(upsellBtn.dataset.variantId, upsellBtn);
        }
      });

      document.addEventListener('change', (e) => {
        const input = e.target.closest('[data-qty-input]');
        if (!input) return;
        const value = Math.max(0, parseInt(input.value, 10) || 0);
        input.value = value;
        this.updateItem(input.closest('[data-cart-item]'), value);
      });

      // Echap : on se fie a l'etat rendu (classe) plutot qu'au seul drapeau
      // interne, pour fermer meme si le tiroir a ete ouvert autrement.
      document.addEventListener(
        'keydown',
        (e) => {
          if (e.key !== 'Escape' && e.key !== 'Esc') return;
          const drawer = this.drawer || document.querySelector('[data-mini-cart]');
          if (!this.state.isOpen && !drawer?.classList.contains('is-open')) return;
          e.preventDefault();
          this.close();
        },
        true
      );

      document.addEventListener('submit', (e) => {
        const form = e.target.closest('[data-type="add-to-cart-form"]');
        if (form) {
          e.preventDefault();
          this.addItem(form);
        }
      });
    },

    /**
     * Toujours repartir du noeud REELLEMENT dans le document : une reference
     * mise en cache peut avoir ete detachee par un rendu Section Rendering API,
     * et le piege de focus se serait alors arme sur un tiroir fantome.
     * On supprime aussi les doublons eventuels : deux [data-mini-cart] dans le
     * DOM donnent deux dialogues et un ordre de tabulation imprevisible.
     */
    resolveDrawer() {
      const all = document.querySelectorAll('[data-mini-cart]');
      for (let i = 1; i < all.length; i += 1) all[i].remove();
      this.drawer = all[0] || null;
      const overlays = document.querySelectorAll('[data-mini-cart-overlay]');
      for (let i = 1; i < overlays.length; i += 1) overlays[i].remove();
      this.overlay = overlays[0] || null;
      return this.drawer;
    },

    open(trigger) {
      if (!this.resolveDrawer()) return;
      const active = document.activeElement;
      this.lastFocus =
        trigger ||
        (active && active !== document.body && active !== document.documentElement ? active : null) ||
        document.querySelector('[data-cart-toggle]');
      this.state.isOpen = true;
      this.drawer.classList.add('is-open');
      this.drawer.setAttribute('aria-hidden', 'false');
      this.overlay?.classList.add('is-visible');
      utils.lockScroll(true);
      utils.trapFocus(this.drawer, this.drawer.querySelector('[data-mini-cart-close]'));
    },

    close() {
      if (!this.drawer) return;
      this.state.isOpen = false;
      this.drawer.classList.remove('is-open');
      this.drawer.setAttribute('aria-hidden', 'true');
      this.overlay?.classList.remove('is-visible');
      utils.lockScroll(false);
      utils.releaseFocus(this.drawer);
      // Le declencheur peut avoir ete remplace par un re-rendu de section :
      // on retombe alors sur le bouton panier du header.
      const candidate = this.lastFocus;
      const usable =
        candidate &&
        candidate.isConnected &&
        candidate !== document.body &&
        candidate.getClientRects().length > 0 &&
        !candidate.disabled;
      const back = usable ? candidate : document.querySelector('[data-cart-toggle]') || document.querySelector('.header__action--cart');
      back?.focus();
      this.lastFocus = null;
    },

    /** Re-rend le drawer et les compteurs a partir du serveur. */
    async refresh() {
      try {
        const sections = await utils.fetchSections(['mini-cart']);
        const markup = sections['mini-cart'];
        if (markup) {
          const parsed = new DOMParser().parseFromString(markup, 'text/html');
          const fresh = parsed.querySelector('[data-mini-cart]');
          const freshOverlay = parsed.querySelector('[data-mini-cart-overlay]');
          const current = document.querySelector('[data-mini-cart]');
          if (fresh && current) {
            const wasOpen = current.classList.contains('is-open');
            current.innerHTML = fresh.innerHTML;
            if (wasOpen) {
              current.classList.add('is-open');
              current.setAttribute('aria-hidden', 'false');
            }
          }
          if (freshOverlay && this.overlay) this.overlay.className = this.overlay.className;
        }
      } catch (e) {
        console.error('Could not refresh the cart:', e);
      }

      // Compteurs presents hors du drawer (header, page panier)
      try {
        const res = await fetch(`${routes.cart_url || '/cart'}.js`);
        if (res.ok) {
          const cart = await res.json();
          this.updateCounters(cart);
        }
      } catch (e) {
        /* silencieux : l'affichage du drawer fait deja foi */
      }

      this.resolveDrawer();
      // innerHTML a remplace les elements focusables : on rearme le piege.
      if (this.drawer && this.state.isOpen) {
        utils.trapFocus(this.drawer, this.drawer.querySelector('[data-mini-cart-close]'));
      }
      Wishlist.updateUI();
    },

    updateCounters(cart) {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = cart.item_count;
      });
      document.querySelectorAll('[data-cart-count-text]').forEach((el) => {
        el.textContent = `(${cart.item_count})`;
      });
      const total = utils.formatMoney(cart.total_price);
      document.querySelectorAll('[data-cart-subtotal], [data-cart-total]').forEach((el) => {
        el.textContent = total;
      });
    },

    async addItem(form) {
      const submitBtn = form.querySelector('[data-add-to-cart]');
      // Le bouton est desactive pendant la requete : le focus retombe sur
      // <body>. On memorise le declencheur maintenant pour pouvoir lui rendre
      // le focus a la fermeture du tiroir.
      const trigger = submitBtn || form;
      submitBtn?.classList.add('is-loading');
      submitBtn && (submitBtn.disabled = true);

      try {
        const formData = new FormData(form);
        const response = await fetch(routes.cart_add_url || '/cart/add', {
          method: 'POST',
          headers: { Accept: 'application/javascript' },
          body: formData
        });
        const data = await response.json();

        if (!response.ok) {
          Notify.show(data.description || strings.cartAddError, 'error');
          return;
        }

        await this.refresh();
        this.open(trigger);
        Notify.show(strings.cartAdded);
      } catch (error) {
        console.error('Could not add to cart:', error);
        Notify.show(strings.cartError, 'error');
      } finally {
        submitBtn?.classList.remove('is-loading');
        submitBtn && (submitBtn.disabled = false);
      }
    },

    async addByVariantId(variantId, btn) {
      if (!variantId) return;
      btn?.classList.add('is-loading');
      try {
        const response = await fetch(routes.cart_add_url || '/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: Number(variantId), quantity: 1 }] })
        });
        const data = await response.json();
        if (!response.ok) {
          Notify.show(data.description || strings.cartAddError, 'error');
          return;
        }
        await this.refresh();
        Notify.show(strings.cartAdded);
      } catch (error) {
        console.error('Ajout upsell impossible:', error);
        Notify.show(strings.cartError, 'error');
      } finally {
        btn?.classList.remove('is-loading');
      }
    },

    async updateItem(itemEl, quantity) {
      const key = itemEl?.dataset.key;
      const line = itemEl?.dataset.line;
      if (!key && !line) return;
      if (this.state.isUpdating) return;

      this.state.isUpdating = true;
      try {
        const body = key ? { id: key, quantity: quantity } : { line: parseInt(line, 10), quantity: quantity };
        const response = await fetch(routes.cart_change_url || '/cart/change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();

        if (!response.ok) {
          Notify.show(data.description || strings.cartError, 'error');
          return;
        }
        await this.refresh();
      } catch (error) {
        console.error('Could not update the cart:', error);
        Notify.show(strings.cartError, 'error');
      } finally {
        this.state.isUpdating = false;
      }
    }
  };

  // ============================================
  // QUICK VIEW
  // ============================================
  const QuickView = {
    lastFocus: null,

    init() {
      this.modal = document.getElementById('QuickView');
      if (!this.modal) return;
      if (this.bound) return;
      this.bindEvents();
      this.bound = true;
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-quick-view-trigger]');
        if (trigger) {
          e.preventDefault();
          if (trigger.dataset.productHandle) this.open(trigger.dataset.productHandle);
          return;
        }
        if (!this.modal) return;
        if (e.target.closest('[data-quick-view-close]')) this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('is-active')) this.close();
      });

      this.modal.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('[data-qty]');
        if (qtyBtn) {
          const input = this.modal.querySelector('[data-quick-view-qty]');
          const next = parseInt(input.value, 10) + parseInt(qtyBtn.dataset.qty, 10);
          if (next >= 1) input.value = next;
          return;
        }
        if (e.target.closest('[data-quick-view-add]')) this.addToCart();
      });

      this.modal.addEventListener('change', (e) => {
        if (e.target.closest('[data-quick-view-option]')) this.selectVariant();
      });
    },

    async open(handle) {
      try {
        const response = await fetch(`${window.location.origin}/products/${handle}.js`);
        if (!response.ok) throw new Error(response.status);
        const product = await response.json();
        this.product = product;
        this.currentVariant = product.variants.find((v) => v.available) || product.variants[0];

        const $ = (sel) => this.modal.querySelector(sel);
        const image = $('[data-quick-view-image]');
        if (image) {
          if (product.featured_image) {
            image.src = product.featured_image;
            image.alt = product.title;
            image.hidden = false;
          } else {
            image.hidden = true;
          }
        }
        const set = (sel, value) => {
          const el = $(sel);
          if (el) el.textContent = value || '';
        };
        set('[data-quick-view-vendor]', product.vendor);
        set('[data-quick-view-title]', product.title);
        set('[data-quick-view-description]', this.truncate(product.description));

        const link = $('[data-quick-view-link]');
        if (link) link.href = product.url;

        this.renderOptions();
        this.renderVariantState();

        this.lastFocus = document.activeElement;
        this.modal.classList.add('is-active');
        this.modal.setAttribute('aria-hidden', 'false');
        utils.lockScroll(true);
        utils.trapFocus(this.modal, this.modal.querySelector('button[data-quick-view-close]'));
      } catch (error) {
        console.error('Quick view unavailable:', error);
        // Repli : on laisse le client aller sur la fiche produit.
        window.location.href = `${window.location.origin}/products/${handle}`;
      }
    },

    truncate(html) {
      const text = (html || '').replace(/<[^>]*>/g, '');
      return text.length > 200 ? text.slice(0, 200) + '...' : text;
    },

    renderOptions() {
      const container = this.modal.querySelector('[data-quick-view-variants]');
      if (!container) return;
      container.innerHTML = '';
      if (!this.product.options || this.product.variants.length <= 1) return;

      const names = this.product.options.map((o) => (typeof o === 'string' ? o : o.name));
      const valuesFor = (index) => {
        const seen = [];
        this.product.variants.forEach((v) => {
          const val = v.options[index];
          if (val && seen.indexOf(val) === -1) seen.push(val);
        });
        return seen;
      };

      names.forEach((name, i) => {
        const selected = this.currentVariant.options[i];
        const wrapper = document.createElement('div');
        wrapper.className = 'product-variant';
        wrapper.innerHTML = `
          <span class="product-variant__label">${name}</span>
          <div class="product-variant__options" role="radiogroup" aria-label="${name}">
            ${valuesFor(i)
              .map((value, vi) => {
                const id = `qv-opt-${i}-${vi}`;
                return `<div class="product-variant__option">
                  <input type="radio" name="qv-option-${i}" value="${value.replace(/"/g, '&quot;')}"
                    id="${id}" class="product-variant__option-input" data-quick-view-option data-option-index="${i}"
                    ${value === selected ? 'checked' : ''}>
                  <label for="${id}" class="product-variant__option-label">${value}</label>
                </div>`;
              })
              .join('')}
          </div>`;
        container.appendChild(wrapper);
      });
    },

    selectVariant() {
      const chosen = [];
      this.modal.querySelectorAll('[data-quick-view-option]:checked').forEach((input) => {
        chosen[Number(input.dataset.optionIndex)] = input.value;
      });
      const match = this.product.variants.find((v) => v.options.every((opt, i) => opt === chosen[i]));
      if (match) {
        this.currentVariant = match;
        this.renderVariantState();
      }
    },

    renderVariantState() {
      const v = this.currentVariant;
      const $ = (sel) => this.modal.querySelector(sel);

      const price = $('[data-quick-view-price]');
      if (price) price.textContent = utils.formatMoney(v.price);

      const compare = $('[data-quick-view-compare]');
      if (compare) {
        const onSale = v.compare_at_price && v.compare_at_price > v.price;
        compare.textContent = onSale ? utils.formatMoney(v.compare_at_price) : '';
        compare.hidden = !onSale;
      }

      const addBtn = $('[data-quick-view-add]');
      const addText = $('[data-quick-view-add-text]');
      if (addBtn) addBtn.disabled = !v.available;
      if (addText) addText.textContent = v.available ? strings.addToCart : strings.soldOut;
    },

    async addToCart() {
      const addBtn = this.modal.querySelector('[data-quick-view-add]');
      const variantId = this.currentVariant && this.currentVariant.id;
      if (!variantId) return;

      const qtyInput = this.modal.querySelector('[data-quick-view-qty]');
      const quantity = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);

      addBtn?.classList.add('is-loading');
      try {
        const response = await fetch(routes.cart_add_url || '/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: quantity }] })
        });
        const data = await response.json();
        if (!response.ok) {
          Notify.show(data.description || strings.cartAddError, 'error');
          return;
        }
        await Cart.refresh();
        this.close();
        Cart.open();
        Notify.show(strings.cartAdded);
      } catch (error) {
        console.error('Ajout quick view impossible:', error);
        Notify.show(strings.cartError, 'error');
      } finally {
        addBtn?.classList.remove('is-loading');
      }
    },

    close() {
      this.modal.classList.remove('is-active');
      this.modal.setAttribute('aria-hidden', 'true');
      utils.lockScroll(false);
      utils.releaseFocus(this.modal);
      this.lastFocus?.focus();
    }
  };

  // ============================================
  // SHOPIFY MARKETS
  // ============================================
  const Markets = {
    init() {
      if (!this.bound) {
        this.bindEvents();
        this.bound = true;
      }
      this.suggestMarket();
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        const toggle = e.target.closest('.markets-selectors__toggle');
        if (toggle) {
          e.stopPropagation();
          const group = toggle.closest('[data-market-dropdown]');
          const isOpen = group.classList.contains('is-open');
          this.closeAll();
          if (!isOpen) {
            group.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
          }
          return;
        }

        const country = e.target.closest('[data-country-code]');
        if (country) {
          this.submit('country_code', country.dataset.countryCode);
          return;
        }

        const language = e.target.closest('[data-language-code]');
        if (language) {
          e.preventDefault();
          this.submit('language_code', language.dataset.languageCode);
          return;
        }

        if (e.target.closest('[data-market-banner-close]')) {
          document.getElementById('MarketBanner')?.classList.remove('is-visible');
          try {
            sessionStorage.setItem('lumiere_market_banner_dismissed', '1');
          } catch (err) {
            /* mode prive */
          }
          return;
        }

        const switchBtn = e.target.closest('[data-market-banner-switch]');
        if (switchBtn && switchBtn.dataset.detectedCountry) {
          this.submit('country_code', switchBtn.dataset.detectedCountry);
          return;
        }

        this.closeAll();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeAll();
      });
    },

    closeAll() {
      document.querySelectorAll('[data-market-dropdown]').forEach((group) => {
        group.classList.remove('is-open');
        group.querySelector('.markets-selectors__toggle')?.setAttribute('aria-expanded', 'false');
      });
    },

    submit(field, value) {
      const form = document.getElementById('MarketForm');
      if (!form) return;
      const input = form.querySelector(`[data-market-${field.replace('_code', '')}]`);
      if (!input) return;
      input.value = value;
      form.submit();
    },

    /**
     * Suggestion de marche via l'endpoint Shopify, pas de service tiers :
     * aucune IP n'est envoyee en dehors de la boutique.
     */
    /**
     * Nom du pays DANS la locale affichee.
     * L'endpoint Shopify renvoie le nom dans la langue par defaut de la
     * boutique (« Suisse » sur une page anglaise) : on prefere donc les noms
     * rendus par Liquid dans la locale courante, puis Intl.DisplayNames, et en
     * dernier recours seulement le nom renvoye par l'endpoint.
     * @param {string} isoCode - code pays ISO 3166-1 alpha-2
     * @param {string} fallback - nom renvoye par l'endpoint
     * @returns {string}
     */
    localizedCountryName(isoCode, fallback) {
      const code = (isoCode || '').toUpperCase();
      if (!code) return fallback;

      const node = document.querySelector('[data-market-country-names]');
      if (node) {
        try {
          const names = JSON.parse(node.textContent);
          if (names[code]) return names[code];
        } catch (e) {
          /* JSON illisible : on continue avec les replis */
        }
      }

      try {
        const locale = window.themeLocale || document.documentElement.lang;
        const display = new Intl.DisplayNames([locale], { type: 'region' });
        const name = display.of(code);
        if (name && name !== code) return name;
      } catch (e) {
        /* Intl.DisplayNames indisponible */
      }

      return fallback;
    },

    async suggestMarket() {
      const banner = document.getElementById('MarketBanner');
      if (!banner) return;
      try {
        if (sessionStorage.getItem('lumiere_market_banner_dismissed')) return;
      } catch (e) {
        /* mode prive */
      }

      try {
        /*
         * L'endpoint renvoie le nom du pays dans la langue de l'URL appelee.
         * Appele sur window.shopUrl (racine sans prefixe de locale), il repond
         * toujours dans la langue par defaut de la boutique : d'ou « Suisse »
         * sur la page anglaise. On passe donc par routes.root_url, qui porte
         * le prefixe de la locale affichee (/en, /fr...).
         */
        const root = (window.routes && window.routes.root_url) || '/';
        const endpoint = `${root.replace(/\/$/, '')}/browsing_context_suggestions.json`;
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        const suggested = data.detected_values && data.detected_values.country;
        if (!suggested || !suggested.handle) return;

        const detected = String(suggested.handle).toUpperCase();
        const current = document.querySelector('[data-country-code][aria-current="true"]');
        if (current && (current.dataset.countryCode || '').toUpperCase() === detected) return;

        const text = banner.querySelector('[data-market-banner-text]');
        const switchBtn = banner.querySelector('[data-market-banner-switch]');
        if (!text || !switchBtn) return;

        const countryName = this.localizedCountryName(detected, suggested.name);
        text.textContent = utils.interpolate(strings.marketBanner, 'country', countryName);
        switchBtn.dataset.detectedCountry = detected;
        banner.classList.add('is-visible');
      } catch (e) {
        /* suggestion indisponible : on n'affiche rien */
      }
    }
  };

  // ============================================
  // VARIANTES PRODUIT
  // ============================================
  const ProductVariants = {
    init(scope) {
      const section = (scope || document).querySelector('[data-section-type="product"]');
      if (!section) return;
      if (section.dataset.variantsBound === 'true') return;
      section.dataset.variantsBound = 'true';

      const json = section.querySelector('[data-product-json]');
      if (!json) return;

      this.section = section;
      this.product = JSON.parse(json.textContent);
      this.form = section.querySelector('[data-type="add-to-cart-form"]');
      this.variantInput = this.form?.querySelector('[data-product-variant-id]');
      this.currentVariant =
        this.product.variants.find((v) => String(v.id) === String(this.variantInput?.value)) || this.product.variants[0];

      this.bindEvents();
    },

    bindEvents() {
      const section = this.section;

      section.addEventListener('change', (e) => {
        if (e.target.closest('[data-option-value]')) this.onOptionChange();
      });

      section.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('[data-product-qty]');
        if (qtyBtn) {
          const input = section.querySelector('.product-quantity__input');
          const next = parseInt(input.value, 10) + parseInt(qtyBtn.dataset.productQty, 10);
          if (next >= 1) input.value = next;
          return;
        }

        const thumb = e.target.closest('.product-gallery__thumb');
        if (thumb) {
          this.goToSlide(Array.from(section.querySelectorAll('.product-gallery__thumb')).indexOf(thumb));
          return;
        }

        const prev = e.target.closest('.product-gallery__nav-btn--prev');
        const next = e.target.closest('.product-gallery__nav-btn--next');
        if (prev || next) {
          const slides = section.querySelectorAll('.product-gallery__slide');
          const current = Array.from(slides).findIndex((s) => s.classList.contains('is-active'));
          const target = prev
            ? (current - 1 + slides.length) % slides.length
            : (current + 1) % slides.length;
          this.goToSlide(target);
        }
      });
    },

    goToSlide(index) {
      if (index < 0) return;
      const slides = this.section.querySelectorAll('.product-gallery__slide');
      const thumbs = this.section.querySelectorAll('.product-gallery__thumb');
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('is-active', i === index);
        thumb.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    },

    onOptionChange() {
      const chosen = [];
      // Boutons radio OU menus deroulants, selon le reglage du selecteur.
      this.section.querySelectorAll('[data-option-value]').forEach((el) => {
        if (el.tagName === 'SELECT') {
          chosen[Number(el.dataset.optionIndex)] = el.value;
        } else if (el.checked) {
          chosen[Number(el.dataset.optionIndex)] = el.value;
        }
      });

      const variant = this.product.variants.find(
        (v) => v.options.length === chosen.length && v.options.every((opt, i) => opt === chosen[i])
      );
      this.currentVariant = variant || null;
      this.updateVariant(variant);
    },

    updateVariant(variant) {
      const section = this.section;
      const addBtn = section.querySelector('[data-add-to-cart]');
      const addText = section.querySelector('.product-add-to-cart__text');

      if (!variant) {
        if (addBtn) addBtn.disabled = true;
        if (addText) addText.textContent = strings.unavailable;
        return;
      }

      if (this.variantInput) this.variantInput.value = variant.id;

      const url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());

      const amount = section.querySelector('.product-info__price-amount');
      const compare = section.querySelector('.product-info__price-compare');
      const badge = section.querySelector('.product-info__price-badge');
      const onSale = variant.compare_at_price && variant.compare_at_price > variant.price;

      if (amount) {
        amount.textContent = utils.formatMoney(variant.price);
        amount.classList.toggle('product-info__price-amount--sale', !!onSale);
      }
      if (compare) {
        compare.textContent = onSale ? utils.formatMoney(variant.compare_at_price) : '';
        compare.hidden = !onSale;
      }
      if (badge) {
        badge.hidden = !onSale;
        if (onSale) {
          badge.textContent = `-${Math.round((1 - variant.price / variant.compare_at_price) * 100)}%`;
        }
      }

      // Prix a l'unite (obligation UE pour les ventes au poids/volume/longueur).
      // La mesure ne figure pas de facon fiable dans `product | json` : elle est
      // emise par la section dans [data-unit-json].
      const unitWrap = section.querySelector('[data-unit-price]');
      if (unitWrap) {
        if (this.unitData === undefined) {
          const unitJson = section.querySelector('[data-unit-json]');
          try {
            this.unitData = unitJson ? JSON.parse(unitJson.textContent) : null;
          } catch (e) {
            this.unitData = null;
          }
        }
        const u = this.unitData && this.unitData[variant.id];
        const unitText = unitWrap.querySelector('[data-unit-price-text]');
        if (u && u.unit) {
          const ref = u.ref && u.ref !== 1 ? u.ref + ' ' : '';
          if (unitText) unitText.textContent = u.unit + ' / ' + ref + u.measure;
          unitWrap.hidden = false;
        } else {
          unitWrap.hidden = true;
        }
      }

      if (addBtn) addBtn.disabled = !variant.available;
      if (addText) addText.textContent = variant.available ? strings.addToCart : strings.soldOut;

      section.querySelectorAll('[data-option-selected]').forEach((el, i) => {
        el.textContent = variant.options[i];
      });

      const sku = section.querySelector('[data-product-sku]');
      if (sku) {
        sku.textContent = variant.sku || '';
        sku.closest('[data-product-sku-wrapper]')?.toggleAttribute('hidden', !variant.sku);
      }
    }
  };

  // ============================================
  // ZOOM PRODUIT
  // ============================================
  const ProductZoom = {
    init() {
      this.modal = document.getElementById('ProductZoom');
      if (!this.modal || this.bound) return;
      this.bound = true;
      this.image = document.getElementById('ProductZoomImage');

      document.addEventListener('click', (e) => {
        if (e.target.closest('.product-gallery__zoom')) {
          const active = document.querySelector('.product-gallery__slide.is-active img');
          if (active && this.image) {
            this.image.src = active.dataset.zoomSrc || active.src;
            this.image.alt = active.alt || '';
            this.lastFocus = document.activeElement;
            this.modal.classList.add('is-active');
            this.modal.setAttribute('aria-hidden', 'false');
            utils.lockScroll(true);
            utils.trapFocus(this.modal, this.modal.querySelector('.product-zoom__close'));
          }
          return;
        }
        if (e.target.closest('.product-zoom__close') || e.target === this.modal) this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('is-active')) this.close();
      });
    },

    close() {
      this.modal.classList.remove('is-active');
      this.modal.setAttribute('aria-hidden', 'true');
      utils.lockScroll(false);
      utils.releaseFocus(this.modal);
      this.lastFocus?.focus();
    }
  };

  // ============================================
  // FILTRES COLLECTION
  // ============================================
  const CollectionFilters = {
    init(scope) {
      const section = (scope || document).querySelector('[data-section-type="collection"]');
      if (!section || section.dataset.filtersBound === 'true') return;
      section.dataset.filtersBound = 'true';
      this.section = section;

      this.filters = section.querySelector('[data-filters]');
      this.overlay = section.querySelector('[data-filter-overlay]');
      this.productsGrid = section.querySelector('[data-products-grid]');

      section.addEventListener('click', (e) => {
        if (e.target.closest('[data-filter-toggle]')) return this.openFilters();
        if (e.target.closest('[data-filter-close]') || e.target.closest('[data-filter-overlay]')) {
          return this.closeFilters();
        }

        const groupTitle = e.target.closest('[data-filter-toggle-group]');
        if (groupTitle) {
          const group = groupTitle.closest('.collection-filters__group');
          const collapsed = group.classList.toggle('is-collapsed');
          groupTitle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
          return;
        }

        const layoutBtn = e.target.closest('[data-layout]');
        if (layoutBtn) {
          this.section.querySelectorAll('[data-layout]').forEach((b) => {
            b.classList.remove('is-active');
            b.setAttribute('aria-pressed', 'false');
          });
          layoutBtn.classList.add('is-active');
          layoutBtn.setAttribute('aria-pressed', 'true');
          this.productsGrid?.classList.toggle(
            'collection-grid__products--list',
            layoutBtn.dataset.layout === 'list'
          );
        }
      });

      const form = section.querySelector('[data-filter-form]');
      if (form) {
        form.addEventListener(
          'change',
          utils.debounce(() => form.submit(), 400)
        );
      }

      const sort = section.querySelector('[data-sort-select]');
      sort?.addEventListener('change', (e) => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', e.target.value);
        url.searchParams.delete('page');
        window.location.href = url.toString();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.filters?.classList.contains('is-open')) this.closeFilters();
      });
    },

    openFilters() {
      this.filters?.classList.add('is-open');
      this.filters?.setAttribute('aria-hidden', 'false');
      this.overlay?.classList.add('is-visible');
      utils.lockScroll(true);
      if (this.filters) utils.trapFocus(this.filters, this.filters.querySelector('[data-filter-close]'));
    },

    closeFilters() {
      this.filters?.classList.remove('is-open');
      this.filters?.setAttribute('aria-hidden', 'true');
      this.overlay?.classList.remove('is-visible');
      utils.lockScroll(false);
      utils.releaseFocus(this.filters);
    }
  };

  // ============================================
  // RECHERCHE PREDICTIVE (combobox + listbox)
  // ============================================
  /**
   * Amelioration progressive du champ de la superposition de recherche.
   * Sans JavaScript, ou si la recherche predictive est desactivee dans
   * l'editeur (aucun [data-predictive-search] rendu), le formulaire envoie
   * simplement vers /search.
   *
   * Les resultats sont rendus cote Shopify par sections/predictive-search.liquid
   * (Section Rendering API), donc traduits et formates par la boutique.
   * Motif WAI-ARIA : le focus reste dans le champ, l'option active est
   * designee par aria-activedescendant.
   */
  const PredictiveSearch = {
    MIN_CHARS: 2,
    DELAY: 250,

    init() {
      const panel = document.querySelector('[data-predictive-search]');
      const input = document.querySelector('[data-predictive-search-input]');
      if (!panel || !input || !routes.predictive_search_url) return;
      // Deja branche sur ces elements (initAll est rappele par l'editeur).
      if (panel === this.panel && input === this.input) return;

      this.abort();
      this.panel = panel;
      this.input = input;
      this.list = panel.querySelector('[data-predictive-search-list]');
      this.empty = panel.querySelector('[data-predictive-search-empty]');
      this.status = document.querySelector('[data-predictive-search-status]');
      this.cache = new Map();
      this.activeIndex = -1;
      this.lastTerms = '';
      if (!this.list) return;

      const hint = document.getElementById('PredictiveSearchHint');
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-haspopup', 'listbox');
      input.setAttribute('aria-expanded', 'false');
      input.setAttribute('aria-controls', this.list.id);
      input.setAttribute('autocomplete', 'off');
      if (hint) input.setAttribute('aria-describedby', hint.id);

      input.addEventListener('input', () => this.onInput());
      input.addEventListener('keydown', (e) => this.onKeydown(e));
      input.addEventListener('focus', () => this.onFocus());
      input.addEventListener('blur', (e) => {
        if (this.panel.contains(e.relatedTarget)) return;
        this.close();
      });
      // Un clic dans la liste (option, barre de defilement) ne doit pas retirer
      // le focus du champ : sinon le blur ferme la liste avant que le clic
      // n'atteigne le lien.
      panel.addEventListener('mousedown', (e) => e.preventDefault());
    },

    onInput() {
      clearTimeout(this.timer);
      // L'option active correspondait a l'ancien texte : Entree doit maintenant
      // lancer la recherche du nouveau, pas ouvrir un resultat perime.
      this.setActive(-1);
      const terms = this.input.value.trim();
      if (terms.length < this.MIN_CHARS) {
        this.abort();
        this.clear();
        return;
      }
      this.timer = setTimeout(() => this.request(terms), this.DELAY);
    },

    onFocus() {
      // Retour dans le champ (reouverture de la superposition, Tab arriere) :
      // on rouvre la liste si elle correspond toujours au texte saisi.
      if (this.list.children.length && this.input.value.trim() === this.lastTerms) this.open();
    },

    abort() {
      clearTimeout(this.timer);
      if (this.controller) this.controller.abort();
      this.controller = null;
    },

    async request(terms) {
      if (this.cache.has(terms)) {
        this.render(terms, this.cache.get(terms));
        return;
      }
      // Une seule requete a la fois : la precedente est obsolete.
      if (this.controller) this.controller.abort();
      const controller = new AbortController();
      this.controller = controller;

      const url = new URL(routes.predictive_search_url, window.location.origin);
      url.searchParams.set('q', terms);
      url.searchParams.set('section_id', 'predictive-search');
      url.searchParams.set('resources[type]', 'product,collection,page,article');
      url.searchParams.set('resources[limit]', '4');
      url.searchParams.set('resources[limit_scope]', 'each');

      try {
        const response = await fetch(url.toString(), { signal: controller.signal });
        if (!response.ok) throw new Error(`Predictive search failed: ${response.status}`);
        const html = await response.text();
        this.cache.set(terms, html);
        // Le texte a change pendant la requete : ce resultat n'est plus le bon.
        if (this.input.value.trim() !== terms) return;
        this.render(terms, html);
      } catch (error) {
        if (error.name === 'AbortError') return;
        this.clear();
      } finally {
        if (this.controller === controller) this.controller = null;
      }
    },

    render(terms, html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const results = doc.querySelector('[data-predictive-search-results]');
      const source = results && results.querySelector('[data-predictive-search-options]');
      if (!results || !source) {
        this.clear();
        return;
      }

      const nodes = Array.from(source.children).map((node) => document.importNode(node, true));
      this.list.replaceChildren(...nodes);
      this.lastTerms = terms;

      const count = parseInt(results.dataset.count, 10) || 0;
      const status = results.dataset.status || '';
      if (this.empty) {
        this.empty.textContent = count ? '' : status;
        this.empty.hidden = count > 0;
      }

      this.setActive(-1);
      // Superposition fermee entre-temps : on garde les resultats sans les ouvrir.
      if (document.activeElement !== this.input) return;
      this.open();
      this.announce(status);
    },

    options() {
      return this.list ? Array.from(this.list.querySelectorAll('[role="option"]')) : [];
    },

    isOpen() {
      return Boolean(this.panel) && !this.panel.hidden;
    },

    open() {
      if (!this.panel) return;
      this.panel.hidden = false;
      this.input.setAttribute('aria-expanded', 'true');
    },

    close() {
      if (!this.panel) return;
      this.panel.hidden = true;
      this.input.setAttribute('aria-expanded', 'false');
      this.setActive(-1);
    },

    clear() {
      if (!this.list) return;
      this.list.replaceChildren();
      this.lastTerms = '';
      if (this.empty) {
        this.empty.textContent = '';
        this.empty.hidden = true;
      }
      this.close();
      if (this.status) this.status.textContent = '';
    },

    /** Vide puis remplit la region : sans ce temps mort, rien n'est annonce. */
    announce(message) {
      if (!this.status) return;
      this.status.textContent = '';
      window.requestAnimationFrame(() => {
        this.status.textContent = message;
      });
    },

    setActive(index) {
      const options = this.options();
      this.activeIndex = index >= 0 && index < options.length ? index : -1;
      options.forEach((option, i) => {
        const active = i === this.activeIndex;
        option.classList.toggle('is-active', active);
        option.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (this.activeIndex < 0) {
        this.input?.removeAttribute('aria-activedescendant');
        return;
      }
      const current = options[this.activeIndex];
      this.input.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    },

    onKeydown(e) {
      // Saisie en cours dans un IME (accents composes, japonais...) : Entree,
      // Echap et les fleches appartiennent a l'IME, pas a la liste.
      if (e.isComposing || e.keyCode === 229) return;
      const options = this.options();
      // Les fleches ne rouvrent la liste que si elle correspond au texte du
      // champ : Echap, en fermant la superposition, vide le champ de recherche
      // (comportement du navigateur, sans evenement input) et laisse l'ancienne
      // liste en place.
      const current = options.length > 0 && this.input.value.trim() === this.lastTerms;
      switch (e.key) {
        case 'ArrowDown':
          if (!current) return;
          e.preventDefault();
          if (!this.isOpen()) this.open();
          this.setActive(this.activeIndex + 1 >= options.length ? 0 : this.activeIndex + 1);
          break;
        case 'ArrowUp':
          if (!current) return;
          e.preventDefault();
          if (!this.isOpen()) this.open();
          this.setActive(this.activeIndex <= 0 ? options.length - 1 : this.activeIndex - 1);
          break;
        case 'Enter': {
          // Aucune option active : le formulaire classique part vers /search.
          if (!this.isOpen() || this.activeIndex < 0) return;
          const option = options[this.activeIndex];
          if (!option || !option.href) return;
          e.preventDefault();
          window.location.assign(option.href);
          break;
        }
        case 'Escape':
        case 'Esc':
          // Premier Echap : ferme la liste seulement. Le suivant remonte
          // jusqu'au header, qui ferme la superposition comme avant.
          if (!this.isOpen()) return;
          e.preventDefault();
          e.stopPropagation();
          this.close();
          break;
        case 'Tab':
          this.close();
          break;
        default:
          break;
      }
    }
  };

  // ============================================
  // HEADER : menu mobile, recherche, scroll
  // ============================================
  const Header = {
    init() {
      this.el = document.querySelector('.header');
      this.menu = document.querySelector('[data-mobile-menu]');
      this.menuOverlay = document.querySelector('[data-menu-overlay]');
      this.search = document.querySelector('[data-search-overlay]');

      if (!this.bound) {
        this.bindEvents();
        this.bindScroll();
        this.bound = true;
      }
    },

    bindEvents() {
      document.addEventListener('click', (e) => {
        // --- Menu mobile ---
        const menuToggle = e.target.closest('[data-menu-toggle]');
        if (menuToggle) {
          this.menu?.classList.contains('is-open') ? this.closeMenu() : this.openMenu();
          return;
        }
        if (e.target.closest('[data-menu-close]') || e.target.closest('[data-menu-overlay]')) {
          this.closeMenu();
          return;
        }

        const submenuToggle = e.target.closest('[data-submenu-toggle]');
        if (submenuToggle) {
          const expanded = submenuToggle.getAttribute('aria-expanded') === 'true';
          submenuToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          const sublist = document.getElementById(submenuToggle.getAttribute('aria-controls'));
          if (sublist) sublist.hidden = expanded;
          return;
        }

        // --- Recherche ---
        if (e.target.closest('[data-search-toggle]')) {
          this.openSearch();
          return;
        }
        if (e.target.closest('[data-search-close]') || e.target === this.search) {
          this.closeSearch();
          return;
        }

        // --- Sous-menus desktop au clavier ---
        const dropdown = e.target.closest('[data-dropdown-trigger]');
        if (!dropdown) {
          document.querySelectorAll('[data-dropdown-trigger][aria-expanded="true"]').forEach((el) => {
            el.setAttribute('aria-expanded', 'false');
            el.closest('.header__nav-item')?.classList.remove('is-open');
          });
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (this.menu?.classList.contains('is-open')) this.closeMenu();
        if (this.search?.classList.contains('is-active')) this.closeSearch();
      });

      // Sous-menus desktop : ouverture au focus clavier
      document.querySelectorAll('.header__nav-item--has-dropdown').forEach((item) => {
        item.addEventListener('focusin', () => {
          item.classList.add('is-open');
          item.querySelector('[data-dropdown-trigger]')?.setAttribute('aria-expanded', 'true');
        });
        item.addEventListener('focusout', (e) => {
          if (!item.contains(e.relatedTarget)) {
            item.classList.remove('is-open');
            item.querySelector('[data-dropdown-trigger]')?.setAttribute('aria-expanded', 'false');
          }
        });
      });
    },

    openMenu() {
      if (!this.menu) return;
      this.lastFocus = document.activeElement;
      this.menu.classList.add('is-open');
      this.menu.setAttribute('aria-hidden', 'false');
      this.menuOverlay?.classList.add('is-visible');
      document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'true');
      utils.lockScroll(true);
      utils.trapFocus(this.menu, this.menu.querySelector('[data-menu-close]'));
    },

    closeMenu() {
      if (!this.menu) return;
      this.menu.classList.remove('is-open');
      this.menu.setAttribute('aria-hidden', 'true');
      this.menuOverlay?.classList.remove('is-visible');
      document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
      utils.lockScroll(false);
      utils.releaseFocus(this.menu);
      this.lastFocus?.focus();
    },

    openSearch() {
      if (!this.search) return;
      this.searchLastFocus = document.activeElement;
      this.search.classList.add('is-active');
      this.search.setAttribute('aria-hidden', 'false');
      document.querySelector('[data-search-toggle]')?.setAttribute('aria-expanded', 'true');
      utils.lockScroll(true);
      utils.trapFocus(this.search, this.search.querySelector('.search-overlay__input'));
    },

    closeSearch() {
      if (!this.search) return;
      PredictiveSearch.abort();
      PredictiveSearch.close();
      this.search.classList.remove('is-active');
      this.search.setAttribute('aria-hidden', 'true');
      document.querySelector('[data-search-toggle]')?.setAttribute('aria-expanded', 'false');
      utils.lockScroll(false);
      utils.releaseFocus(this.search);
      this.searchLastFocus?.focus();
    },

    /**
     * Le header transparent (accueil) doit redevenir opaque des qu'on scrolle,
     * sinon le texte blanc se retrouve sur le fond clair de la page.
     */
    bindScroll() {
      const header = this.el;
      if (!header) return;
      const isTransparentHome = header.hasAttribute('data-transparent-home');

      const onScroll = () => {
        const scrolled = window.pageYOffset > 60;
        header.classList.toggle('is-scrolled', scrolled);
        if (isTransparentHome) header.classList.toggle('header--transparent', !scrolled);
      };

      let ticking = false;
      window.addEventListener(
        'scroll',
        () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(() => {
            onScroll();
            ticking = false;
          });
        },
        { passive: true }
      );
      onScroll();
    }
  };

  // ============================================
  // ANIMATIONS AU SCROLL
  // ============================================
  const Animations = {
    init() {
      const elements = document.querySelectorAll('[data-animate]:not(.is-visible)');
      if (!elements.length) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !('IntersectionObserver' in window)) {
        elements.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      elements.forEach((el) => observer.observe(el));
    }
  };

  // ============================================
  // PRODUITS RECOMMANDES (API Shopify)
  // ============================================
  const Recommendations = {
    async init(scope) {
      const container = (scope || document).querySelector('[data-recommendations]');
      if (!container || container.dataset.loaded === 'true') return;
      container.dataset.loaded = 'true';
      try {
        const res = await fetch(container.dataset.url);
        if (!res.ok) return;
        const html = await res.text();
        const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-recommendations]');
        if (fresh) container.innerHTML = fresh.innerHTML;
        Wishlist.updateUI();
      } catch (e) {
        /* pas de recommandations : la section reste vide */
      }
    }
  };

  // ============================================
  // INITIALISATION
  // ============================================
  function initAll(scope) {
    Header.init();
    PredictiveSearch.init();
    Cart.init();
    Wishlist.init();
    QuickView.init();
    Markets.init();
    ProductVariants.init(scope);
    ProductZoom.init();
    CollectionFilters.init(scope);
    Recommendations.init(scope);
    Animations.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }

  // Editeur de theme : e.target est le conteneur #shopify-section-*,
  // l'attribut data-section-type est sur un element interne.
  document.addEventListener('shopify:section:load', (e) => {
    initAll(e.target);
    Wishlist.updateUI();
  });

  document.addEventListener('shopify:section:unload', (e) => {
    if (e.target.querySelector('[data-mini-cart]')) Cart.drawer = null;
  });
})();
