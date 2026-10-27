# Installing LUMIERE

LUMIERE is a free Shopify Online Store 2.0 theme by [KIOSK](https://kioskthemes.com).
Installing takes about ten minutes.

## 1. Upload the theme

1. In your Shopify admin, go to **Online Store → Themes**.
2. Under **Theme library**, click **Add theme → Upload zip file**.
3. Select `lumiere-theme.zip` (the file inside this download — not the outer zip).
4. Wait for the upload to finish. LUMIERE appears in your theme library as a
   draft. **Your live theme is untouched.**

## 2. Preview before you publish

Click **⋯ → Preview** on the LUMIERE card. Nothing your customers see changes
until you click Publish, so take your time here.

## 3. Create two pages

These two matter — without them, a link in the header leads nowhere and the
contact form never appears. In **Online Store → Pages**, create each page and
pick its template in the **Template** dropdown on the right:

| Page to create | Handle     | Template to assign |
| ---            | ---        | ---                |
| Contact        | `contact`  | `page.contact`     |
| Wishlist       | `wishlist` | `page.wishlist`    |

Everything else — product, collection, collection list, search, blog, article,
cart, 404, password, gift card and the whole customer account area — is already
included and needs no setup.

## 4. Set up your menu

The main menu is set in **Customize → Header → Menu**. It drives the desktop
navigation, its dropdowns (two levels supported) and the mobile drawer.

## 5. Make it yours

Open **Customize**. Everything below lives in **Theme settings** (the gear icon
at the bottom of the left sidebar):

| Where | What you get |
| --- | --- |
| Colours | Four tokens drive everything: primary, accent, background, text. Borders, secondary text and overlays are derived from them. |
| Typography | Heading and body fonts from the Shopify library. Playfair Display and Inter by default. |
| Theme style | *Density* (compact, comfortable, spacious) multiplies every spacing value at once; *border style* switches the hairlines between none, hairline and bold. |
| Layout · Buttons · Inputs · Icons · Badges | Container width, corner radius, button case and border, field background, icon stroke width. |
| Product cards | Image ratio, text alignment, vendor. |
| Prices | Currency code, "from" prefix on variable prices, sale display (colour, badge, or both). |
| Variant pickers · Color swatches | Buttons or dropdown, hide unavailable variants, swatch size and shape, and the colour mapping below. |
| Cart · Drawers | Side drawer or dedicated page, order note, free-shipping threshold, drawer width and side. |
| Shopify Markets | Country, language and currency selectors. |
| Animations · Popovers and modals · Search · Custom CSS | Reveal style and duration, overlay opacity, results per page, and a free-form CSS box. |

### Color swatches, in one sentence

Under **Theme settings → Color swatches**, map your product option values to
hex codes, one per line:

```
Ecru: #f0e9dd
Navy: #1f2a44
```

Matching is case-insensitive. A value that is already a valid CSS colour
(`black`, `#c0392b`) works without mapping, and anything unmapped falls back to
a neutral grey rather than disappearing.

## 6. Build your pages

Click **Add section** on any template. LUMIERE ships 28 sections, each with a
ready preset: slideshow, hero, lookbook, gallery, multi-column, tabs, rich text,
image with text, video banner, testimonials, reviews, FAQ, logo list, trust
badges, comparison, countdown, size guide, map, featured collection(s), related
products, blog posts, newsletter, contact, wishlist, divider and custom Liquid.

Two notes:

- The **Map** section embeds no third-party frame on purpose. You supply a static
  image of your map and a link to the maps app of your choice, so nothing about
  your visitors leaves the store on page load.
- The **Custom Liquid** section is not checked by the theme. A syntax error there
  can break the page, so always preview before publishing.

## 7. Publish

When you are happy: **⋯ → Publish** on the LUMIERE card.

---

## Good to know

- **Works without JavaScript.** Collection filters, variant selection and the
  cart keep working; the drawer falls back to the cart page.
- **Accessible by build.** Every drawer and modal traps focus and restores it on
  close, the tabs section follows the ARIA pattern, tables are real tables with
  headers, and animations respect `prefers-reduced-motion`.
- **English and French included**, storefront and theme editor both. Any other
  language goes through **Settings → Languages → Add language**, then
  **Online Store → Themes → ⋯ → Edit default theme content**.
- **Product media.** Video and 3D models are supported in the product gallery.
- **No external dependencies.** No jQuery, no CDN, no tracking, no map iframe.

## Support

LUMIERE is free, so support is best-effort with no guaranteed response time:
[kioskthemes.com/support](https://kioskthemes.com/support/)

The full guide also lives online at
[kioskthemes.com/docs/lumiere](https://kioskthemes.com/docs/lumiere/).
