# Limitless Speech & Language Therapy — website

A fast, fully static marketing site built with [Astro](https://astro.build), with a
[Keystatic](https://keystatic.com) admin panel so the practice can edit every word
on the site without touching code. Hosted on [Vercel](https://vercel.com).

- **Visitors** get plain static HTML: one stylesheet, a ~2 KB script, and the
  animation library loaded afterwards (skipped entirely for reduced-motion users).
- **Alyssa** edits text at `/keystatic`. Saving publishes automatically in about a minute.
- **Design rules** live in [DESIGN.md](DESIGN.md). Plain-language editing help for
  Alyssa is in [HOW-TO-EDIT.md](HOW-TO-EDIT.md).

---

## Run it locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

- Site: http://localhost:4321
- Admin panel: http://localhost:4321/keystatic (edits the files in `src/content/` directly)

`npm run build` produces the production build in `.vercel/output`.

## Where things live

| Path | What it is |
|---|---|
| `src/content/*.yaml` | **All the words on the site.** Edited by the admin panel. |
| `keystatic.config.ts` | What the admin panel shows: every field, label and hint. |
| `src/components/` | One file per section of the page. |
| `src/styles/global.css` | The whole design system (colours, type, spacing, components). |
| `src/scripts/field.ts` | The animated "voice field" in the hero. |
| `src/scripts/motion.ts` | Scroll and entrance animation (GSAP). |
| `src/scripts/site.ts` | Menu, accordion, contact form, reveals. |
| `src/assets/uploads/` | Photos uploaded through the admin panel. |

## Deploy to Vercel

The code is already on GitHub at `HNaveed13/LimitlessSpeechTherapy`.

1. Commit and push this version to GitHub.
2. In Vercel: **Add New → Project**, import the repository. Vercel detects Astro
   automatically. Click **Deploy**.
3. In **Settings → Environment Variables**, add
   `SITE_URL` = `https://limitlessspeechandlanguagetherapy.com` (or whatever the final
   domain is). This is used for Google and social-share links.
4. When you are ready to switch the real domain over: **Settings → Domains**, add the
   domain, then update its DNS where it is registered (currently Squarespace) using the
   records Vercel shows. The old Squarespace site keeps serving the domain until you do
   this, so nothing changes for visitors before you are ready.

## Turn on editing for Alyssa (Keystatic Cloud)

Keystatic Cloud handles logins, so Alyssa does **not** need a GitHub account.
The free plan covers up to 3 people.

1. Go to [keystatic.cloud](https://keystatic.cloud) and sign in with the GitHub account
   that owns the repository.
2. Create a **team** (for example `limitless`) and a **project** (for example
   `website`), and connect the `LimitlessSpeechTherapy` repository when asked. This
   installs Keystatic's GitHub app on that repo so it can save edits.
3. In Vercel, add the environment variable
   `PUBLIC_KEYSTATIC_CLOUD_PROJECT` = `limitless/website` (the exact `team/project`
   value is shown on the project's settings page in Keystatic Cloud).
   **Then redeploy.** This value is baked in at build time, so it only takes effect
   after a new deployment.
4. Invite Alyssa to the team by email from Keystatic Cloud.
5. Send her [HOW-TO-EDIT.md](HOW-TO-EDIT.md). She edits at
   `https://<your-domain>/keystatic`.

**How publishing works:** when she clicks Save, Keystatic commits the change to GitHub,
and Vercel rebuilds and publishes the site, usually within a minute. Every edit is a
commit, so any change can be looked at or undone from the GitHub history.

Locally (`npm run dev`) the admin always uses local mode and simply edits the files.

## Contact form

By default the form opens the visitor's own email app with the message filled in,
addressed to the practice email. To have messages sent straight to the inbox instead:

1. Get a free access key at [web3forms.com](https://web3forms.com) using the practice's
   email address.
2. In the admin panel, open **Contact details, insurance & search** and paste it into
   **Contact form key**. Save.

The form includes a note asking visitors not to send private health details, and a
hidden spam trap.

## Notes

- **Accessibility:** semantic landmarks and headings, labelled form fields with inline
  errors, visible focus states, keyboard-operable menu and accordion, and full support
  for `prefers-reduced-motion` (all motion is replaced with a still design).
- **Dark mode** follows the visitor's system setting.
- **Fonts** (Host Grotesk) are self-hosted; no Google Fonts requests.
- **Quotes:** editors can type plain `'` and `"`; the site converts them to
  typographic quotes automatically.
- **SEO:** title, description, canonical, Open Graph and `MedicalBusiness` structured
  data are generated from the admin panel's content.
