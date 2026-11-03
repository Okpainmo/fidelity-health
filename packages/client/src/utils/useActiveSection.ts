import { useEffect, useState } from 'react';

// Tracks which section (by element id) is currently in view, for side
// navigation on long forms. Change `resetKey` to re-attach after the sections
// are re-rendered (e.g. when a form is reset).
export function useActiveSection(ids: readonly string[], resetKey: unknown = 0) {
  const [active, setActive] = useState<string>(ids[0] ?? '');
  const idsKey = ids.join('|');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    idsKey.split('|').forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [idsKey, resetKey]);

  return active;
}
