# Changelog

## 1.6.1 — 2026-10-17

### Fixed
- Three faults introduced by 1.6.0 are gone. Slideshow arrows and dots had
  turned invisible (dark on dark) because the section recomputes its colours
  from a text setting it does not have — the ink is now derived from the
  background whenever a section has no text colour of its own. Gallery links
  built from the shipped preset had lost their name for screen readers. And
  the market banner, moved out of the flow to stop it shifting the page, was
  covering the last 54 to 75 pixels of every page: it now gives that space
  back and sits last in the tab order, where the eye finds it.
- Store pickup no longer empties itself when you pick another variant: the
  theme was asking Shopify for the wrong address, and a reply with no pickup
  now leaves what is on screen alone.
- Brand colours used as text (card titles, prices, secondary buttons, eyebrow
  links, sale prices) are recomputed per section, so a section with its own
  dark, inverted or accent background no longer prints them at 1:1.
- Secondary text no longer relies on opacity: 31 rules across 20 sections now
  use a derived colour, which keeps its contrast on any background. The review
  date and "Verified" line, measured at 4.45:1 and 4.21:1, are derived against
  the card they sit on.
- Cart drawer and cart page under a dark palette: six surfaces that were
  hard-coded light now follow your background, and the quantity and close
  buttons, which had no colour at all, no longer inherit the browser's black.
  The search and menu close buttons use panel ink instead of your brand
  colour.
- The video hero now has a pause button and stops for visitors who ask for
  less motion, like the video banner already did. It also declares its size
  and no longer pulls two megabytes of video before it knows it should play.
- The filter button now says whether the panel is open.
- Over-stock quantities show Shopify's own message ("Only 3 items…") instead
  of the theme's generic one: one cart endpoint returns it under a key the
  theme wasn't reading.
- After a form error the message takes the focus. Shopify's own anchor was
  stealing it back, so the theme now re-applies it.
- The footer logo is bounded like the header one: a tall logo made the footer
  grow from 387 to 1,087 pixels.
- Footer column titles are no longer headings, which removes the heading gap
  they created on eight pages out of nine.
- Editor: three inline scripts stacked one more document listener on every
  section reload — after two, the "forgot password" link stopped working.
- Image focal points are honoured in nine more places: product gallery, cart
  and drawer thumbnails, map, testimonials, reviews, featured product and the
  video banner cover.
- French editor labels: ten missing accents or apostrophes, three missing
  spaces before units, and the colon now takes its French spacing wherever a
  template writes it.
- Country, language and currency can be changed on phones: the selectors were
  simply hidden below 990px, with no replacement.
- Two fields were still under 16px (the cart note and the featured-product
  variant picker), so iPhones zoomed in on them; filter checkboxes on the
  search page were 13 by 13 pixels.
- The image zoom dialog has a name, the cart counter announces its change, and
  the one-pixel update button is out of the tab order.
- The page can no longer be dragged sideways on the demo page: the document
  clipped nothing, even though the body did.

### Performance
- The image of "image with text" loads immediately when its section is first
  or second in the page, not only first: on the demo page a text block comes
  before it and its image still carried the largest paint, at 4.3 seconds.
- Loading priority is no longer spent on cards that cannot be seen: the four
  cards of a featured collection placed further down the page, and the four
  recommendations on a product page, which sit two and a half screens down.
- Column images are now cropped by the CDN instead of by the browser: a
  900-pixel file was being painted 364 pixels wide and 70% of it thrown away
  (184KB per page). Lookbook images gained two intermediate sizes and a size
  hint that matches the tile, saving another 103KB.
- Product card titles reserve two lines in every card, so waiting cards and
  real cards have exactly the same height and the grid no longer grows by 21
  pixels when recommendations arrive.
- Cart thumbnails have a srcset instead of one fixed 200-pixel file.

## 1.6.0 — 2026-10-17

### Added
- Pickup availability on the product page: when your shop offers local pickup,
  each product now shows whether it can be picked up, at which store and how
  soon, with a list of your other stores. It follows the variant the shopper
  selects.
- A "Heading level" setting on the rich text heading block (H1, H2 or H3), so a
  page built from sections can carry its main heading.
- A "Custom Liquid" block on the product page, for your own snippet — a payment
  badge, a legal notice, a call to an app that has no block of its own.
- The featured product section now accepts app blocks.
- Image focal points set in Shopify admin are now honoured wherever an image is
  cropped: product cards, hero, slideshow, image with text, collection banner,
  lookbook, gallery, columns, blog cards and collection lists.

### Fixed
- Readability of text over images: slideshow captions sat as low as 2.9:1 on a
  pale photo. Slides and the video banner now keep a readability floor, like
  the hero, and it flips with the text colour — dark under light text, light
  under dark text.
- Colours now follow the section they are in. A section with its own dark,
  inverted or accent background kept the eyebrow, secondary text, borders and
  button ink derived from the theme background, which could fall to 1:1 — 70 of
  120 background combinations failed. Each section with its own background now
  recomputes them.
- Panels that were white whatever your palette: mobile menu, header dropdown,
  cart drawer, quick view, filter panel, sort control, market selectors, and
  the card buttons. With a dark first palette they turned white-on-white.
- Button ink on your primary colour is now computed instead of always white: a
  light primary left "Add to cart" at 2.2:1.
- Field borders now reach the 3:1 the standard asks (they were at 1.3:1), and
  every field is at least 16px so Safari on iPhone no longer zooms the page
  when you tap into one.
- The 404 page number was at 1.2:1, the inactive tab and the comparison note at
  4.5:1, the "Sold out" button at 2:1. All raised.
- Focus ring: ten sections replaced the theme's two-tone ring with a single
  accent outline, which fell to 2.1:1 on links over an image. The theme ring is
  back everywhere, and links over an image get a ring drawn on top of the
  picture.
- Touch targets under 24px: sort control, filter button, price bounds, comment
  fields, filter checkboxes and the gift-card checkbox.
- The mobile menu, search and filter panels now announce themselves as dialogs
  while they are open, and search has a name.
- "Remove" buttons in the cart and drawer now say which product they remove.
- Decorative placeholder illustrations are no longer announced by screen
  readers (24 of them on a collection page).
- The shop name in the footer was a level-3 heading, which created a heading
  gap on five pages.
- Product card: the magnifier and the heart (top of the image) now come before
  quick add (bottom) when tabbing, matching what you see.
- Quick add from a product card filled the cart without opening the drawer.
- A note typed in the cart drawer was never saved and vanished when you opened
  the cart page.
- With a discount code the cart read "Subtotal 391.50 − Discounts 43.50 = Total
  391.50": the subtotal was already discounted. The drawer now shows the
  discount and the total too.
- Asking for more than the stock left the wrong quantity on screen and showed a
  generic message instead of Shopify's own.
- After a form error, the focus stayed on the page body instead of moving to
  the message (contact, newsletter, comments). The contact form also marks the
  field at fault and explains the required asterisk.
- Sections whose behaviour lives in an inline script (tabs, FAQ, countdown,
  slideshow, video banner) stopped working after being reloaded in the theme
  editor.
- A section set to hide the vendor showed it anyway if it had been set before
  1.5.0.
- The featured product section no longer leaves an empty gap in the shop when
  no product is chosen.
- A tall logo overflowed the header by up to 144px and covered the page.
- French editor labels: 26 English words left untranslated, 39 missing accents,
  number and thousands spacing, and mixed apostrophes. The market banner no
  longer says "en États-Unis".

### Performance
- The market banner is no longer laid out in the flow: revealed after a request,
  it pushed the whole page down by 77px and was on its own 95% of the layout
  shift measured on every page (0.125 at 360px wide, for a 0.1 threshold).
- The image of "image with text" now loads immediately when the section opens
  the page: deferred, it carried a 5.8s largest-paint. Same for the first row of
  blog and collection lists.
- High loading priority is no longer spent on images that cannot be seen: the
  first slide of a slideshow placed further down the page, and the first
  product card of a featured collection, which was held at zero opacity even
  when animations are off.
- Waiting cards now reserve the vendor line, so the grid no longer grows by
  64px when recommendations arrive.
- Column images asked for 900px-wide files for a 247px slot on phones: 184KB of
  needless image per page.
- The hover image of a product whose second media is a video had no dimensions
  and no srcset.

## 1.5.2 — 2026-10-17

### Fixed
- Home page on phones with a transparent header: the menu button was invisible
  over the hero image. The button kept the browser's own black, so only its
  three bars were there, in black on a dark photo. It is now white like the
  rest of the header, and dark like the rest of it everywhere else.
- Market suggestion banner ("You seem to be in …") pushed the desktop menu
  aside: it was laid out inside the header row, which squeezed the navigation
  to a sixth of the page and broke link labels mid-word. It is now a
  full-width band above the header, like the announcement bar. It also shows
  on phones now, where it used to be hidden.
- "Show currency code" in theme settings now reaches every price. It only
  applied to product and collection prices; the cart, the cart drawer, the
  order summary, the price filter, the free-shipping bar, the gift card page
  and the prices redrawn by JavaScript all left the code out, so one line read
  "€38.00" while the collection read "€24.00 EUR". Every price in the theme now
  goes through one place.

## 1.5.1 — 2026-10-17

### Fixed
- Two sections were rejected by Shopify when the theme was pushed, so they
  never reached the store: "Product recommendations" and "Featured collection".
  A card setting was written as a comparison inside the section's own template
  call, which Shopify refuses to parse. The value is now worked out first. If
  you installed 1.5.0, reinstall 1.5.1: those two sections were missing.
- The wishlist icon in the header always pointed at /pages/wishlist. If your
  wishlist page has any other handle, the link went nowhere. You now pick the
  page in **Theme settings → Wishlist → Wishlist page**; /pages/wishlist is
  still used when the setting is left empty.
- Two British spellings in the English text: the wishlist empty-state message
  and one editor label.

## 1.5.0 — 2026-10-17

### Added
- Blog comments: when your blog accepts comments, articles now show the list of
  published comments and a comment form, with a clear message for each outcome
  (posted, waiting for approval, or in error).
- Search results: filters and sorting, the same ones as on a collection page.
  Your search term is kept when you filter.
- Gift cards: the product page now has the recipient fields Shopify expects
  (email, name, message, send-on date), so a gift card can be sent to someone
  else. The gift card page offers an Apple Wallet pass.
- Two standard sections: **Apps**, which hosts the block of any app in any
  template, and **Featured product**, which shows one product with its price
  and add-to-cart button.
- App blocks are now accepted in the product page, header, footer, cart
  summary, article and newsletter.
- Cart page: express payment buttons (Shop Pay, PayPal, Apple Pay) and the
  free-shipping progress bar, which only the cart drawer had.
- Cart drawer: the order note field, which only the cart page had.
- Phone menu: a third level of menu links, which only the desktop menu showed.

### Fixed
- Home page with a transparent header: the logo and menu were invisible
  (contrast 1.04:1). The header now sits over the first block when that block
  is a full-width image, video or slideshow, with a readability veil that keeps
  the text at 4.7:1 even over a white image. When the first block is not an
  image, the header keeps its background.
- "Show vendor" in theme settings now applies everywhere. Each section can
  inherit it, or force it on or off.
- Product recommendations no longer make the footer jump: the section reserves
  the space of the cards it is about to load, and only collapses when the
  response comes back empty.
- Account invitation: "Decline" worked only after filling in the password
  fields. It now works straight away.
- Forms (contact, account, address, comment, newsletter, password): the error
  block is announced to screen readers and takes the focus, every field in
  error points to its message, and required fields carry a visible mark.
- Announcement bar: with no text, it no longer renders an empty bar.
- Rich text: the editor hint ("add a heading, text or a button") no longer
  shows to customers, and a button with no destination is no longer rendered
  as a dead link.
- Footer: the social icon hover turned white text on the gold accent (2.0:1);
  it now picks the ink that reads. The muted text no longer relies on opacity.
  A link column with no menu no longer shows its title above nothing.
- Footer defaults no longer ship English text that showed on the French
  storefront.
- Cart: pressing Enter in a quantity field now updates the cart instead of
  going to checkout.
- Cart and cart drawer now show the same thing per line: the sale price is
  named next to the old one, the old price is struck through in the markup,
  the unit price (€/kg) appears, and line discounts are listed.
- Cart count in the header no longer goes stale after a browser Back.
- Predictive search now shows and announces a message when the request fails,
  instead of looking like "no results".
- Price filter now has its own removal chip, like every other active filter.
- Theme editor: selecting an FAQ question opens it; selecting the cart drawer
  or quick view opens it.
- Quick view and the product zoom no longer have their bottom cut off by the
  phone address bar.
- Long words, URLs and wide tables or embedded videos in rich text no longer
  push the page sideways.
- Collection and search card images: the first row loads immediately, the
  first one with priority, instead of all being lazy.
- Collection banner and article images now carry fetchpriority.
- Image sizes on the journal and collection list grids no longer ask for an
  image twice as wide as the one displayed.
- Favicon is no longer declared as PNG whatever the file you choose.
- Password page now uses its own layout and no longer waits for JavaScript.
- Addresses: "Delete" is a button, not a link to nowhere.
- Free-shipping bar is off by default: switching it on is a promise to your
  customers, so it is your choice to make.
- Removed a real-looking default phone number from the Map section and a fixed
  date from the Reviews section.
- Editor labels are in US spelling (color, gray) and spell out "and".
- French typography: non-breaking spaces before high punctuation and inside
  quotation marks.

## 1.4.5 — 2026-10-13

### Fixed
- Theme package: `config/settings_data.json` was missing. Shopify requires it
  in every theme. It is now included and keeps every setting at its default
  value, so the theme looks the same as before once installed.

## 1.4.4 — 2026-10-09

### Fixed
- Collection page on phones: the filter, sort and grid/list controls pushed
  the page 20 px wider than the screen, with sideways scrolling and the
  list-view button cut off. They now fit and wrap when space runs out.
- Search page on phones: the search button stuck out of the screen. The
  field now shrinks to leave it room.
- Header on very narrow screens (320 px): the icons pushed the page wider
  than the screen. The logo now gives way to the icons.
- Keyboard: the "Skip to content" link stayed invisible when focused. It now
  appears at the top of the page.
- Keyboard: the focus ring was invisible on dark surfaces (footer, lookbook
  links, market banner). It now has a light inner ring and a dark outer ring,
  visible on any background.
- Hover contrast: checkout, quick view "Add to cart", empty cart and 404
  buttons turned white text on the light gold accent (2.2:1). They now darken
  on hover instead.
- Phones and tablets: the wishlist heart on product cards was invisible on
  touch screens (it only appeared on mouse hover) while still receiving taps
  and keyboard focus. It is now always shown on touch screens.
- Search and newsletter fields: the placeholder text was too faint (1.9:1 and
  3.3:1). It now reaches the 4.5:1 contrast ratio.
- Newsletter email field: the focus ring was removed, leaving only a faint
  border change. It now shows the theme's focus ring.

## 1.4.3 — 2026-10-08

### Security
- Quick view: product option names and values are inserted as text, never
  as HTML.
- Product page: option names, values and the selected value, and the colour
  of option swatches, are HTML-escaped. So is the variant title in the cart
  page and the cart drawer.
- Security issues can be reported privately through
  https://kioskthemes.com/support/ rather than in a public issue.

### Fixed
- Line item properties (engraving, personalisation…) were never displayed,
  neither on the cart page nor in the cart drawer. They now are; hidden
  properties (names starting with "_") stay hidden.
- Quick view opened from a collection page: option buttons were unstyled
  (13 px native radio buttons). They now look and behave as on the product
  page.
- Home page as installed: the six lookbook links and the hero's second
  button pointed to pages and collections that do not exist on a new store
  (page not found). The lookbook links now open the catalogue; the second
  hero button appears once you give it a link.
- Theme editor in French: section categories in the "Add section" picker are
  translated.

## 1.4.2 — 2026-09-24

### Fixed
- Hero: the small line above the heading (pre-title) had no styling of its
  own and showed in the page's dark text colour on the dark hero (2.3:1
  measured). It now uses the theme's pre-title style, in the hero's text
  colour.
- Lookbook: the gradient behind each look's title and link now covers the
  whole text area. On light images the title fell to 1.9:1.
- Closing a dialog always returns keyboard focus to the button that opened
  it, even when the element that had focus before cannot take it back.

### Changed
- Product card images request the size actually displayed on phones
  (margins and column gap deducted): about half the image weight of a
  collection page on mobile.
- On touch screens, the second (hover) image of product cards is no longer
  downloaded.
- Product page gallery: a 720 px image size between 550 and 1100 px, and a
  mobile size that matches the gallery width.

## 1.4.1 — 2026-09-23

### Fixed
- Collection page: the filter panel was hidden from screen readers on desktop
  (it carried `aria-hidden="true"` although it is always visible there). It
  is now hidden only while the mobile filter drawer is closed.
- Header: the cart and wishlist links and the country, language and currency
  selectors now have accessible names that include their visible text
  (item count, country, language, currency).
- Contrast: the newsletter disclaimer and the option counts in the filters
  were too light (3.25:1 and 1.94:1 measured); both now pass 4.5:1.
- Heading order: product cards are level-2 headings under the page title of
  the collection, search and wishlist pages, level-3 elsewhere.

### Changed
- The first four product cards of a collection or search page load their
  image immediately, the first one with high priority, instead of lazily.
- Product card images request a size that matches the number of columns
  set for mobile.

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
