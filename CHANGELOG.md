# Changelog

## 1.4.0 — 2026-09-23

### Added
- Account component in the header: Shopify's `<shopify-account>` replaces the
  account icon, on desktop and mobile. Shoppers sign in (passwordless, Shop,
  social providers) and open their account menu without leaving the store.
  Colours and fonts follow the theme settings. Required by the Shopify Theme
  Store since 30 July 2026.
- "Tax included" notice: the product page, the quick view, the cart page and
  the cart drawer now say whether taxes are included in the prices (a store
  setting), with a link to your shipping policy when you have one.
- The cart drawer shows line item properties (personalisation, engraving…),
  like the cart page.
- The order note is saved to the cart as soon as it is typed, so it also
  reaches checkout when the shopper checks out from the drawer.

### Changed
- Cart page: every line, the totals and the discounts refresh after each
  quantity change or removal. The refreshed sections come back with the cart
  request itself, so they can never show an older cart. Keyboard focus stays
  on the control that was used, and a note being typed is kept.
- Prices updated by JavaScript (variant change, quick view) follow the currency
  shown to the shopper (Shopify Markets), not only the store currency.
- Footer: a fresh install shows the brand block and a "Quick links" column
  using the `footer` menu; the section can no longer be added a second time
  from the theme editor.
- The product page title is larger than the section titles below it, so the
  heading levels stay visually distinct.
- Theme editor in French: translated and accented labels (En-tête, Pied de
  page, Liste déroulante, Aperçu rapide, Favoris); two helper texts are now
  shown under the countdown and slideshow button settings.

### Fixed
- The header wishlist link on a translated page went to "/enpages/wishlist"
  (404).
- Wishlist cards and the quick view loaded the product in the store's default
  language on translated pages.
- Hidden line item properties (names starting with "_") were displayed in the
  cart.
- The theme overwrote Shopify's currency object (`Shopify.currency.rate` became
  the currency code), which could mislead apps reading it.
- Closing the search, the mobile menu, the quick view, the image zoom or the
  filters now returns keyboard focus to the button that opened them, even
  when that button had not received focus (Safari, mouse users).
- Accessibility: the cart drawer quantity field and the collection filter
  checkboxes have an id and a label; slideshow dots, product card titles,
  text buttons and sub-menu links reach 24 × 24 px touch targets; the page
  title of a tagged collection no longer contains a hard-coded English word;
  search results show article excerpts.

## 1.3.1 — 2026-09-21

### Fixed
- Order page of classic customer accounts: the price and total of each item
  now include the automatic discounts and discount codes applied to that
  item. Before, a discounted item was shown at its price before the
  discount, so the item totals did not add up to the subtotal below them.

## 1.3.0 — 2026-09-19

### Added
- Predictive search in the header search: from the second letter typed,
  matching products (image, title and price), collections, pages and journal
  articles appear under the field, followed by a "View all results" link to
  the search page. Results come from your store in the shopper's language and
  currency. New setting: **Theme settings → Search → Enable predictive
  search** (on by default).
- Keyboard and screen readers: the up and down arrow keys move through the
  suggestions, Enter opens the highlighted one, and Escape closes the list
  (a second Escape closes the search, as before). The number of suggestions
  is read aloud as it changes.

### Changed
- Pressing Enter in the header search now also finds products from the
  beginning of the last word ("dres" finds "dress"), matching the
  suggestions. Without JavaScript, or with predictive search turned off, the
  search form still takes shoppers to the search page.

## 1.2.4 — 2026-09-18

### Fixed
- Cart and predictive search: the store's currency, address, language and the
  cart/search endpoints were written as plain quoted text in the page script.
  On a store with an apostrophe, quote or accent in its name or domain, or on
  a non-English storefront, this could silently break "Add to cart" and
  search. These values are now passed through safely, so the cart and search
  keep working whatever the store's address or language.

## 1.2.3 — 2026-09-17

### Fixed
- Cart drawer, keyboard and screen readers: focus now moves into the drawer
  when it opens, stays inside it while you press Tab (even with a cookie banner
  or chat widget on the page), and returns to the button that opened it when
  you close it. Escape always closes the drawer, including after adding a
  product or changing a quantity. The drawer is announced by name.
- "Added to cart" and other messages are now read aloud by screen readers.
- Text contrast: headings, eyebrows, links on hover and secondary grey text are
  adjusted automatically to stay readable (WCAG AA) on the colours you pick,
  light or dark, without changing your accent colour on buttons and borders.
  The lookbook eyebrow follows the lookbook's own background colour.
- The hero keeps its text readable over light photos, and uses a single main
  heading per page: the hero title is the page heading on the home page only.
- Decorative icons (header, footer, trust badges) are no longer read out by
  screen readers. The quick view window is announced by name.
- Market suggestion banner: the country name now appears in the shopper's
  language ("Switzerland" on the English store, "Suisse" on the French one).
- Default texts of the hero, featured collection, lookbook, newsletter,
  related products and footer copyright now come from the theme's language
  files, so a French store shows them in French. Your own texts are unchanged.
- Settings still in English in the French editor are translated: express
  payment buttons on the product page and size guide rows.
- French punctuation uses the proper non-breaking space before ":", "?" and "!".
- The map section's example address is a neutral placeholder.
- Testimonial and tab carousels no longer start slightly scrolled on page load.
- Apostrophes showed up literally as "&#39;" in some translated texts — the
  newsletter button, titles and placeholder, the featured collection and
  lookbook headings, the video banner, and the cart and quick view labels.
  They now display as apostrophes.

## 1.2.2 — 2026-09-03

### Fixed
- 83 strings still in French across 19 files are now English, mostly section presets a merchant sees when adding a section: FAQ, offer comparison, multi-column, slideshow, reviews, tabs, map and newsletter. Prices in presets use the English currency format. No setting id, option value or template changed.

## 1.2.1 — 2026-08-20

### Fixed
- 24 strings still in French in the home page template — hero, collection,
  lookbook and newsletter — visible the moment the theme is installed.

## 1.2.0 — 2026-08-20

### Added
- Payment method logos in the footer, taken from the methods your store
  actually accepts. New setting: **Show payment method logos**.
- Unit price on the product page and on product cards — required in the EU
  (Directive 98/6/EC) for anything sold by weight, volume or length. It appears
  only when you have set a unit of measure on the variant, and follows the
  selected variant.
- Complementary product recommendations. The product recommendations section
  now has a **Recommendation type** setting — *Related* (automatic) or
  *Complementary*, the ones you pair by hand in the free Shopify Search &
  Discovery app. Add the section twice to show both.

### Fixed
- Text left in French in an English theme: 102 strings the merchant or the
  shopper could see — section names and demo content in the editor, screen
  reader labels, and a few strings written straight into JavaScript.

### Fixed
- Payment logos in the footer had no on/off setting and were not exposed as a
  list to screen readers.

## 1.1.0 — 2026-08-20

### Added
- Express payment buttons on the product page (Apple Pay, Google Pay, Shop Pay
  and any other accelerated method enabled in the store). Buyers check out in a
  single tap, without creating an account or typing card details.
- Shop Pay Installments banner underneath the buttons, shown automatically when
  the store is eligible.
- New product section setting, **Show express payment buttons**, enabled by
  default. Turn it off to keep a single add-to-cart flow.

## 1.0.0 — 2026-08-16

First public release.

### Added
- 28 addable sections: slideshow, hero, lookbook, gallery, multi-column, tabs,
  rich text, image with text, video banner, testimonials, reviews, FAQ, logo
  list, trust badges, comparison, countdown, size guide, map, featured
  collection(s), related products, blog posts, newsletter, contact, wishlist,
  divider and custom Liquid.
- 74 theme settings across 24 groups — colours, typography, theme style
  (density and borders), layout, buttons, inputs, icons, badges, product cards,
  prices, variant pickers, colour swatches, cart, drawers, popovers and modals,
  animations, search, wishlist, social media, Shopify Markets, custom CSS.
- AJAX cart drawer re-rendered server-side through the Section Rendering API,
  with upsells and a free-shipping progress bar.
- Wishlist kept in the browser, with a dedicated page, share link and header
  counter. No account and no app required.
- Quick view with variant picker and add to cart.
- Shopify Markets: country, language and currency selectors wired to Shopify's
  own localization form.
- Complete English and French translations — 281 storefront strings and 895
  theme-editor labels.
- Full customer account area, plus search, blog, article, collection list,
  password and gift card templates.

### Notes
- No external dependencies, no tracking, no CDN call, no map iframe.
- Every drawer and modal traps focus and restores it on close; the tabs section
  follows the ARIA pattern; animations respect `prefers-reduced-motion`.
- Filters, variant selection and the cart keep working without JavaScript.
