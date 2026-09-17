# Changelog

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
