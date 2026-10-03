/**
 * Resolves once every stylesheet in the document has loaded.
 *
 * Module scripts are not guaranteed to run after external CSS has been applied
 * (Safari can run them first on a cold, uncached load). Anything that measures
 * layout or reads CSS custom properties should wait for this.
 * A timeout guarantees the page still starts if a stylesheet never finishes.
 */
export function stylesReady(timeout = 4000): Promise<void> {
  const pending = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"]'),
  ).filter((link) => !link.sheet);

  if (!pending.length) return Promise.resolve();

  return new Promise((resolve) => {
    let left = pending.length;
    const done = () => {
      if (--left <= 0) resolve();
    };
    pending.forEach((link) => {
      link.addEventListener('load', done, { once: true });
      link.addEventListener('error', done, { once: true });
    });
    window.addEventListener('load', () => resolve(), { once: true });
    setTimeout(resolve, timeout);
  });
}
