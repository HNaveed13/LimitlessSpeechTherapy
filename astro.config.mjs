// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// The address used for share previews, canonical links and Google. On Vercel this is the
// project's production domain (the vercel.app address now, the real domain once it is
// added under Settings > Domains), so link previews always point at a page that exists.
// SITE_URL overrides it.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site =
  process.env.SITE_URL ||
  (productionHost ? `https://${productionHost}` : 'https://limitlessspeechandlanguagetherapy.com');

// The public site is fully static. Keystatic injects its own server routes
// (/keystatic and /api/keystatic), which the Vercel adapter deploys as functions.
export default defineConfig({
  site,
  integrations: [react(), keystatic()],
  adapter: vercel(),
  image: {
    // Keep generated images lean; Astro emits AVIF/WebP via <Picture>.
    responsiveStyles: true,
  },
  prefetch: false,
  devToolbar: { enabled: false },
});
