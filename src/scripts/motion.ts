/**
 * Motion choreography. Loaded only when the visitor has not asked for reduced motion.
 * Each effect has one job:
 *  - Hero intro: establishes reading order (headline first, then support).
 *  - Statement highlight: paces the approach statement to the reader's scroll.
 *  - Process stack: previous steps recede as the next arrives, showing sequence.
 *  - Header: steps aside while reading down, returns when scrolling up.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const fontsReady = (timeout: number) =>
  Promise.race([
    document.fonts.ready.then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeout)),
  ]);

async function heroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const title = hero?.querySelector<HTMLElement>('[data-hero-title]');
  if (!hero || !title) return;

  // The CSS failsafe reveals the hero text 2.6s after styles apply. If we are close to
  // that (slow connection or slow fonts), show the text now instead of replaying an intro.
  const budget = 2300 - performance.now();
  const ready = budget > 0 && (await fontsReady(Math.min(1800, budget)));
  if (!ready) {
    hero.classList.add('is-ready');
    return;
  }

  const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
  const fades = hero.querySelectorAll('[data-hero-fade]');

  gsap
    .timeline({ defaults: { ease: 'expo.out' }, onComplete: () => split.revert() })
    .from(split.lines, { yPercent: 110, duration: 1.4, stagger: 0.1 })
    .from(fades, { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.12 }, 0.4);

  hero.classList.add('is-ready');
}

function statementHighlight() {
  const statement = document.querySelector<HTMLElement>('[data-words]');
  if (!statement) return;
  const split = SplitText.create(statement, { type: 'words', wordsClass: 'word' });
  gsap.fromTo(
    split.words,
    { opacity: 0.16 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: statement, start: 'top 85%', end: 'bottom 50%', scrub: 0.6 },
    },
  );
}

function processStack() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    const cards = gsap.utils.toArray<HTMLElement>('[data-stack] > li');
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.94,
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: 'top bottom',
          end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  });
}

function headerHeadroom() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const menuOpen = document.body.dataset.menuOpen === 'true';
      const focusedInside = header.contains(document.activeElement);
      const hide = self.direction === 1 && self.scroll() > 240 && !menuOpen && !focusedInside;
      header.dataset.hidden = String(hide);
    },
  });
}

export function initMotion() {
  heroIntro();
  statementHighlight();
  processStack();
  headerHeadroom();
  // Layout settles once web fonts land; recalculate trigger positions.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
