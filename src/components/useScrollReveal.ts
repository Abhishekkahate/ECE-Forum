import { useEffect, useRef, useCallback } from 'react';

/**
 * useScrollReveal — attaches IntersectionObserver to a section container,
 * adding the "in-view" class to all children with .reveal, .reveal-left,
 * or .reveal-scale classes when the section enters the viewport.
 * Also uses MutationObserver to immediately reveal newly mounted children when the section is in view.
 */
export function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement | null>(null);

  const observe = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    let isSectionInView = false;

    const revealAllChildren = () => {
      const targets = el.querySelectorAll<HTMLElement>('.reveal:not(.in-view), .reveal-left:not(.in-view), .reveal-scale:not(.in-view)');
      targets.forEach((target) => target.classList.add('in-view'));
    };

    const targets = el.querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-scale');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isSectionInView = true;
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -20px 0px' }
    );

    targets.forEach((target) => observer.observe(target));

    // Watch for dynamically rendered elements (e.g. Tab/Filter changes in React)
    const mutationObserver = new MutationObserver(() => {
      if (isSectionInView) {
        revealAllChildren();
      } else {
        const newTargets = el.querySelectorAll<HTMLElement>('.reveal:not(.in-view), .reveal-left:not(.in-view), .reveal-scale:not(.in-view)');
        newTargets.forEach((t) => observer.observe(t));
      }
    });

    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [threshold]);

  useEffect(() => {
    const cleanup = observe();
    return cleanup;
  }, [observe]);

  return ref;
}

/**
 * useElementReveal — attaches IntersectionObserver to a single element.
 * Returns [ref, inView] tuple.
 */
export function useElementReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
