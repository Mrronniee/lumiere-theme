# Changelog

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
