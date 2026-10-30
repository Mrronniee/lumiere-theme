# Changelog

## 1.9.4 — 2026-10-30

### Fixed
- **Multi-column images keep your focal point.** The column images were always
  cropped around the centre by the image server, so a focal point set off-centre
  in the admin could be cut away. They are now cropped at the server only when
  the focal point is the centre; otherwise the full image is served and framed
  around your focal point.
- **French typography.** Non-breaking spaces before the dash and the colon in
  the gift card QR code description and in four default texts of the French
  package.

## 1.9.3 — 2026-10-30

### Fixed
- **Palettes, focus rings and selected states measured on the demo.** The muted
  footer ink, the field borders, the newsletter placeholder, the sale badge and
  every selected state (variant, layout, current page, slideshow dot) are now
  derived so the measured pixels clear 4.5:1 and 3:1 in every color scheme. The
  focus ring of the filter price fields, the gallery thumbnails, the tabs and
  the slideshow button is drawn against the right neighbour.
- **Cart messages that were missing.** A quantity capped by stock, a quantity
  refused for stock and an entry typed during another update now all show and
  announce the theme's own message, in both languages.
- **Recommendations and the long menu.** Cut-off recommendations say so instead
  of collapsing silently, and the header folds its menu into the drawer before
  it overflows.
- **Cart link, overlays.** The cart trigger becomes a real button when the
  drawer takes it, and Escape closes one layer at a time.
- **Images.** Collection, lookbook, gallery, tabs and banner images ask the CDN
  for a file that matches the painted box: a portrait photo used as a
  full-width banner is cropped to 5/4 when the merchant's focal point is the
  centre, instead of shipping the cropped-away pixels.

## 1.9.2 — 2026-10-28

### Fixed
- **Gift card recipient fields have a 3:1 border.** The email, name and message
  fields of the gift card form on the product page kept the light 12 % divider
  (1.3:1); they now use the same input border as every other field. The variant
  selector declares the same border from its first rule.

## 1.9.1 — 2026-10-28

### Fixed
- **A color scheme now sets the buttons and borders of its sections.** The
  button, button label and border colors of a scheme were ignored: a section
  set to the dark scheme kept a dark button on its dark background. The
  countdown button and the slideshow controls of the default dark scheme now
  use its white button.
- **No more color pickers outside the schemes.** The newsletter field takes the
  input background of Theme settings > Input fields, the active tab and the
  rating stars take the scheme accent, and the hero and video banner overlay
  follows the scheme text (dark under light text, light under dark text).
- **The divider shows the page background again** by default, as before the
  color schemes; a new option uses the scheme background instead.
- **Rating stars read at a glance:** filled stars reach 3:1 on their card, and
  empty stars are drawn as outlines, so the rating no longer depends on color
  alone. Store pickup, the free-shipping bar, the current menu link and the
  active search suggestion get the same treatment.
- **Focus rings are no longer cut off** on product thumbnails, tabs, the
  country, language and currency lists, the mobile menu, the cart drawer, quick
  view, filters, the slideshow button, videos with controls and links in rich
  text tables.
- **Filters are announced with their name** by screen readers ("Color, Black,
  checkbox"), price range included. Search, account, password and selector
  fields have a 3:1 border.

## 1.9.0 — 2026-10-27

### Added
- **Color schemes.** Theme settings > Colors now holds color schemes: create,
  rename, reorder or delete them, and set each one's background, text, accent,
  button, button label and borders. The theme ships four schemes: light, ivory,
  light gray and dark.
- **Every section with its own colors picks a scheme** in one click (hero,
  slideshow and each slide, featured collection and product, footer,
  newsletter, countdown, video banner, FAQ, tabs, reviews and the others),
  instead of separate background and text pickers. Each default scheme
  reproduces the colors the section had before, so a new install looks the
  same. Text, links and borders inside a section are still adjusted to stay
  readable on its background.

### Changed
- The section color pickers (background, text, button, border, digits, icons,
  highlight) are replaced by the color scheme. If you update from an earlier
  version, sections whose colors you had changed return to their default
  scheme: choose or edit a scheme to get your colors back.

## 1.8.2 — 2026-10-27

### Fixed
- **Text and form fields stay readable on every color you choose.** Field text,
  borders and select arrows now take their color from the field background, the
  close icon of the market bar from the bar itself, and the video section keeps
  its paragraph at full reading contrast over any video. Focus rings are judged
  on the color right under them, including on slideshow dots and gallery
  buttons.
- **The wishlist page no longer loops, and no longer jumps.** With a saved item
  it kept reloading cards; empty, its footer moved after the page appeared.
- **Keyboard and dialogs.** Escape closes only the top layer, two open panels no
  longer fight over focus, the cart icon announces itself as a button, and the
  menu button of a condensed header now opens its menu at every width.
- **The cart drawer undoes a quantity change it could not save,** instead of
  showing a number the cart does not have.
- **Search results are laid out in a grid** — four, three or two columns, like
  collections — instead of one product per row.
- **Images load at the size they are shown.** The hero, slideshow, video
  section, image with text, lookbook and card hover images now ask for the
  width their cropped frame really needs; the hero preloads its poster, and the
  first row of a featured collection no longer fades in, so it paints at once.
- **The theme editor shows what you select.** Choosing a slide shows it,
  choosing a product tab opens it, a testimonial scrolls into view, and an empty
  section (announcement bar, slideshow, tabs, trust badges, a countdown without
  a date) tells you what it needs instead of disappearing. Placeholder blog posts
  are now shown in the editor only.
- **Default texts no longer make promises for you.** Shipping times, free
  returns, warranties, prices, a fixed countdown date, a sample street address
  and signed reviews were replaced with neutral text you can fill in. Translated
  fallbacks now show when you leave a button, tab or end-of-countdown text empty.
- **Smaller fixes.** The password page carries the browser theme color, empty
  contact and size-guide cells are no longer rendered, and the unused “Section
  spacing” setting was removed (it never changed anything).

## 1.8.1 — 2026-10-24

### Fixed
- **Gift cards now carry a QR code.** The recipient can have it scanned in
  store instead of reading the code out loud. It is drawn by Shopify's own
  encoder, served from their CDN — nothing is added to the theme files, and
  nothing to install. The printed card keeps the code in plain text, so a
  visitor without JavaScript loses nothing.

## 1.8.0 — 2026-10-24

### Added
- **A Follow on Shop button in the footer.** Visitors can follow your store in
  the Shop app. It is off by default, under Footer in the editor, and it carries
  Shopify's own label, so there is nothing to translate.
- **Subscription plans are named on cart lines.** If a customer chose a
  subscription — "Every month, save 10%" — the cart page and the cart drawer now
  say so on that line. Before, the line looked exactly like a one-time purchase
  at the subscription price.

### Fixed
- **Your password page shows the message you wrote.** The text you set under
  Preferences, Store password, was never displayed: visitors read the theme's
  generic sentence instead. Yours comes first now; the theme's is the fallback
  when you have not written one.
- **Keyboard focus is never hidden under the market bar.** The bar is fixed to
  the bottom of the window, and on a short screen it covered the control the
  visitor had just reached with Tab. The page now keeps a margin for it and
  scrolls that control clear.
- **The product gallery thumbnails work as a proper tab list.** They announced
  themselves as tabs without pointing at anything, and reaching the last photo
  took one Tab per thumbnail. Left and right arrows now move between photos, the
  whole gallery is a single tab stop, and each thumbnail names the photo it
  shows.
- **The video section loads a poster sized for the screen.** It was served at
  1920&nbsp;px to every visitor, phones included, although it is the first thing
  painted in that section. Same fix the hero got in 1.7.3.
- **Sorting a collection keeps your price filter.** The sort menu replayed the
  filter in cents, so "from 25" silently became "from 2,500" the moment a
  visitor sorted.
- **Wishlist sharing uses the right plural.** It read "I have 1 items in my
  wishlist!" with a single item, in both languages. French also puts zero in the
  singular, which a hand-written rule got wrong.
- **Tables you write in a page now scroll with the keyboard.** A wide table
  scrolls inside its own frame, but it could not take focus, so its right-hand
  columns were out of reach without a mouse.
- **The order tables on the account pages have a caption**, so a screen reader
  says what the table holds before reading it.
- **External links in the footer say they open a new tab**, as the map section's
  links already did.
- **Images below the fold are no longer loaded eagerly in the editor.** Five
  sections decided eager loading from the section's position, which Shopify
  leaves empty in the editor and in section reloads — so the test read false and
  the first image of the page was deferred instead.
- **Smaller work:** French typography (non-breaking spaces around ×, real
  ellipses), English quotes and file extensions written Shopify's way, French
  editor labels in sentence case, and two image sets trimmed from seven widths
  to six.

### Changed
- **The theme's stylesheet now loads before Shopify's scripts.** It sat after
  them, which delayed the first paint. One consequence worth knowing if you
  write your own CSS: at equal specificity a section's own rule now wins over
  the global stylesheet, where it used to be the other way round. Nothing in the
  theme relied on the old order.
- **Home page links point at a chosen resource instead of a written path.** The
  hero button and the six lookbook tiles pointed at `/collections/all` as text,
  so a visitor browsing in one language landed back in the other.

## 1.7.3 — 2026-10-24

### Fixed
- **Pages no longer scroll sideways on a phone.** The comparison table forced a
  720&nbsp;px width on small screens, and that width escaped its own scrolling
  box: the whole page could be dragged 275&nbsp;px to the side. The table still
  scrolls on its own, inside its box, and the page does not.
- **Your colour choices are respected on filled shapes.** Buttons, badges, the
  cart counter, pagination and the market bar picked their text colour between
  white and your body text colour only. On a dark palette both are light, so a
  light shape got light text — unreadable. A dark ink is now considered too, so
  a filled shape always gets the readable one.
- **Sale prices and form errors stay readable on any background.** The sale
  colour was used raw outside sections that set their own background, so sale
  prices on the collection grid, search, cart and product page — and every form
  error message, which shares the colour — could fall well below the contrast
  minimum. It is now derived from your background everywhere, as it already was
  inside sections.
- **Buttons without their own colour no longer turn black.** Two controls on the
  collection page fell back to the browser's default button colour, invisible on
  any dark palette. Every button now inherits the surrounding text colour, the
  way links already did.
- **The countdown respects its digit colour setting.** The colour was applied as
  typed, so leaving it white on a light section made the digits and the keyboard
  focus ring disappear. Digits, label and focus ring are now each derived for
  the surface they sit on.
- **Hero text stays readable over a light image.** The readability veil was fixed
  at one strength and one colour: white text over a pale photo sat just under
  3:1. The veil now follows your text colour — dark under light text, light under
  dark text — and is strong enough to hold the contrast minimum.
- **The hero loads its first image far faster on a phone.** The video poster was
  served at a single 1920&nbsp;px width to every screen, around 88&nbsp;KB more
  than a phone needs, and it is the largest thing the visitor waits for. It now
  comes in the size that fits the screen and is fetched at high priority.
- **The hero title no longer nudges the page as fonts load.** Your heading font
  is now requested early enough to arrive before the first paint.
- **Keyboard focus follows what you see in the hero.** The video pause button,
  painted bottom right, was reached before the heading and the call to action
  painted above it.
- **A long main menu no longer collapses into a column of single letters.** With
  eight entries the header squeezed each label until the text broke letter by
  letter and spilled out of the header, and it never switched to the collapsed
  menu because that depended only on window width. Labels now stay on one line
  and the menu collapses as soon as it genuinely does not fit, at any width.
- **Wishlist counts use the right plural.** It read "2 item" instead of
  "2 items" as soon as you had more than one, in both languages.
- **The login and address pages keep working after an editor reload.** The
  "forgot password" switch went dead every other reload, and deleting an address
  could ask for confirmation several times over.
- **Your image focal points are respected in three more places.** The cart
  drawer's suggestion thumbnail and the predictive search thumbnail ignored
  them; quick view now shows the whole image instead of cropping it, since it is
  filled in the browser where the focal point is not available.
- **Contact form entries survive an error.** The name and phone fields were
  named in the visitor's language, so Shopify could not refill them after a
  failed submission and what the visitor typed was lost. The label is still
  translated; the field name no longer changes with the language.
- **Sorting a collection works without JavaScript.** The sort menu had no form
  behind it, unlike the filters. It now submits on its own and keeps the filters
  the visitor had applied.
- **The cart says so when something fails.** Saving an order note failed in
  silence from the cart drawer, and after a failed quantity change the field
  kept showing a quantity the cart did not have.
- **Screen readers announce the cart link and the two menus correctly.** The
  cart link's name left out the item count it displays, the header menu and the
  mobile menu were both called "Menu", and the market bar sat outside every
  page landmark.
- **The free shipping bar is visible on the cart page.** Its progress was almost
  indistinguishable from its track, as it had already been fixed in the drawer.
- **Focus rings on the product gallery arrows no longer sit on your photo.**
  They are drawn inside the button's own plate, like the theme's other controls.
- **Hover images on product cards are sharp on desktop.** They stopped one size
  short of the main image while claiming the same display width.
- **Lookbook tiles load the right image size.** One description was used for six
  different tile widths, so the large tile came out soft and the small ones
  loaded far more than they showed.

## 1.7.2 — 2026-10-23

### Fixed
- **"Hide unavailable variants" now works with drop-down selectors.** The
  setting only filtered the button and swatch selectors: if you had chosen
  drop-downs, every option value stayed in the list, so a size with nothing
  left to sell still looked buyable. Both selectors now read the setting from
  the same source — a value is available as soon as one sellable variant
  carries it.
- **With the setting off, an unavailable option value now says so.** It used to
  look exactly like the others in both selectors. It is now struck through and
  dimmed as a button, greyed out in a drop-down, announced as unavailable by
  screen readers, and it cannot be selected or added to the cart.
- **Quick view follows the same rule.** It built its option list in the browser
  from the full variant list, so it showed values the product page was hiding.
- **Your footer menus are now proper navigation landmarks.** Each footer link
  column is a `<nav>` named after the heading you gave it, so screen reader
  users can jump straight to it and tell two columns apart.
- **Reduced motion now really stops the movement on hover.** Asking your system
  for reduced motion only shortened the animations: cards, images and buttons
  still jumped to their enlarged or shifted position instead of sliding there.
  Nothing slides, zooms or rotates on hover any more under that preference —
  the fades, colours and shadows stay.

## 1.7.1 — 2026-10-23

### Fixed
- **The video pause button of the hero banner was dimmed by half.** Its
  controls were painted *under* the banner's readability veil, so a white
  button rendered mid-grey: its border, its icon and its focus ring all came
  out the same grey, and nothing told you where the keyboard was. The controls
  now sit above the veil, and the focus ring measures 15.8:1 against the button
  instead of 1.2:1.
- **The focus ring of the slideshow arrows, its dots and the video banner
  button no longer depends on your image.** Those four controls drew a
  single-colour ring *on top of* the picture or the video, so the ring faded
  into a light slide (2.5:1 on a pale photo, and anywhere from 6.6 to 14.5:1
  depending on the video frame). The arrows and the banner button now carry the
  ring inside their own opaque plate, and the dots — which have no plate — carry
  a two-tone ring, light outside and dark against the mark, so one of the two
  always stands out whatever the slide. Measured on every side: 15.8 to 16.7:1
  for the three buttons, 9.9 to 16.7:1 for the dots.
- **Nothing lands under the sticky header any more.** The document carries a
  `scroll-padding-top` equal to the measured header height, so a skip link, an
  anchor or Shift+Tab to the top of the page never leaves the focused element
  half hidden (WCAG 2.4.11).
- **The video banner no longer downloads the video when a cover image exists.**
  `preload="metadata"` was pulling 1.07 MB of video on page load even when you
  ask for reduced motion and the video stays paused — 2.18 MB otherwise. The
  hero banner was already fixed in 1.6.4; the banner had the same defect.
- **The three-column tablet layout of the multi-column section was dead.** A
  stray selector list with no rule swallowed the media query that set it (since
  1.6.2), so tablets fell back to the desktop column count.

## 1.7.0 — 2026-10-23

### Action required if you are updating over 1.6.4 or earlier
- **The header and the footer are now section groups.** You can add, remove and
  reorder sections inside them from the theme editor, which a static header
  could not do. Their settings move out of the theme settings file into
  `sections/header-group.json` and `sections/footer-group.json`, so after the
  update open Customize → Header and Footer once and set them again if they came
  back to the defaults (`Main menu` for the header menu, `Footer` for the footer
  column, and your announcement bar text).

### Added
- **Header and footer section groups.** `sections/header-group.json` (type
  `header`: the announcement bar, then the header) and
  `sections/footer-group.json` (type `footer`). The layout now calls
  `{% sections %}` instead of three static `{% section %}` tags, which is what
  lets you compose both areas in the editor.

### Changed
- **The customer reviews section no longer writes `Product` structured data.**
  Those reviews are typed by you in the editor, so the rating was built from
  editor settings rather than from verified buyers, and the product was marked
  up on a page that does not sell it. Both are against Google's review snippet
  policy, and a page can only carry one `Product`: the product page keeps its
  own markup.
- **Blog articles now carry `BlogPosting` structured data**, rendered by
  Shopify's own `structured_data` filter, so the title, image, dates and author
  are readable by search engines.
- **Hover effects now apply with a mouse only.** On a touch screen the `:hover`
  state sticks after the tap, so the product card stayed zoomed, the wishlist
  button enlarged, the lookbook image scaled, the add to cart and the 404 button
  stayed lifted, the product thumbnail looked selected, and the header chevron
  stayed turned — even after going back.
- **The unit price stays visible in the cart on a phone.** It was hidden below
  750 px and appeared nowhere else, so a customer ordering three of an item only
  saw the line total. Google indexes the mobile version of a page.
- **Scroll reveals start slightly earlier.** The observer used a negative bottom
  margin, so an element already at the bottom of the screen waited for a scroll.

### Fixed
- **The search overlay is announced as a modal window.** It trapped Tab without
  `aria-modal="true"`, so a screen reader walked out of the window while the
  keyboard stayed inside it.
- **Escape closes an open header dropdown** and gives the focus back to the menu
  item it belongs to.
- **The country, language and currency menus close when the focus leaves them**,
  instead of staying open behind the rest of the page.
- **The slideshow is no longer cut off at high zoom.** At 400 % the window is
  only about 256 px tall, and the fixed `vh` height clipped the slide title.
  Below 500 px of height the slide now grows with its text; in fade mode the
  slides share one grid cell so the strip keeps a height.
- **One `h1` per page.** The hero, contact and wishlist sections can each be
  added only once now, and the contact and wishlist titles drop to `h2` when the
  section is not the first of its template: added under a page that already has
  its title, they used to add a second `h1`.

### Note
- The 1.6.4 entry below was dated 2026-10-23 by mistake; it was released on
  2026-10-22.

## 1.6.4 — 2026-10-22

### Action required if you are updating over 1.6.3 or earlier
- **Free shipping threshold.** You now type it in your store currency, not in
  cents: `100` means 100.00. If your setting still holds a value in cents,
  divide it by 100 — a saved `10000` would otherwise ask for 10,000.00 before
  shipping becomes free. The label said "(cents)", which meant a merchant who
  typed `100` expecting 100.00 was giving free shipping from 1.00.
- **Wishlist page.** The theme no longer guesses a `/pages/wishlist` address
  when the setting is empty. Pick your wishlist page under Theme settings →
  Wishlist; until you do, the wishlist links stay hidden rather than leading to
  a page that may not exist in your store.

### Changed
- **Quick view and quick add are always visible on product cards.** They only
  appeared on hover on a computer, while they were already visible on a phone:
  a control that exists only on hover cannot be reached any other way, and its
  focus ring could not be measured because the whole button was repainted over
  the photo when it appeared.
- **Lookbook tiles show their title at rest on a computer**, as they already did
  on a phone, for the same reason.
- **Card badges keep their corner, the two buttons move to the opposite one.**
  The badge and the quick-view button shared the top-left corner, with the badge
  underneath: "On sale" measured 1.05:1 over the button once the button became
  visible. The buttons are stacked in reading order, so tabbing follows what you
  see.
- **The pause buttons of the hero and the video banner have a solid plate.**
  Their translucent background let the video decide the contrast of the icon,
  which measured 2.93:1 against a threshold of 3:1 and changed from one frame to
  the next.
- **The free shipping bar only shows when the customer pays in your store
  currency.** The threshold is a figure in your currency, so comparing it to a
  cart priced in another one gave a wrong amount remaining to every customer in
  another market.
- **Slideshow auto-rotation cannot be set below 5 seconds** (the slider started
  at 3).
- The contact form's button falls back to a translated label instead of the
  English word "Send" when you clear the field.

### Fixed
- **Filters of the "boolean" kind rendered an empty group** — a title and a
  chevron with nothing under them. In-stock style filters now list their values,
  and any filter kind Shopify adds later will too.
- **The highlighted column of the comparison table had invisible text.**
  "Signature", "€59" and "Our most popular offer" measured 1:1, dark on dark.
  That column is painted in your highlight colour while its cells use a tinted
  version of it: each ink is now derived against the surface it is actually laid
  on. The check and cross marks and the countdown unit labels had the same
  fault.
- **Focus rings over a photo.** On the card buttons, the slideshow arrow and the
  hero button, the ring was drawn outside the button, over the product image, so
  its contrast depended on the picture: 17.4:1 on a dark photo, 1.69:1 on a
  light one. These buttons all have an opaque plate, so the ring is now drawn
  inside it and measures 16.5:1 whatever the image.
- **A product both on sale and sold out** stacked its two badges exactly on top
  of each other.
- **The newsletter field's focus ring merged into the button below it** on a
  narrow screen, where the two are stacked.
- **An open FAQ answer sat flush under its question**, so the focus ring of the
  question was drawn across the first line of the answer.
- **A cart error that Shopify answers with a page instead of data** left you
  with no message and a line still showing the refused quantity. The four cart
  calls now read the answer without assuming it is data.
- **The addresses page is paginated.** Past 50 saved addresses, the rest simply
  did not appear.
- The search overlay has an accessible name before the scripts run.
- The video banner's cover image is no longer loaded lazily when the section
  opens the page, which delayed the largest image of the first screen.

### For developers
- All 24 rendered snippets now carry a `{% doc %}` header with typed
  `@param`s, so Theme Check verifies their variables and arguments.
- `INSTALLATION.md` ships with the theme.

## 1.6.3 — 2026-10-18

### Fixed
- The focus ring is back on the controls that sit on a photo or a video. In
  1.6.2 its outer tone followed the ink the section computes, which is white on
  a section whose text is light — so both tones of the ring were white, and on
  the lookbook tiles it measured between 1.23:1 and 1.81:1. Over an image no
  colour derived from your palette can promise anything, so those controls use
  a fixed dark-and-white pair again; inside a section, where the ring is
  measured against a known background, it still follows the section's ink.
- The ring also no longer fades in. `box-shadow` was listed among the
  transitions of nine components, so the ring took up to 0.3 second to appear —
  long enough to be missed by someone tabbing quickly, and it measured as absent
  on the quick-view and quick-add buttons of product cards.
- The small round controls over a video or a photo — the hero's pause button,
  the slideshow arrows and dots, the wishlist heart and the card buttons — take
  an opaque plate when focused, so their icon no longer depends on the frame
  behind them (the pause button measured 1:1).
- The highlighted column of the comparison table had invisible text: "Our most
  popular offer" measured 1:1, dark ink on the dark surface of that column,
  because 1.6.2 derived the muted ink against the section background instead.
  Its title, price, subtitle and details are now derived against the column's
  own surface.

## 1.6.2 — 2026-10-18

### Fixed
- Brand colours used as ink are no longer printed raw. The header icons, the
  search field you type into, the wishlist heart and the quick-view and
  quick-add buttons on product cards took your brand colour, or no colour at
  all, and measured between 1.06:1 and 1.79:1 under a dark palette — the
  quick-view and quick-add icons had no `color` declared, so the browser used
  its own black. They now follow the ink the section computes. The "On sale"
  badge had white text hard-coded and fell to 2.47:1 once the sale colour is
  recomputed per section; its ink is now derived from the badge itself.
- The focus ring is visible again on every control. A component that declares
  its own `box-shadow` — a button, the wishlist heart, the newsletter button —
  was erasing the white half of the two-tone ring, and the dark half was your
  brand colour, which on a dark section measured 1.00:1. The ring is now put
  back after the component, and it follows the section's ink; over a photo or a
  video it uses a fixed white-and-dark pair, which no image can swallow.
- Cart drawer and cart page: the "Tax included", "View cart" and shipping notes
  measured 4.37:1 because their muted ink was derived against the page
  background, not against the lighter surface they sit on.
- The comparison table: "not included" was marked only by an icon at 35%
  opacity (2.20:1), and two more texts relied on opacity. All three now use a
  derived colour.
- The page could be dragged sideways on the sections page: 665 pixels of
  scrollable width for a 390-pixel screen, and it really scrolled on a narrow
  desktop window and at 400% zoom. The cause was the comparison table's
  scrolling box, which was imposing its content's width on the document.
- The free-shipping progress bar was 1.53:1 against its track, and its text was
  announced by nothing; it now carries the derived accent ink and `role="status"`.
- The active tab took the colour you choose without any contrast correction
  (2.03:1 on an accent background).
- The localization form was rendered twice, so `MarketForm` was a duplicated id
  on every page; it is now rendered once. Escape on the market panels of the
  mobile menu gives the focus back to the button that opened them.
- After a form error, the focus really lands on the error summary. The retry
  window added in 1.6.1 was too short — something takes the focus back later —
  and a hidden error container from another form could be picked instead of the
  visible one.
- The video banner's guard against double initialisation was global, so after a
  section reload its pause button went dead and a second video banner on the
  same page never started. The login and address sections never received their
  guard at all.
- Address fields: eight inputs glued `autocomplete` to the attribute before it.
- Links written as a plain path in a shipped template sent an English shopper to
  the French storefront; every link setting is now rendered in the language
  being served.
- Three French strings: a pair of apostrophes used as quotation marks, and the
  last two colons of cart line properties, which needed a non-breaking space.
- Product gallery images and thumbnails honour the focal point set in Shopify
  admin, like the rest of the theme.

### Performance
- The hero video no longer downloads 2,128KB before anyone asks for it. With
  `preload="metadata"` the browser pulled two HLS variants — 581KB and 1,596KB,
  half the bytes of the home page — even for visitors who ask for less motion,
  for whom the video never plays.
- Loading priority is no longer spent on four cards that start below the fold
  and at zero opacity.
- Lookbook and "image with text" describe the width they really paint: a tile
  was being served 650 pixels for 1,066, and the largest image of the page 750
  for 1,085. Column images gained two intermediate sizes, so a 364-pixel tile
  no longer receives a 900-pixel file.

## 1.6.1 — 2026-10-18

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
- The lookbook showed no images at all. A Liquid comment written inside the
  `<img>` tag trimmed the whitespace on both sides, so the tag was rendered as
  `<imgsrcset="…"` — an element no browser knows. Nine other places glued one
  attribute to the next in the same way (blog cards, collection list,
  collection banner, image with text, slideshow, video banner), and in four of
  them the focal point landed as `loading="eager"style="object-position:…"`.
  Comments and conditional attributes now keep the space that separates them.
- The slideshow no longer asks for a section setting it does not have. Its
  text colour is set per slide, so the colour tokens of the section were being
  computed from `section.settings.text_color`, which is always empty; they are
  derived from the background instead, which is what the page already showed.
- Three French editor labels had lost their accent: "panneau latéral",
  "Tiroir latéral" and "Onglet dépliant".

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
