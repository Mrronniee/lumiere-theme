/**
 * LUMIERE — Theme Shopify Mode
 * Wishlist, Quick View, Markets, panier AJAX
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

    /** Piege le focus dans un conteneur ouvert (drawer, modale). */
    trapFocus(container, firstFocus) {
      // Une reouverture ne doit pas empiler un second piege sur le premier.
      utils.releaseFocus(container);
      const selector =
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
      // offsetParent vaut null dans un conteneur position:fixed : on teste
      // la presence de boites de rendu, qui marche dans tous les cas.
      const focusable = () =>
        Array.from(container.querySelectorAll(selector)).filter(
          (el) => el.getClientRects().length > 0 && !el.hasAttribute('hidden')
        );

      const handler = (e) => {
        if (e.key !== 'Tab') return;
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      container.addEventListener('keydown', handler);
      container._releaseFocusTrap = () => container.removeEventListener('keydown', handler);
      // Au frame suivant : a t=0 les transitions de visibility heritees ne sont
      // pas encore resolues et l'element n'est pas focusable.
      requestAnimationFrame(() => (firstFocus || focusable()[0])?.focus());
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
    show(message, type) {
      if (!message) return;
      let region = document.getElementById('ThemeNotifications');
      if (!region) {
        region = document.createElement('div');
        region.id = 'ThemeNotifications';
        region.className = 'theme-notifications';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        document.body.appendChild(region);
      }
      const note = document.createElement('div');
      note.className = 'theme-notification' + (type === 'error' ? ' theme-notification--error' : '');
      note.textContent = message;
      region.appendChild(note);
      setTimeout(() => {
        note.classList.add('is-leaving');
        setTimeout(() => note.remove(), 300);
      }, 2600);
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
        if (toggle && this.drawer) {
          e.preventDefault();
          this.open();
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

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.isOpen) this.close();
      });

      document.addEventListener('submit', (e) => {
        const form = e.target.closest('[data-type="add-to-cart-form"]');
        if (form) {
          e.preventDefault();
          this.addItem(form);
        }
      });
    },

    open() {
      if (!this.drawer) return;
      this.lastFocus = document.activeElement;
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
      this.lastFocus?.focus();
    },

    /** Re-rend le contenu du drawer et les compteurs a partir du serveur. */
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
        console.error('Rafraichissement du panier impossible:', e);
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

      this.drawer = document.querySelector('[data-mini-cart]');
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
        this.open();
        Notify.show(strings.cartAdded);
      } catch (error) {
        console.error('Ajout au panier impossible:', error);
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
        console.error('Mise a jour du panier impossible:', error);
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
        console.error('Quick view indisponible:', error);
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
    async suggestMarket() {
      const banner = document.getElementById('MarketBanner');
      if (!banner) return;
      try {
        if (sessionStorage.getItem('lumiere_market_banner_dismissed')) return;
      } catch (e) {
        /* mode prive */
      }

      try {
        const res = await fetch(`${window.shopUrl || ''}/browsing_context_suggestions.json`);
        if (!res.ok) return;
        const data = await res.json();
        const suggested = data.detected_values && data.detected_values.country;
        if (!suggested || !suggested.handle) return;

        const current = document.querySelector('[data-country-code][aria-current="true"]');
        if (current && current.dataset.countryCode === suggested.handle) return;

        const text = banner.querySelector('[data-market-banner-text]');
        const switchBtn = banner.querySelector('[data-market-banner-switch]');
        if (!text || !switchBtn) return;

        text.textContent = utils.interpolate(strings.marketBanner, 'country', suggested.name);
        switchBtn.dataset.detectedCountry = suggested.handle;
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
