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
     * Formate un montant en centimes comme la boutique l'affiche.
     * Modele prefere : l'echantillon rendu par Liquid dans la devise AFFICHEE
     * (window.themeMoneySample = {{ 123456 | money }}), dont on deduit symbole,
     * separateurs et decimales. Le money_format brut ne connait que la devise
     * de base : sur un prix converti par Markets il aurait ecrit « € » devant
     * des dollars. Repli sur ce format si l'echantillon manque.
     */
    formatMoney(cents) {
      if (typeof cents === 'string') cents = cents.replace('.', '');
      const value = Number(cents) || 0;

      const pattern = utils.moneyPattern();
      if (pattern) {
        const parts = (value / 100).toFixed(pattern.decimals).split('.');
        const grouped = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + pattern.thousands);
        const number = parts[1] !== undefined ? grouped + pattern.decimal + parts[1] : grouped;
        return pattern.prefix + number + pattern.suffix;
      }

      const format = window.themeMoneyFormat || '${{amount}}';
      const placeholder = /\{\{\s*(\w+)\s*\}\}/;

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

    /**
     * Deduit de l'echantillon (1 234,56 rendu par Liquid) le prefixe (symbole),
     * le suffixe, le separateur de milliers, celui des decimales et leur nombre.
     * Calcule une fois ; null si l'echantillon manque ou n'est pas lisible.
     */
    moneyPattern() {
      if (utils._moneyPattern !== undefined) return utils._moneyPattern;
      const sample = window.themeMoneySample;
      const match = typeof sample === 'string' ? sample.match(/\d[\d.,'\u00a0\u202f ]*\d|\d/) : null;
      if (!match) {
        utils._moneyPattern = null;
        return null;
      }
      const digits = match[0];
      const dec = digits.match(/([.,])(\d{2})$/);
      const decimals = dec ? 2 : 0;
      const intDigits = dec ? digits.slice(0, -3) : digits;
      const thousandsMatch = intDigits.match(/[^\d]/);
      utils._moneyPattern = {
        prefix: sample.slice(0, match.index),
        suffix: sample.slice(match.index + digits.length),
        decimal: dec ? dec[1] : '',
        decimals: decimals,
        thousands: thousandsMatch ? thousandsMatch[0] : ''
      };
      return utils._moneyPattern;
    },

    /** Remplace [token] dans une chaine traduite. */
    interpolate(str, token, value) {
      return (str || '').replace('[' + token + ']', value);
    },

    /**
     * Prefixe un chemin de la boutique avec la locale affichee : routes.root_url
     * vaut « / » dans la langue principale et « /en » (sans barre finale) ailleurs.
     * Sans lui, une fiche chargee depuis /en revenait dans la langue par defaut.
     */
    localizedPath(path) {
      const root = (routes.root_url || '/').replace(/\/$/, '');
      return root + path;
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
    /**
     * Pose ou retire la semantique de fenetre modale sur un panneau.
     *
     * Elle n'est vraie que pendant l'ouverture : les filtres de collection
     * sont une colonne ordinaire sur bureau, le menu mobile est un <nav> hors
     * mobile. Un role="dialog" ecrit en dur dans le balisage mentirait donc la
     * moitie du temps — il est pose a l'ouverture et retire a la fermeture.
     */
    /**
     * Le message d'erreur le plus precis que renvoie l'API panier.
     *
     * Les points d'entree ne repondent pas de la meme facon : /cart/add.js et
     * /cart/change.js donnent « message » et « description », alors que
     * /cart/change (sans .js) ne donne que « errors », chaine ou objet
     * { champ: [messages] }. Sans lire « errors », le theme affichait son
     * message generique a la place de celui de Shopify (mesure : depassement
     * de stock).
     */
    /**
     * Lit la reponse d'un appel au panier SANS supposer qu'elle est du JSON.
     *
     * Shopify peut repondre une PAGE HTML : protection anti-robot, 5xx, limite
     * de requetes. response.json() levait alors une SyntaxError AVANT le test
     * response.ok, donc la branche d'erreur du panier n'etait jamais atteinte :
     * le client ne voyait ni message ni rafraichissement, sa ligne gardait la
     * quantite refusee, et il ne restait qu'un « Unexpected token '<' » dans la
     * console (mesure du 23/10/2026 sur le thème d'essai, appel a /cart/change).
     * On rend null quand le corps n'est pas du JSON : messageErreurPanier
     * retombe sur son message par defaut et l'appelant traite le cas comme
     * n'importe quelle erreur de panier.
     * @param {Response} response - La reponse de l'appel au panier.
     * @returns {Promise<object|null>} Le corps en objet, ou null.
     */
    async lireJsonPanier(response) {
      let brut = '';
      try {
        brut = await response.text();
      } catch (error) {
        return null;
      }
      if (!brut) return null;
      try {
        return JSON.parse(brut);
      } catch (error) {
        return null;
      }
    },

    messageErreurPanier(data, repli) {
      const defaut = repli || strings.cartError;
      if (!data) return defaut;
      if (typeof data.description === 'string' && data.description) return data.description;
      if (typeof data.message === 'string' && data.message && data.message !== 'Cart Error') return data.message;
      const e = data.errors;
      if (typeof e === 'string' && e) return e;
      if (e && typeof e === 'object') {
        const premier = Object.values(e).flat().find((m) => typeof m === 'string' && m);
        if (premier) return premier;
      }
      return defaut;
    },

    /**
     * Pose role=dialog et aria-modal le temps de l'ouverture. Un role DECLARE
     * dans le gabarit (overlay de recherche) n'est ni repose ni retire : sans
     * cette garde, la fermeture enlevait un role dont depend son aria-label.
     * Le tiroir de filtres, lui, n'est un dialogue qu'en mobile : il n'en
     * declare pas, et le garde donc seulement pendant l'ouverture.
     * @param {HTMLElement} container
     * @param {boolean} on
     */
    setDialog(container, on) {
      if (!container) return;
      if (on) {
        if (!container.hasAttribute('role')) {
          container.setAttribute('role', 'dialog');
          container.dataset.dialogRolePose = 'true';
        }
        if (!container.hasAttribute('aria-modal')) {
          container.dataset.dialogModalPose = 'true';
        }
        container.setAttribute('aria-modal', 'true');
      } else {
        if (container.dataset.dialogRolePose === 'true') {
          container.removeAttribute('role');
          delete container.dataset.dialogRolePose;
        }
        // Un aria-modal declare dans le balisage reste : seul celui que ce
        // script a pose est retire (le panneau de filtres n'est modal qu'en tiroir).
        if (container.dataset.dialogModalPose === 'true') {
          container.removeAttribute('aria-modal');
          delete container.dataset.dialogModalPose;
        }
      }
    },

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

    /**
     * Rend le focus au declencheur d'un dialogue. Si rien d'utile n'avait le
     * focus a l'ouverture (clic souris sous Safari, ouverture par script), on
     * retombe sur le bouton qui ouvre ce dialogue : jamais sur un champ devenu
     * invisible.
     */
    focusBack(candidate, fallbackSelector) {
      // Un element present mais invisible (visibility: hidden) refuse le focus sans
      // erreur : on verifie que le focus a pris, sinon on se rabat sur le bouton.
      const tryFocus = (el) => {
        if (!el || el === document.body || el === document.documentElement) return false;
        if (!el.isConnected || el.disabled || el.getClientRects().length === 0) return false;
        if (typeof el.focus !== 'function') return false;
        el.focus();
        return document.activeElement === el;
      };
      if (tryFocus(candidate)) return;
      tryFocus(document.querySelector(fallbackSelector));
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
            const res = await fetch(utils.localizedPath(`/products/${item.handle}?view=card`));
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

      // Note de commande : enregistree sur le panier des la saisie, pour partir
      // aussi depuis le formulaire du tiroir (qui ne contient pas le champ).
      document.addEventListener('change', (e) => {
        // Toute note de commande, d'ou qu'elle vienne : le champ du TIROIR est
        // hors de [data-cart-section], sa saisie n'etait donc jamais envoyee et
        // se perdait des qu'on ouvrait /cart.
        const note = e.target.closest('textarea[name="note"]');
        if (!note) return;
        fetch(routes.cart_update_url || '/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ note: note.value })
        }).catch(() => {
          /* la note part de toute facon avec le formulaire de la page panier */
        });
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

      /**
       * Carte cadeau : les champs du destinataire ne s'affichent que si
       * l'acheteur coche « envoyer a quelqu'un d'autre ». La case porte le nom
       * exact attendu par Shopify, donc on ne la retire jamais du formulaire.
       */
      document.addEventListener('change', (e) => {
        const toggle = e.target.closest('[data-gift-card-toggle]');
        if (!toggle) return;
        const fields = toggle.closest('fieldset')?.querySelector('[data-gift-card-fields]');
        if (fields) fields.hidden = !toggle.checked;
      });

      /**
       * Retour arriere du navigateur : la page revient du cache (bfcache) telle
       * qu'elle etait AVANT l'ajout au panier, et le compteur de l'en-tete
       * affiche l'ancien nombre. On relit /cart.js et on re-rend le tiroir.
       */
      window.addEventListener('pageshow', (e) => {
        if (!e.persisted) return;
        this.refresh();
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

    /**
     * Sections a re-rendre apres une mutation du panier : le tiroir et, sur la
     * page panier, les sections lignes et recapitulatif (data-cart-section).
     */
    sectionsWanted() {
      const wanted = [];
      if (document.querySelector('[data-mini-cart]')) wanted.push('mini-cart');
      document.querySelectorAll('[data-cart-section][data-section-id]').forEach((el) => {
        const id = el.dataset.sectionId;
        if (id && wanted.indexOf(id) === -1) wanted.push(id);
      });
      return wanted;
    },

    /** Parametres a joindre a une requete du Cart API pour recevoir ces sections. */
    sectionsRequest() {
      return { sections: this.sectionsWanted(), sections_url: window.location.pathname };
    },

    /**
     * Re-rend tout ce qui affiche le panier. Exigence Theme Store : toutes les
     * lignes et le total se rafraichissent quand une quantite change, une ligne
     * supprimee disparait.
     *
     * Les sections sont de preference celles renvoyees par la requete de
     * mutation elle-meme (parametre `sections` du Cart API) : un GET
     * `?sections=` lance juste apres pouvait encore rendre l'ancien panier
     * (vu le 23/09/2026 : quantite 2 sur le serveur, ligne encore a 1).
     * Le compteur du header vient du panier renvoye par la mutation, sinon du
     * tiroir re-rendu, sinon de /cart.js.
     * @param {{sections?: Object, cart?: Object}} [fresh]
     */
    async refresh(fresh) {
      const focusMemo = this.rememberFocus();
      const wanted = this.sectionsWanted();
      let sections = fresh && fresh.sections && typeof fresh.sections === 'object' ? fresh.sections : null;
      if (wanted.length && (!sections || wanted.some((id) => !sections[id]))) {
        try {
          sections = await utils.fetchSections(wanted);
        } catch (e) {
          console.error('Could not refresh the cart:', e);
          sections = null;
        }
      }

      if (sections) {
        if (sections['mini-cart']) this.replaceDrawer(sections['mini-cart']);
        wanted
          .filter((id) => id !== 'mini-cart' && sections[id])
          .forEach((id) => this.replaceSection(id, sections[id]));
      }

      const cart = fresh && fresh.cart && typeof fresh.cart.item_count === 'number' ? fresh.cart : null;
      if (cart) {
        this.updateCounters(cart, !sections);
      } else if (sections && sections['mini-cart'] && this.countFromDrawer(sections['mini-cart']) !== null) {
        this.updateCounters({ item_count: this.countFromDrawer(sections['mini-cart']) }, false);
      } else {
        try {
          const res = await fetch(`${routes.cart_url || '/cart'}.js`);
          if (res.ok) this.updateCounters(await res.json(), !sections);
        } catch (e) {
          /* silencieux : les sections re-rendues font deja foi */
        }
      }

      this.resolveDrawer();
      const restored = this.restoreFocus(focusMemo);
      // innerHTML a remplace les elements focusables : on rearme le piege.
      if (this.drawer && this.state.isOpen) {
        utils.trapFocus(this.drawer, restored || this.drawer.querySelector('[data-mini-cart-close]'));
      }
      Wishlist.updateUI();
    },

    /** Nombre d'articles lu dans le tiroir re-rendu (data-cart-item-count), sinon null. */
    countFromDrawer(markup) {
      const parsed = new DOMParser().parseFromString(markup, 'text/html');
      const el = parsed.querySelector('[data-cart-item-count]');
      if (!el) return null;
      const value = parseInt(el.getAttribute('data-cart-item-count'), 10);
      return Number.isNaN(value) ? null : value;
    },

    /** Remplace le contenu du tiroir en conservant son etat ouvert. */
    replaceDrawer(markup) {
      const parsed = new DOMParser().parseFromString(markup, 'text/html');
      const fresh = parsed.querySelector('[data-mini-cart]');
      const current = document.querySelector('[data-mini-cart]');
      if (!fresh || !current) return;
      const wasOpen = current.classList.contains('is-open');
      current.innerHTML = fresh.innerHTML;
      if (wasOpen) {
        current.classList.add('is-open');
        current.setAttribute('aria-hidden', 'false');
      }
    },

    /**
     * Remplace une section de la page panier par son rendu frais. Shopify la
     * renvoie avec son conteneur #shopify-section-<id> : on ne remplace que
     * l'interieur pour garder le conteneur en place.
     */
    replaceSection(id, markup) {
      const parsed = new DOMParser().parseFromString(markup, 'text/html');
      const wrapperId = `shopify-section-${id}`;
      let current = document.getElementById(wrapperId);
      const fresh = parsed.getElementById(wrapperId);
      // La note en cours de saisie n'est pas encore sur le serveur : on la garde.
      const typedNote = current && current.querySelector('textarea[name="note"]');
      const typed = typedNote ? typedNote.value : null;
      if (current && fresh) {
        current.innerHTML = fresh.innerHTML;
      } else {
        const currentRoot = document.querySelector(`[data-cart-section][data-section-id="${id}"]`);
        const freshRoot = parsed.querySelector(`[data-cart-section][data-section-id="${id}"]`);
        if (!currentRoot || !freshRoot) return;
        currentRoot.replaceWith(freshRoot);
        current = freshRoot;
      }
      if (typed !== null) {
        const freshNote = current.querySelector('textarea[name="note"]');
        if (freshNote && freshNote.value !== typed) freshNote.value = typed;
      }
    },

    /**
     * Le re-rendu detruit l'element qui avait le focus (bouton +/-, champ
     * quantite, supprimer). On memorise la ligne (cle) et la commande pour
     * reposer le focus au meme endroit ; a defaut sur la premiere quantite
     * restante ; a defaut sur le titre (panier vide) ou le bouton fermer.
     */
    rememberFocus() {
      const active = document.activeElement;
      if (!active || active === document.body) return null;
      const item = active.closest('[data-cart-item]');
      if (!item) return null;
      let control = null;
      if (active.matches('[data-qty-change]')) control = `[data-qty-change="${active.dataset.qtyChange}"]`;
      else if (active.matches('[data-qty-input]')) control = '[data-qty-input]';
      else if (active.matches('[data-remove-item]')) control = '[data-remove-item]';
      return { key: item.dataset.key, control, inDrawer: Boolean(active.closest('[data-mini-cart]')) };
    },

    restoreFocus(memo) {
      if (!memo) return null;
      const drawer = document.querySelector('[data-mini-cart]');
      const inDrawer = (el) => Boolean(drawer && drawer.contains(el));
      const pick = (selector) =>
        Array.from(document.querySelectorAll(selector)).find((el) => inDrawer(el) === memo.inDrawer) || null;

      let target = null;
      if (memo.key && memo.control) target = pick(`[data-cart-item][data-key="${memo.key}"] ${memo.control}`);
      if (!target) target = pick('[data-cart-item] [data-qty-input]');
      if (!target) {
        target = memo.inDrawer ? pick('[data-mini-cart-close]') : pick('.cart-items__title, .cart-items__empty-title');
        if (target && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      }
      if (!target) return null;
      target.focus({ preventScroll: true });
      return document.activeElement === target ? target : null;
    },

    /**
     * Compteurs du header. Les totaux ne sont reformates en JS qu'en secours
     * (re-rendu impossible) : le serveur les rend dans la devise affichee.
     */
    updateCounters(cart, withTotals) {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = cart.item_count;
      });
      document.querySelectorAll('[data-cart-count-text]').forEach((el) => {
        el.textContent = `(${cart.item_count})`;
      });
      if (!withTotals) return;
      // Le sous-total est le total AVANT remises, le total celui APRES : les
      // ecrire tous les deux avec cart.total_price donnait « Sous-total -
      // Remises != Total » des qu'un code promo etait applique.
      const sousTotal = utils.formatMoney(
        typeof cart.items_subtotal_price === 'number' ? cart.items_subtotal_price : cart.total_price
      );
      const total = utils.formatMoney(cart.total_price);
      document.querySelectorAll('[data-cart-subtotal]').forEach((el) => {
        el.textContent = sousTotal;
      });
      document.querySelectorAll('[data-cart-total]').forEach((el) => {
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
        const wanted = this.sectionsRequest();
        formData.append('sections', wanted.sections.join(','));
        formData.append('sections_url', wanted.sections_url);
        const response = await fetch(routes.cart_add_url || '/cart/add', {
          method: 'POST',
          headers: { Accept: 'application/javascript' },
          body: formData
        });
        const data = await utils.lireJsonPanier(response);

        if (!response.ok || !data) {
          Notify.show(utils.messageErreurPanier(data, strings.cartAddError), 'error');
          return;
        }

        await this.refresh({ sections: data.sections });
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
          body: JSON.stringify(Object.assign({ items: [{ id: Number(variantId), quantity: 1 }] }, this.sectionsRequest()))
        });
        const data = await utils.lireJsonPanier(response);
        if (!response.ok || !data) {
          Notify.show(utils.messageErreurPanier(data, strings.cartAddError), 'error');
          return;
        }
        await this.refresh({ sections: data.sections });
        // Le tiroir s'ouvre comme pour un ajout depuis la fiche produit : sans
        // cela, l'ajout rapide d'une carte remplissait le panier sans rien
        // montrer (le tiroir restait hors ecran, le focus sur le bouton).
        this.open(btn);
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
          body: JSON.stringify(Object.assign(body, this.sectionsRequest()))
        });
        const data = await utils.lireJsonPanier(response);

        if (!response.ok || !data) {
          // Selon le point d'entree, Shopify met le detail dans
          // « description », dans « message », ou — pour /cart/change SANS
          // « .js » — dans « errors », qui peut etre une chaine ou un objet
          // { champ: [messages] }. Mesure : « Only 3 items were added to your
          // cart due to availability. » n'arrivait que par « errors », et le
          // client lisait le message generique du theme.
          Notify.show(utils.messageErreurPanier(data), 'error');
          // La ligne affichait encore la quantite refusee (9 saisi, 3 au
          // panier) : on re-rend le panier pour revenir a l'etat reel.
          await this.refresh();
          return;
        }
        await this.refresh({ sections: data.sections, cart: data });
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
          if (trigger.dataset.productHandle) this.open(trigger.dataset.productHandle, trigger);
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

    async open(handle, trigger) {
      try {
        const response = await fetch(utils.localizedPath(`/products/${handle}.js`));
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

        const active = document.activeElement;
        this.lastFocus = active && active !== document.body ? active : trigger || null;
        this.modal.classList.add('is-active');
        this.modal.setAttribute('aria-hidden', 'false');
        utils.lockScroll(true);
        utils.trapFocus(this.modal, this.modal.querySelector('button[data-quick-view-close]'));
      } catch (error) {
        console.error('Quick view unavailable:', error);
        // Repli : on laisse le client aller sur la fiche produit.
        window.location.href = utils.localizedPath(`/products/${handle}`);
      }
    },

    truncate(html) {
      const text = (html || '').replace(/<[^>]*>/g, '');
      return text.length > 200 ? text.slice(0, 200) + '...' : text;
    },

    renderOptions() {
      const container = this.modal.querySelector('[data-quick-view-variants]');
      if (!container) return;
      container.replaceChildren();
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

      // Construit par le DOM (textContent, setAttribute) : un nom ou une valeur
      // d'option ne peut jamais etre interprete comme du HTML.
      names.forEach((name, i) => {
        const selected = this.currentVariant.options[i];
        const wrapper = document.createElement('div');
        wrapper.className = 'product-variant';

        const label = document.createElement('span');
        label.className = 'product-variant__label';
        label.textContent = name;

        const group = document.createElement('div');
        group.className = 'product-variant__options';
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', name);

        valuesFor(i).forEach((value, vi) => {
          const id = `qv-opt-${i}-${vi}`;
          const option = document.createElement('div');
          option.className = 'product-variant__option';

          const input = document.createElement('input');
          input.type = 'radio';
          input.name = `qv-option-${i}`;
          input.value = value;
          input.id = id;
          input.className = 'product-variant__option-input';
          input.setAttribute('data-quick-view-option', '');
          input.setAttribute('data-option-index', String(i));
          if (value === selected) {
            input.defaultChecked = true;
            input.checked = true;
          }

          const optionLabel = document.createElement('label');
          optionLabel.htmlFor = id;
          optionLabel.className = 'product-variant__option-label';
          optionLabel.textContent = value;

          option.append(input, optionLabel);
          group.appendChild(option);
        });

        wrapper.append(label, group);
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
          body: JSON.stringify(Object.assign({ items: [{ id: variantId, quantity: quantity }] }, Cart.sectionsRequest()))
        });
        const data = await utils.lireJsonPanier(response);
        if (!response.ok || !data) {
          Notify.show(utils.messageErreurPanier(data, strings.cartAddError), 'error');
          return;
        }
        await Cart.refresh({ sections: data.sections });
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

    /**
     * Ouvre le panneau vide, pour l'editeur de theme uniquement : il n'y a pas
     * de produit a charger quand le marchand selectionne la section.
     */
    openEmpty() {
      if (!this.modal) this.modal = document.querySelector('[data-quick-view]');
      if (!this.modal) return;
      this.modal.classList.add('is-active');
      this.modal.setAttribute('aria-hidden', 'false');
    },

    close() {
      if (!this.modal) return;
      this.modal.classList.remove('is-active');
      this.modal.setAttribute('aria-hidden', 'true');
      utils.lockScroll(false);
      utils.releaseFocus(this.modal);
      utils.focusBack(this.lastFocus, '[data-quick-view-trigger]');
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
            // Declencheur memorise : Echap doit rendre le focus ici, sinon le
            // focus restait dans un panneau devenu invisible.
            this.lastFocus = toggle;
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
          this.reserverPlace(null);
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

      // Le panneau se ferme aussi quand le focus en sort (Tab depuis le dernier
      // choix, ou clic ailleurs) : sinon un menu ouvert reste derriere le focus,
      // et le lecteur d'ecran annonce des choix que personne ne voit (WCAG 1.4.13).
      document.addEventListener('focusout', (e) => {
        const group = e.target.closest('[data-market-dropdown]');
        if (!group || !group.classList.contains('is-open')) return;
        if (group.contains(e.relatedTarget)) return;
        group.classList.remove('is-open');
        group.querySelector('.markets-selectors__toggle')?.setAttribute('aria-expanded', 'false');
        this.lastFocus = null;
      });
    },

    closeAll() {
      // Le focus ne revient au declencheur que s'il etait DANS le panneau qu'on
      // ferme : sinon un clic ailleurs sur la page volerait le focus.
      let focusWasInside = false;
      document.querySelectorAll('[data-market-dropdown]').forEach((group) => {
        if (group.classList.contains('is-open') && group.contains(document.activeElement)) {
          focusWasInside = true;
        }
        group.classList.remove('is-open');
        group.querySelector('.markets-selectors__toggle')?.setAttribute('aria-expanded', 'false');
      });
      // Le focus revient aussi quand PERSONNE ne le tient (document.activeElement
      // vaut <body>) : dans le menu mobile, Echap fermait les trois panneaux sans
      // rendre le focus au declencheur (mesure 1.6.1 a 390, 360 et 320, alors que
      // les panneaux de l'en-tete le rendaient bien a 1440). On ne le vole jamais
      // a un vrai element : seul le cas « plus rien de focalise » est ajoute.
      const personne = document.activeElement === document.body || !document.activeElement;
      if (focusWasInside || personne) {
        utils.focusBack(this.lastFocus, '.markets-selectors__toggle');
      }
      this.lastFocus = null;
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

    /**
     * Reserve la place du bandeau de marche.
     *
     * Le bandeau est hors du flux (sinon son apparition decalait toute la page
     * de 77 px : CLS 0,125 a 360 px). Hors du flux, il RECOUVRAIT les 54 a
     * 75 derniers pixels du document — mesure : la ligne de copyright finissait
     * 42,6 px sous lui. On rend donc sa hauteur au document par le bas, et on
     * la retire a la fermeture. Pose APRES la premiere peinture et tout en bas
     * du document, ce remplissage ne decale rien au-dessus : le CLS reste
     * inchange.
     */
    reserverPlace(banner) {
      const racine = document.documentElement;
      if (!banner) {
        document.body.style.paddingBottom = '';
        racine.style.scrollPaddingBottom = '';
        return;
      }
      const poser = () => {
        const h = banner.offsetHeight;
        if (!h) return;
        document.body.style.paddingBottom = `${h}px`;
        racine.style.scrollPaddingBottom = `${h}px`;
      };
      poser();
      if (!this.hauteurSuivie && 'ResizeObserver' in window) {
        this.hauteurSuivie = true;
        new ResizeObserver(() => {
          if (banner.classList.contains('is-visible')) poser();
        }).observe(banner);
      }
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
        this.reserverPlace(banner);
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

      Pickup.refresh(variant.id);
    }
  };

  // ============================================
  // RETRAIT EN MAGASIN
  // ============================================
  /**
   * Rafraichit le bloc de retrait quand la variante change.
   *
   * La disponibilite par point de retrait depend de la variante : elle est
   * rendue cote serveur pour la variante affichee, puis re-rendue par l'API de
   * rendu de section (/variants/<id>/?section_id=pickup-availability), comme
   * le fait Shopify. Sans JavaScript, la page affiche la disponibilite de la
   * variante chargee, ce qui reste juste.
   */
  const Pickup = {
    init() {
      if (this.bound) return;
      this.bound = true;
      document.addEventListener('click', (e) => {
        const toggle = e.target.closest('[data-pickup-toggle]');
        if (!toggle) return;
        const liste = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!liste) return;
        const ouvert = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
        liste.hidden = ouvert;
      });
    },

    async refresh(variantId) {
      const conteneur = document.querySelector('[data-pickup-availability]');
      if (!conteneur || !variantId) return;
      try {
        // La section se demande sur l'URL DU PRODUIT avec ?variant= : sur
        // /variants/<id>/?section_id=pickup-availability, mesure faite,
        // store_availabilities revient vide (107 octets) alors que la meme
        // section sur l'URL produit en rend 850 avec le retrait.
        const url = new URL(window.location.href);
        url.search = '';
        url.searchParams.set('variant', variantId);
        url.searchParams.set('section_id', 'pickup-availability');
        const reponse = await fetch(url.toString());
        if (!reponse.ok) return;
        const html = await reponse.text();
        const recu = new DOMParser().parseFromString(html, 'text/html');
        const neuf = recu.querySelector('.pickup-availability__summary');
        // Une reponse sans retrait ne doit pas EFFACER celui qui est affiche :
        // ou la variante n'a pas de point de retrait, ou la requete n'a rien
        // rendu. On ne remplace que ce qu'on a mesure.
        if (neuf) {
          conteneur.innerHTML = neuf.outerHTML;
        } else if (recu.querySelector('[data-pickup-empty]')) {
          conteneur.innerHTML = '';
        }
      } catch (e) {
        /* la disponibilite rendue au chargement reste affichee */
      }
    },
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
      utils.focusBack(this.lastFocus, '.product-gallery__zoom');
    }
  };

  // ============================================
  // FILTRES COLLECTION
  // ============================================
  const CollectionFilters = {
    init(scope) {
      // La page de resultats de recherche a les memes filtres et le meme tri
      // que la collection : le module sert aux deux.
      const section = (scope || document).querySelector(
        '[data-section-type="collection"], [data-section-type="search"]'
      );
      if (!section || section.dataset.filtersBound === 'true') return;
      section.dataset.filtersBound = 'true';
      this.section = section;

      this.filters = section.querySelector('[data-filters]');
      this.overlay = section.querySelector('[data-filter-overlay]');
      this.productsGrid = section.querySelector('[data-products-grid]');

      // Sur bureau (990 px et plus) le panneau de filtres est visible en
      // permanence : le masquer aux lecteurs d'ecran rendait les filtres
      // inaccessibles (axe : aria-hidden-focus). En dessous c'est un tiroir,
      // masque tant qu'il est ferme.
      this.drawerQuery = window.matchMedia('(max-width: 989px)');
      this.syncFiltersHidden();
      this.drawerQuery.addEventListener('change', () => this.syncFiltersHidden());

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
      this.lastFocus = document.activeElement;
      // L'etat du declencheur suit l'etat du panneau : il restait
      // aria-expanded="false" panneau ouvert comme ferme.
      document.querySelector('[data-filter-toggle]')?.setAttribute('aria-expanded', 'true');
      this.filters?.classList.add('is-open');
      this.filters?.setAttribute('aria-hidden', 'false');
      this.overlay?.classList.add('is-visible');
      utils.setDialog(this.filters, true);
      utils.lockScroll(true);
      if (this.filters) utils.trapFocus(this.filters, this.filters.querySelector('[data-filter-close]'));
    },

    syncFiltersHidden() {
      if (!this.filters) return;
      const open = this.filters.classList.contains('is-open');
      if (this.drawerQuery && this.drawerQuery.matches && !open) this.filters.setAttribute('aria-hidden', 'true');
      else this.filters.removeAttribute('aria-hidden');
    },

    closeFilters() {
      document.querySelector('[data-filter-toggle]')?.setAttribute('aria-expanded', 'false');
      this.filters?.classList.remove('is-open');
      this.syncFiltersHidden();
      this.overlay?.classList.remove('is-visible');
      utils.setDialog(this.filters, false);
      utils.lockScroll(false);
      utils.releaseFocus(this.filters);
      utils.focusBack(this.lastFocus, '[data-filter-toggle]');
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
        // Avant, l'echec etait muet : la liste se vidait, rien n'etait affiche
        // ni annonce, et le client croyait qu'il n'y avait aucun resultat.
        this.showError();
      } finally {
        if (this.controller === controller) this.controller = null;
      }
    },

    /** Affiche ET annonce l'echec de la recherche predictive. */
    showError() {
      if (!this.list) return;
      this.list.replaceChildren();
      this.lastTerms = '';
      this.setActive(-1);
      const message = (window.themeStrings && window.themeStrings.searchError) || '';
      if (this.empty && message) {
        this.empty.textContent = message;
        this.empty.hidden = false;
        if (this.panel) this.panel.hidden = false;
        this.input.setAttribute('aria-expanded', 'true');
        this.announce(message);
      } else {
        this.close();
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

      this.publishHeight();

      if (!this.bound) {
        this.bindEvents();
        this.bindScroll();
        this.bound = true;
      }
    },

    /**
     * Publie la hauteur REELLE du header en variable CSS : sur l'accueil, le
     * premier bloc remonte de cette hauteur pour passer sous le header
     * transparent. Elle depend de la taille du logo reglee par le marchand,
     * donc elle se mesure au lieu de se deviner (le defaut CSS, 71 px, ne sert
     * qu'avant le premier calcul et sans JavaScript).
     */
    publishHeight() {
      const header = this.el;
      if (!header) return;

      const set = () => {
        document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
      };
      set();

      if (this.heightWatched) return;
      this.heightWatched = true;
      if ('ResizeObserver' in window) {
        new ResizeObserver(set).observe(header);
      } else {
        window.addEventListener('resize', set, { passive: true });
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
            el.closest('.header__nav-item')?.classList.remove('is-open', 'is-closed-by-esc');
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
        const trigger = item.querySelector('[data-dropdown-trigger]');
        item.addEventListener('focusin', () => {
          // Rouvrir serait repartir contre Echap : le declencheur garde le focus
          // apres une fermeture au clavier, et focusin se rejoue sur lui.
          if (item.classList.contains('is-closed-by-esc')) return;
          item.classList.add('is-open');
          trigger?.setAttribute('aria-expanded', 'true');
        });
        item.addEventListener('focusout', (e) => {
          if (!item.contains(e.relatedTarget)) {
            item.classList.remove('is-closed-by-esc');
            item.classList.remove('is-open');
            trigger?.setAttribute('aria-expanded', 'false');
          }
        });
        // Echap ferme le sous-menu et rend le focus au declencheur (WCAG 2.1.1) :
        // sans lui, le focus restait dans un panneau que rien ne fermait.
        item.addEventListener('keydown', (e) => {
          if (e.key !== 'Escape') return;
          if (!item.classList.contains('is-open')) return;
          item.classList.add('is-closed-by-esc');
          item.classList.remove('is-open');
          trigger?.setAttribute('aria-expanded', 'false');
          trigger?.focus();
        });
      });
    },

    /**
     * Semantique de fenetre modale, posee A L'OUVERTURE seulement : le menu
     * mobile, la recherche et les filtres sont des panneaux modaux une fois
     * ouverts, mais les filtres restent une colonne ordinaire sur bureau — un
     * role="dialog" ecrit en dur dans le balisage y serait faux.
     */
    openMenu() {
      if (!this.menu) return;
      this.lastFocus = document.activeElement;
      this.menu.classList.add('is-open');
      this.menu.setAttribute('aria-hidden', 'false');
      this.menuOverlay?.classList.add('is-visible');
      document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'true');
      utils.setDialog(this.menu, true);
      utils.lockScroll(true);
      utils.trapFocus(this.menu, this.menu.querySelector('[data-menu-close]'));
    },

    closeMenu() {
      if (!this.menu) return;
      this.menu.classList.remove('is-open');
      this.menu.setAttribute('aria-hidden', 'true');
      this.menuOverlay?.classList.remove('is-visible');
      document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded', 'false');
      utils.setDialog(this.menu, false);
      utils.lockScroll(false);
      utils.releaseFocus(this.menu);
      utils.focusBack(this.lastFocus, '[data-menu-toggle]');
    },

    openSearch() {
      if (!this.search) return;
      this.searchLastFocus = document.activeElement;
      this.search.classList.add('is-active');
      this.search.setAttribute('aria-hidden', 'false');
      document.querySelector('[data-search-toggle]')?.setAttribute('aria-expanded', 'true');
      utils.setDialog(this.search, true);
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
      utils.setDialog(this.search, false);
      utils.lockScroll(false);
      utils.releaseFocus(this.search);
      utils.focusBack(this.searchLastFocus, '[data-search-toggle]');
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
        { threshold: 0.1, rootMargin: '0px 0px 15% 0px' }
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

      // La section ne se replie que si la reponse ne ramene aucun produit :
      // tant qu'on ne sait pas, les cartes d'attente gardent la place.
      const collapse = () => {
        const section = container.closest('[data-section-id]');
        if (section) section.hidden = true;
      };

      try {
        const res = await fetch(container.dataset.url);
        if (!res.ok) {
          collapse();
          return;
        }
        const html = await res.text();
        const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-recommendations]');
        if (!fresh || !fresh.querySelector('.product-card')) {
          collapse();
          return;
        }
        container.innerHTML = fresh.innerHTML;
        Wishlist.updateUI();
      } catch (e) {
        collapse();
      }
    }
  };

  // ============================================
  // VIDEO DU HEROS
  // ============================================
  /**
   * Lecture automatique du héros, et bouton pour l'arrêter.
   *
   * L'attribut autoplay n'est pas dans le balisage : prefers-reduced-motion ne
   * se lit pas en Liquid, et la vidéo tournait en boucle malgré la préférence,
   * sans aucun moyen de l'arrêter (mesuré sur la démo). Même motif que
   * sections/video-banner.liquid.
   */
  const HeroVideo = {
    init() {
      const video = document.querySelector('[data-hero-video]');
      if (!video || video.dataset.heroBound === 'true') return;
      video.dataset.heroBound = 'true';

      const toggle = document.querySelector('[data-hero-video-toggle]');
      const iconPlay = toggle?.querySelector('[data-icon-play]');
      const iconPause = toggle?.querySelector('[data-icon-pause]');
      const reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const sync = () => {
        if (!toggle) return;
        const joue = !video.paused;
        toggle.setAttribute('aria-label', joue ? toggle.dataset.labelPause : toggle.dataset.labelPlay);
        iconPause?.toggleAttribute('hidden', !joue);
        iconPlay?.toggleAttribute('hidden', joue);
      };

      if (reduit) {
        video.pause();
      } else {
        video.play().catch(() => {
          /* le navigateur peut refuser la lecture : le poster reste affiche */
        });
      }
      sync();

      video.addEventListener('play', sync);
      video.addEventListener('pause', sync);
      toggle?.addEventListener('click', () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
  };

  // ============================================
  // FOCUS APRES UN ENVOI DE FORMULAIRE
  // ============================================
  /**
   * Apres un envoi, Shopify renvoie la page avec une ancre (#contact_form,
   * #ContactForm…) ou un parametre (?customer_posted=true). Le navigateur
   * donne alors le focus a la cible de l'ancre, ce qui ANNULE l'attribut
   * autofocus du bloc de message : mesure sur la demo, le focus restait sur
   * <body> apres une erreur de contact, de newsletter et de commentaire.
   *
   * On le repose donc en JavaScript, sur le premier message rendu par la page
   * (erreur d'abord, succes ensuite), sans defiler brutalement.
   */
  const FormFeedback = {
    init() {
      if (this.done) return;
      this.done = true;
      // La cible doit etre VISIBLE : un conteneur d'erreurs masque (autre
      // formulaire de la page) etait pris par querySelector, et focus() sur un
      // element masque ne fait rien, donc le focus restait sur <body>.
      const visible = (el) => !!(el && (el.offsetParent !== null || el.getClientRects().length));
      const candidats = Array.from(
        document.querySelectorAll('[role="alert"][tabindex="-1"], [role="status"][tabindex="-1"]')
      );
      const cible =
        candidats.find((el) => el.hasAttribute('autofocus') && visible(el)) || candidats.find(visible);
      if (!cible) return;

      // Le focus est repose PLUSIEURS FOIS, et la fenetre de 1.6.1 (rAF, load,
      // puis 120 ms) etait TROP COURTE : deux audits de la 1.6.1 ont mesure
      // document.activeElement === BODY a +1,2 s ET a +4,2 s sur les quatre
      // envois, alors qu'un focus() lance a la main prenait. Quelque chose
      // reprend donc le focus apres 120 ms (ancre #contact_form de Shopify,
      // montee des composants). On reessaie par pas de 150 ms pendant 2,1 s au
      // plus, et on S'ARRETE des que le visiteur agit : on ne lui vole jamais
      // le focus en cours de frappe ou de clic.
      let restant = 14;
      let abandon = false;
      const stopper = () => { abandon = true; };
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((nom) => {
        document.addEventListener(nom, stopper, { once: true, passive: true });
      });
      const poser = () => {
        if (abandon) return true;
        if (cible.contains(document.activeElement)) return true;
        cible.focus({ preventScroll: true });
        return cible.contains(document.activeElement);
      };
      const essayer = () => {
        if (poser() || restant <= 0) return;
        restant -= 1;
        setTimeout(essayer, 150);
      };
      essayer();
      window.addEventListener('load', essayer, { once: true });
      cible.scrollIntoView({ block: 'center', behavior: 'auto' });
    },
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
    Pickup.init();
    Animations.init();
    HeroVideo.init();
    FormFeedback.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAll());
  } else {
    initAll();
  }

  /**
   * Rejoue les <script> en ligne d'une section rechargee.
   *
   * L'editeur remplace le balisage d'une section par innerHTML : un <script>
   * insere ainsi n'est JAMAIS execute par le navigateur. Les sections dont le
   * comportement vit dans un script en ligne (onglets, FAQ, compte a rebours,
   * diaporama, bandeau video) restaient donc inertes apres un rechargement —
   * mesure dans l'editeur : les quatre panneaux d'onglets s'empilaient et le
   * clic ne faisait plus rien.
   *
   * Chaque script est recree a l'identique, donc execute. Tous portent une
   * garde d'idempotence (data-*-init) : un double passage ne fait rien.
   */
  function rejoueScripts(scope) {
    if (!scope || !scope.querySelectorAll) return;
    scope.querySelectorAll('script:not([src]):not([type])').forEach((vieux) => {
      const neuf = document.createElement('script');
      neuf.textContent = vieux.textContent;
      vieux.parentNode.replaceChild(neuf, vieux);
    });
  }

  // Editeur de theme : e.target est le conteneur #shopify-section-*,
  // l'attribut data-section-type est sur un element interne.
  document.addEventListener('shopify:section:load', (e) => {
    rejoueScripts(e.target);
    initAll(e.target);
    Wishlist.updateUI();
  });

  document.addEventListener('shopify:section:unload', (e) => {
    if (e.target.querySelector('[data-mini-cart]')) Cart.drawer = null;
  });

  /**
   * Editeur de theme : choisir dans la liste une section qui n'est visible
   * qu'ouverte (tiroir panier, apercu rapide) doit l'ouvrir. Sinon le marchand
   * la selectionne, ne voit rien bouger, et ne peut pas juger ses reglages.
   */
  document.addEventListener('shopify:section:select', (e) => {
    if (e.target.querySelector('[data-mini-cart]')) Cart.open();
    if (e.target.querySelector('[data-quick-view]')) QuickView.openEmpty();
  });

  document.addEventListener('shopify:section:deselect', (e) => {
    if (e.target.querySelector('[data-mini-cart]')) Cart.close();
    if (e.target.querySelector('[data-quick-view]')) QuickView.close();
  });
})();
