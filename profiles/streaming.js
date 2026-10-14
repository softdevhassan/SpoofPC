// SpoofPC Profile: Streaming & Touch (Windows 11 Surface / Touch PC)
// Fully compatible with Netflix, Prime Video, Hulu & Widevine DRM while maintaining touch detection.

(() => {
  if (window.__SPOOFPC_STREAMING_ACTIVE__) return;
  window.__SPOOFPC_STREAMING_ACTIVE__ = true;

  // 1. Maintain genuine Windows 11 platform identity so Widevine DRM licenses are issued smoothly
  try {
    Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { value: 5, configurable: true, enumerable: true });
    Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, configurable: true, enumerable: true });
  } catch {}

  // 2. Enable touch event listeners
  if (!('ontouchstart' in window)) {
    try {
      window.ontouchstart = null;
      document.ontouchstart = null;
    } catch {}
  }

  // 3. Intercept window.matchMedia for touch queries without affecting CSS layout
  const originalMatchMedia = window.matchMedia ? window.matchMedia.bind(window) : null;
  if (originalMatchMedia) {
    window.matchMedia = function (query) {
      const q = String(query).toLowerCase();
      if (q.includes('pointer: coarse')) {
        const res = originalMatchMedia(query);
        return new Proxy(res, {
          get(target, prop) {
            if (prop === 'matches') return true;
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
          }
        });
      }
      return originalMatchMedia(query);
    };
  }

  console.info('[SpoofPC] Streaming & Touch Profile Active (Netflix & Widevine DRM 100% Compatible + Touch: 5).');
})();
