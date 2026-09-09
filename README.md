# Limitless Speech & Language Therapy — website

A rebuild of limitlessspeechandlanguagetherapy.com as a **single scrolling
page**. Same copy, same photos, same features as the Squarespace original.

## Design direction

Modelled on the "Bloom" mental health clinic concept
(dribbble.com/shots/26661884), adapted to the practice's blue-and-lavender logo:

- soft light aurora wash inside a large rounded hero card (generated in SVG —
  no stock photography needed), in the logo's blues and lavender
- floating translucent nav that frosts on scroll
- white rounded panels that overlap the section above
- small serif margin-labels with `(01 / 04)` counters
- oversized thin numerals, soft violet gradient blocks, pill CTAs with a dot

Type: **Onest** (UI) + **Instrument Serif** italic (labels and accents).

## Structure

```
index.html          the whole site — #top #approach #services #about #contact
assets/css/styles.css
assets/js/main.js
assets/img/         logo.png (original, untouched)
                    logo-mark.png (cropped + transparent — used everywhere)
                    favicon.png, alyssa.jpg
```

Plain static HTML/CSS/JS, no build step. Drop the folder on any host
(Netlify, Vercel, GitHub Pages, cPanel) and it works.

## Running it locally

```bash
python -m http.server 4321
```

Then open http://localhost:4321.

## Two lines of new copy

Everything is verbatim from the original site except two headlines written to
fill the layout's large statement slots. Swap them freely:

- `#approach` — "Therapy that is individualized, evidence based, and built
  around what matters most in everyday life."
- closing block — "Communication that carries into everyday life."

## Contact form

There is no server, so `assets/js/main.js` hands the message off to the
visitor's email app (pre-addressed to Alyssa.LimitlessSLP@gmail.com).

To post it straight to an inbox instead, sign up for a form service (Formspree,
Netlify Forms, Basin) and add its endpoint to the `<form>` tag:

```html
<form data-contact-form action="https://formspree.io/f/XXXXXXX" method="POST">
```

The JS detects the `action` attribute and steps out of the way automatically.

## Notes

- All animations are disabled under `prefers-reduced-motion: reduce`.
- The hero landscape is inline SVG in `index.html`; the `.layer` groups are
  parallaxed on scroll by `main.js`.
