import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll on route change. Without this, SPA navigation keeps the
 * previous page's scroll position (e.g. opening /pricing mid-page).
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
