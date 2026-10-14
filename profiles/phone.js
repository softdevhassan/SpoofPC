// SpoofPC Profile: Mobile Phone (Google Pixel 10 Pro on Android 15)
// Strict mobile phone simulation for mobile-specific responsive layouts and functionality.

(() => {
  if (window.__SPOOFPC_PHONE_ACTIVE__) return;
  window.__SPOOFPC_PHONE_ACTIVE__ = true;

  const CONFIG = {
    model: 'Pixel 10 Pro',
    os: 'Android 15',
    platform: 'Linux armv8l',
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    appVersion: '5.0 (Linux; Android 15; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    vendor: 'Google Inc.',
    width: 412,
    height: 915,
    pixelRatio: 2.625,
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

  // 2. Client Hints (navigator.userAgentData)
  if (navigator.userAgentData || 'userAgentData' in navProto) {
    const mockUserAgentData = {
      brands: CONFIG.brands,
      mobile: true,
      platform: 'Android',
      getHighEntropyValues: async (hints = []) => {
        const result = {
          brands: CONFIG.brands,
          mobile: true,
          platform: 'Android',
          platformVersion: '15.0.0',
          architecture: 'arm',
          bitness: '64',
          model: CONFIG.model,
          formFactors: ['mobile'],
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

  // 4. Screen & Window dimensions
  const screenProto = Screen.prototype;
  defineProp(screenProto, 'width', CONFIG.width);
  defineProp(screenProto, 'height', CONFIG.height);
  defineProp(screenProto, 'availWidth', CONFIG.width);
  defineProp(screenProto, 'availHeight', CONFIG.height);

  try {
    defineProp(window.screen, 'width', CONFIG.width);
    defineProp(window.screen, 'height', CONFIG.height);
  } catch {}

  defineProp(window, 'innerWidth', null, () => CONFIG.width);
  defineProp(window, 'innerHeight', null, () => CONFIG.height);
  defineProp(window, 'devicePixelRatio', null, () => CONFIG.pixelRatio);

  // 5. matchMedia proxy
  const originalMatchMedia = window.matchMedia ? window.matchMedia.bind(window) : null;
  if (originalMatchMedia) {
    window.matchMedia = function (query) {
      const q = String(query).toLowerCase();
      let forcedMatch = null;
      if (q.includes('pointer: coarse') || q.includes('hover: none')) forcedMatch = true;
      else if (q.includes('pointer: fine') || q.includes('hover: hover')) forcedMatch = false;
      else if (q.includes('max-width')) {
        const match = q.match(/max-width\s*:\s*(\d+)px/);
        if (match && Number(match[1]) >= CONFIG.width) forcedMatch = true;
      }

      const res = originalMatchMedia(query);
      if (forcedMatch !== null) {
        return new Proxy(res, {
          get(target, prop) {
            if (prop === 'matches') return forcedMatch;
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
          }
        });
      }
      return res;
    };
  }

  console.info('[SpoofPC] Mobile Phone Profile Active (Pixel 10 Pro, Width: 412px, Touch: 5).');
})();
