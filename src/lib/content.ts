import { createReader } from '@keystatic/core/reader';
import type { ImageMetadata } from 'astro';
import keystaticConfig from '../../keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);

/** Reads a singleton and fails the build loudly if the file is missing. */
async function required<T>(name: string, value: Promise<T | null>): Promise<T> {
  const data = await value;
  if (!data) throw new Error(`Missing content file: src/content/${name}.yaml`);
  return data;
}

export async function getContent() {
  const [settings, hero, approach, services, process_, about, contact] = await Promise.all([
    required('settings', reader.singletons.settings.read()),
    required('hero', reader.singletons.hero.read()),
    required('approach', reader.singletons.approach.read()),
    required('services', reader.singletons.services.read()),
    required('process', reader.singletons.process.read()),
    required('about', reader.singletons.about.read()),
    required('contact', reader.singletons.contact.read()),
  ]);
  return typeset({ settings, hero, approach, services, process: process_, about, contact });
}

/**
 * Editors type plain quotes; the site shows typographic ones.
 * Applied to every text value, so nobody has to remember curly quotes.
 */
function smartQuotes(text: string): string {
  if (/^(https?:|mailto:|tel:|\/)/.test(text)) return text;
  return text
    .replace(/(\w)'(\w)/g, '$1’$2') // don't, Alyssa's
    .replace(/(^|[\s(\[])'/g, '$1‘') // opening single
    .replace(/'/g, '’') // closing single
    .replace(/(^|[\s(\[])"/g, '$1“') // opening double
    .replace(/"/g, '”'); // closing double
}

function typeset<T>(value: T): T {
  if (typeof value === 'string') return smartQuotes(value) as T;
  if (Array.isArray(value)) return value.map(typeset) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeset(v)])) as T;
  }
  return value;
}

export type SiteContent = Awaited<ReturnType<typeof getContent>>;

/* ------------------------------------------------------------------ */
/* Text formatting for editor-written copy                             */
/* ------------------------------------------------------------------ */

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escapes text, then turns **bold** into <strong>. Safe for set:html. */
export function inline(text: string): string {
  return escapeHtml(text.trim()).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Splits editor text on blank lines into paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/** Digits-only tel: link with US country code. */
export function telHref(number: string): string {
  const digits = number.replace(/\D/g, '');
  return `tel:+${digits.length === 10 ? '1' + digits : digits}`;
}

/* ------------------------------------------------------------------ */
/* Images uploaded through Keystatic                                   */
/* ------------------------------------------------------------------ */

const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

/** Resolves a Keystatic image path to optimizable image metadata. */
export function uploadedImage(path: string | null | undefined): ImageMetadata | undefined {
  if (!path) return undefined;
  return uploads[path]?.default;
}
