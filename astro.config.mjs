// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

// The public site is fully static. Keystatic injects its own server routes
// (/keystatic and /api/keystatic), which the Vercel adapter deploys as functions.
export default defineConfig({
  site: process.env.SITE_URL || 'https://limitlessspeechandlanguagetherapy.com',
  integrations: [react(), keystatic()],
  adapter: vercel(),
  image: {
    // Keep generated images lean; Astro emits AVIF/WebP via <Picture>.
    responsiveStyles: true,
  },
  prefetch: false,
  devToolbar: { enabled: false },
});
