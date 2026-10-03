/**
 * Site behaviours that work for everyone, including reduced-motion users.
 * The richer GSAP choreography lives in ./motion and loads only when motion is welcome.
 */
import { stylesReady } from './ready';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Header: scrolled state ---------------- */
function initHeader() {
  const header = $('[data-header]');
  if (!header) return;
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    header.dataset.scrolled = String(!entry.isIntersecting);
  }).observe(sentinel);
}

/* ---------------- Mobile menu ---------------- */
function initMenu() {
  const toggle = $<HTMLButtonElement>('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  const focusables = $$<HTMLAnchorElement>('a', menu);
  // While the menu is open, the page behind it is unreachable by keyboard and screen readers.
  const behind = $$('main, footer, .header__brand, .skip-link');

  const setOpen = (open: boolean) => {
    behind.forEach((el) => (el.inert = open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.dataset.open = String(open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.dataset.menuOpen = String(open);
    focusables.forEach((a) => (a.tabIndex = open ? 0 : -1));
    if (open) requestAnimationFrame(() => focusables[0]?.focus({ preventScroll: true }));
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  focusables.forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.dataset.open === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* ---------------- Reveal on scroll ---------------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!prefersMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------- Active section in the nav ---------------- */
function initActiveNav() {
  const links = $$<HTMLAnchorElement>('[data-nav-link]');
  const sections = links
    .map((a) => document.querySelector<HTMLElement>(a.getAttribute('href') || ''))
    .filter((s): s is HTMLElement => Boolean(s));
  if (!sections.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.id}`;
        links.forEach((a) =>
          a.getAttribute('href') === id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'),
        );
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

/* ---------------- Services accordion ---------------- */
function initAccordion() {
  const items = $$('[data-accordion] .svc__item');
  items.forEach((item, i) => {
    const trigger = $<HTMLButtonElement>('.svc__trigger', item);
    const panel = $<HTMLElement>('.svc__panel', item);
    if (!trigger || !panel) return;

    const set = (open: boolean) => {
      item.dataset.open = String(open);
      trigger.setAttribute('aria-expanded', String(open));
      panel.inert = !open;
    };

    set(i === 0);
    trigger.addEventListener('click', () => set(item.dataset.open !== 'true'));
  });
}

/* ---------------- Contact form ---------------- */
function initForm() {
  const form = $<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const submit = $<HTMLButtonElement>('button[type="submit"]', form);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fields = $$<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required]', form);

  const validate = (field: HTMLInputElement | HTMLTextAreaElement) => {
    const value = field.value.trim();
    const ok = field.type === 'email' ? emailPattern.test(value) : value.length > 0;
    const wrap = field.closest<HTMLElement>('.field');
    if (wrap) wrap.dataset.invalid = String(!ok);
    field.setAttribute('aria-invalid', String(!ok));
    return ok;
  };

  fields.forEach((f) =>
    f.addEventListener('input', () => {
      if (f.closest<HTMLElement>('.field')?.dataset.invalid === 'true') validate(f);
    }),
  );

  const setStatus = (message: string, state: 'success' | 'error' | '') => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = fields.filter((f) => !validate(f));
    if (invalid.length) {
      invalid[0].focus();
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }

    const data = new FormData(form);
    if (data.get('botcheck')) return;

    const name = `${data.get('firstName')} ${data.get('lastName')}`.trim();
    const email = String(data.get('email'));
    const message = String(data.get('message'));
    const accessKey = form.dataset.accessKey;

    if (!accessKey) {
      // No form service configured: hand the message to the visitor's email app.
      const to = form.dataset.email || '';
      const subject = encodeURIComponent(`Website inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      setStatus('Your email app should open with the message ready to send.', 'success');
      return;
    }

    submit?.setAttribute('aria-busy', 'true');
    setStatus('Sending…', '');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Website inquiry from ${name}`,
          from_name: 'Limitless website',
          name,
          email,
          message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error('send failed');
      form.reset();
      setStatus(form.dataset.success || 'Thank you. Your message has been sent.', 'success');
    } catch {
      setStatus(`That didn't send. Please try again, or email ${form.dataset.email} directly.`, 'error');
    } finally {
      submit?.removeAttribute('aria-busy');
    }
  });
}

// These don't depend on layout, so they are safe to wire up immediately.
initMenu();
initAccordion();
initForm();

// Everything below measures the page, so it waits for the stylesheet. Module scripts
// are not guaranteed to run after external CSS is applied (Safari, cold load).
stylesReady().then(() => {
  initHeader();
  initReveal();
  initActiveNav();
  if (prefersMotion) {
    import('./motion').then((m) => m.initMotion());
  }
});
