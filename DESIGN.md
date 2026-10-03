# DESIGN.md: Limitless Speech & Language Therapy

The design system for this site, written so a person or an AI agent can extend it
without drifting. Tokens live in `src/styles/global.css`. If a change needs a value
that is not listed here, add it to the tokens first.

## 1. Visual theme & atmosphere

Calm, confident, clinically credible, and warm without being childish. A solo
clinician's practice presented with the restraint of a high-end studio: generous
space, one strong headline per section, real facts instead of decoration.

The signature element is the **voice field** in the hero: fine ridgelines like sound
waves, with one line in cobalt (a single voice). It breathes at rest, swells around
the cursor, and grows as the visitor scrolls. It is the only illustrative device on
the page; everything else is typography, space, and one real photograph.

Density is low. Motion is present but always explains something.

## 2. Color palette & roles

One neutral family, one accent. Light and dark themes follow the system setting.
The page never inverts mid-scroll.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f6f6f3` | `#0b121c` | Page background |
| `--bg-alt` | `#ecf0f4` | `#101a27` | Alternating bands (Services, Contact) |
| `--surface` | `#fcfcfa` | `#131f2e` | Raised panels: form card, process card, tags |
| `--ink` | `#0e1a2b` | `#e8edf3` | Headlines and primary text |
| `--ink-2` | `#3f4b5d` | `#b3becb` | Body copy |
| `--ink-3` | `#5f6b79` | `#8794a4` | Labels and small print (AA on `--bg`) |
| `--accent` | `#1e5fcf` | `#7aa6f7` | The only accent: primary buttons, the cobalt line, icons |
| `--accent-text` | `#1a55bc` | `#8db4fa` | Accent used as text or links |
| `--accent-soft` | `#dde7f8` | `#1a2b47` | Tinted panel (second process card) |
| `--on-accent` | `#fbfcfe` | `#0b121c` | Text on accent fills |
| `--line` / `--line-strong` | ink at 12% / 24% | light at 12% / 24% | Hairlines, tinted to the ink (never neutral grey) |

The cobalt comes from the logo. Do not introduce a second accent colour, gradients,
or glows.

## 3. Typography rules

Single family: **Host Grotesk** (variable 300 to 800), self-hosted. Hierarchy comes from
size, weight and tracking, never from a second typeface.

| Style | Class | Size | Weight | Tracking | Leading |
|---|---|---|---|---|---|
| Display (hero) | `.t-display` | 44 to 76px fluid | 500 | -0.045em | 0.98 |
| Section heading | `.t-h2` | 34 to 60px fluid | 500 | -0.038em | 1.02 |
| Approach statement | `.approach__statement` | 30 to 56px fluid | 450 | -0.034em | 1.12 |
| Subsection | `.t-h3` | 21 to 28px fluid | 500 | -0.024em | 1.15 |
| Lede | `.t-lede` | 18 to 22px fluid | 400 | -0.016em | 1.45 |
| Body | `body`, `.t-body` | 16 to 17px | 400 | -0.006em | 1.6, max 62ch |
| Label | `.t-label` | 15px | 500, accent | -0.01em | |

Rules: sentence case everywhere; headings use `text-wrap: balance`, paragraphs
`text-wrap: pretty`; phone numbers use tabular figures; no all-caps tracked eyebrows;
no em or en dashes in visible copy. Editors type plain quotes and the build converts
them to typographic quotes.

## 4. Component stylings

- **Buttons:** fully round pills. Primary is solid `--accent` with an arrow that nudges
  up-right on hover; secondary is a hairline ghost pill. Heights 54px (44px small).
  Press state scales to 0.98. One label per intent across the page:
  "Request an appointment" (contact), "Call 908-331-3122" (phone), "Send message" (form).
- **Header:** transparent over the hero, becomes a blurred `--bg` bar with a hairline
  after scrolling, hides while reading down and returns on scroll up. Nav links grow an
  underline from the left on hover and for the current section.
- **Accordion (Services):** full-width rows separated by `--line-strong` hairlines. A
  40px round sign button turns from plus to minus and fills with ink when open.
  Content is open in the HTML and collapsed by script, so it works without JavaScript.
- **Process stack:** three panels with `--r-card` corners that stick and stack on
  scroll. Backgrounds step from `--surface` to `--accent-soft` to `--accent`.
- **Tags:** small pills on `--surface` with an inset hairline. Information only, never
  overlaid on images.
- **Form:** labels above inputs, errors below in `--danger`, inputs 52px tall on
  `--bg`, focus ring is a 4px accent halo. A privacy note sits beside the submit button.
- **Icons:** Phosphor, light weight only, sized by `--icon`. No other icon family.

## 5. Layout principles

- 12-column grid, max width 1360px, page padding 20 to 64px, gutter 16 to 32px.
- Section spacing 96 to 176px. Bottom-heavy rather than cramped.
- Each section uses a different layout family; do not repeat one:
  hero split with art, facts strip, editorial statement with offset body and a
  three-column principle grid, sticky aside with accordion, sticky card stack,
  pinned portrait with scrolling bio, contact info beside a form card.
- Asymmetry is deliberate: copy aligns to column 1, supporting text often starts at
  column 7.

## 6. Depth & elevation

Mostly flat. Elevation appears only where it means something:

- `--shadow-soft`: process cards (they sit above the page while stacking).
- `--shadow-lift`: the form card and the final process card (the actions).
- Shadows are tinted to the ink colour, long and soft. No dark drop shadows, no glass
  except the scrolled header.

Radii: buttons and tags fully round; panels and photos `--r-card` (22px);
inputs `--r-input` (12px).

## 7. Do's and don'ts

**Do**
- Keep one headline per section and let space do the work.
- Use real facts and the client's own words.
- Give every animation a reason (order, pacing, sequence, feedback).
- Keep the cobalt line the only colour in the voice field.

**Don't**
- Add a second accent, gradients, glows, blobs, or glassmorphism on content.
- Add eyebrow labels above every heading (one on the page is enough).
- Use em or en dashes, decorative middle dots, or status dots.
- Invent testimonials, statistics, credentials or outcomes.
- Use Inter, Fraunces or Instrument Serif, or mix in a second typeface.
- Put a photo in the hero (the client asked for the graphic there).

## 8. Responsive behavior

- Below 1024px: the nav collapses into a full-screen menu, the hero copy comes first
  with the voice field as a band underneath (fading top and bottom), and two-column
  sections stack with the photo above the bio.
- Below 768px: process cards stop sticking and become a simple vertical sequence,
  principles and credential rows go to one column, form fields stack, hero buttons go
  full width.
- Tap targets are at least 44px. The hero always fits the first screen with the
  primary button visible.
- `prefers-reduced-motion`: no animation at all; the voice field renders one still
  frame and the animation library is never downloaded.

## 9. Agent prompt guide

Quick reference: background `#f6f6f3`, ink `#0e1a2b`, accent `#1e5fcf`,
font Host Grotesk, radius 22px for panels and full round for buttons.

Prompts that fit this system:

- "Add a section in the Limitless style: one sentence-case `.t-h2` heading, body text
  in `--ink-2` capped at 62ch, a layout family not already on the page, and no new colours."
- "Add a field to the admin panel for X: update `keystatic.config.ts` with a plain-English
  label and description, add the value to the matching `src/content/*.yaml`, and render
  it in the section component."
- "Check this change against DESIGN.md: one accent, no em dashes, eyebrow count, layout
  family repetition, reduced-motion behaviour, and dark mode."
