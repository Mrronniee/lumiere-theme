# Changelog

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
