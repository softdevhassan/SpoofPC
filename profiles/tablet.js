// SpoofPC Profile: Tablet (Google Pixel Tablet on Android 14)
// Large touchscreen simulation without mobile app deep-link triggers.

(() => {
  if (window.__SPOOFPC_TABLET_ACTIVE__) return;
  window.__SPOOFPC_TABLET_ACTIVE__ = true;

  const CONFIG = {
    model: 'Pixel Tablet',
    os: 'Android 14',
    platform: 'Linux armv8l',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    appVersion: '5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    vendor: 'Google Inc.',
    width: 1280,
    height: 800,
    pixelRatio: 2.0,
    maxTouchPoints: 5,
    brands: [
      { brand: 'Chromium', version: '130' },
      { brand: 'Google Chrome', version: '130' },
      { brand: 'Not?A_Brand', version: '99' }
    ]
  };

  function defineProp(obj, prop, value, getter) {
    try {
      const descriptor = { configurable: true, enumerable: true };
      if (getter) descriptor.get = getter;
      else { descriptor.value = value; descriptor.writable = false; }
      Object.defineProperty(obj, prop, descriptor);
    } catch {}
  }

  // 1. Navigator overrides
  const navProto = Navigator.prototype;
  defineProp(navProto, 'userAgent', CONFIG.userAgent);
  defineProp(navProto, 'appVersion', CONFIG.appVersion);
  defineProp(navProto, 'platform', CONFIG.platform);
  defineProp(navProto, 'vendor', CONFIG.vendor);
  defineProp(navProto, 'maxTouchPoints', CONFIG.maxTouchPoints);

  try {
    defineProp(navigator, 'userAgent', CONFIG.userAgent);
    defineProp(navigator, 'appVersion', CONFIG.appVersion);
    defineProp(navigator, 'platform', CONFIG.platform);
    defineProp(navigator, 'maxTouchPoints', CONFIG.maxTouchPoints);
  } catch {}

  // 2. Client Hints (mobile: false for tablets)
  if (navigator.userAgentData || 'userAgentData' in navProto) {
    const mockUserAgentData = {
      brands: CONFIG.brands,
      mobile: false,
      platform: 'Android',
      getHighEntropyValues: async (hints = []) => {
        const result = {
          brands: CONFIG.brands,
          mobile: false,
          platform: 'Android',
          platformVersion: '14.0.0',
          architecture: 'arm',
          bitness: '64',
          model: CONFIG.model,
          formFactors: ['tablet'],
          fullVersionList: [
            { brand: 'Chromium', version: '130.0.6723.102' },
            { brand: 'Google Chrome', version: '130.0.6723.102' },
            { brand: 'Not?A_Brand', version: '99.0.0.0' }
          ],
          wow64: false
        };
        const filtered = {};
        for (const hint of hints) if (hint in result) filtered[hint] = result[hint];
        filtered.brands = result.brands;
        filtered.mobile = result.mobile;
        filtered.platform = result.platform;
        return filtered;
      },
      toJSON: function () {
        return { brands: this.brands, mobile: this.mobile, platform: this.platform };
      }
    };
    defineProp(navProto, 'userAgentData', mockUserAgentData);
    try { defineProp(navigator, 'userAgentData', mockUserAgentData); } catch {}
  }

  // 3. Touch support
  if (!('ontouchstart' in window)) {
    try {
      window.ontouchstart = null;
      document.ontouchstart = null;
    } catch {}
  }

  // 4. Dimensions
  const screenProto = Screen.prototype;
  defineProp(screenProto, 'width', CONFIG.width);
  defineProp(screenProto, 'height', CONFIG.height);
  defineProp(screenProto, 'availWidth', CONFIG.width);
  defineProp(screenProto, 'availHeight', CONFIG.height);

  try {
    defineProp(window.screen, 'width', CONFIG.width);
    defineProp(window.screen, 'height', CONFIG.height);
  } catch {}

  defineProp(window, 'devicePixelRatio', null, () => CONFIG.pixelRatio);

  // 5. matchMedia proxy
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

  // 6. Block Deep-Link and App Store Redirects
  try {
    const originalAssign = window.location.assign.bind(window.location);
    window.location.assign = function (url) {
      if (typeof url === 'string' && (url.startsWith('intent://') || url.startsWith('market://') || url.startsWith('android-app://'))) {
        console.warn('[SpoofPC] Blocked app redirect:', url);
        return;
      }
      return originalAssign(url);
    };

    const originalReplace = window.location.replace.bind(window.location);
    window.location.replace = function (url) {
      if (typeof url === 'string' && (url.startsWith('intent://') || url.startsWith('market://') || url.startsWith('android-app://'))) {
        console.warn('[SpoofPC] Blocked app redirect:', url);
        return;
      }
      return originalReplace(url);
    };

    const originalOpen = window.open;
    window.open = function (url, ...args) {
      if (typeof url === 'string' && (url.startsWith('intent://') || url.startsWith('market://') || url.startsWith('android-app://'))) {
        console.warn('[SpoofPC] Blocked app window.open:', url);
        return null;
      }
      return originalOpen.apply(this, [url, ...args]);
    };
  } catch {}

  console.info('[SpoofPC] Tablet Profile Active (Pixel Tablet, Width: 1280px, Touch: 5).');
})();
