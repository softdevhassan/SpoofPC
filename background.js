// SpoofPC - Multi-Profile Emulator (Manifest V3)
// Supports Streaming/Netflix DRM (Windows Touch), Strict Phone (Pixel 10 Pro), and Tablet (Pixel Tablet).

const SCRIPT_ID = 'spoofpc-active-profile';
const RULE_ID = 1001;

const PROFILES = {
  streaming: {
    id: 'streaming',
    name: 'Streaming & Touch (Netflix Ready)',
    device: 'Windows 11 Touch / Surface',
    badge: 'STR',
    file: 'profiles/streaming.js',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    secChUa: '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    secChUaMobile: '?0',
    secChUaPlatform: '"Windows"',
    secChUaModel: '""'
  },
  phone: {
    id: 'phone',
    name: 'Mobile Phone (Pixel 10 Pro)',
    device: 'Google Pixel 10 Pro',
    badge: 'PHN',
    file: 'profiles/phone.js',
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 10 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    secChUa: '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    secChUaMobile: '?1',
    secChUaPlatform: '"Android"',
    secChUaModel: '"Pixel 10 Pro"'
  },
  tablet: {
    id: 'tablet',
    name: 'Tablet (Pixel Tablet)',
    device: 'Google Pixel Tablet',
    badge: 'TAB',
    file: 'profiles/tablet.js',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    secChUa: '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    secChUaMobile: '?0',
    secChUaPlatform: '"Android"',
    secChUaModel: '"Pixel Tablet"'
  }
};

const ICONS_OFF = {
  "16": "icons/icon-16.png",
  "32": "icons/icon-32.png",
  "48": "icons/icon-48.png",
  "128": "icons/icon-128.png"
};

const ICONS_ON = {
  "16": "icons/icon-on-16.png",
  "32": "icons/icon-on-32.png",
  "48": "icons/icon-on-48.png",
  "128": "icons/icon-on-128.png"
};

// Safely clear all old/stale content scripts from Chrome's internal store
async function clearAllRegisteredScripts() {
  try {
    await chrome.scripting.unregisterContentScripts();
  } catch (err) {
    // Ignore if none were registered
  }
}

// Apply profile state (Headers, Scripts & Badges)
async function applyConfiguration(isEnabled, profileId) {
  try {
    const profile = PROFILES[profileId] || PROFILES.streaming;

    // 1. Clear all old registered scripts across all IDs to prevent stale references
    await clearAllRegisteredScripts();

    // 2. Register current profile script if enabled
    if (isEnabled) {
      await chrome.scripting.registerContentScripts([
        {
          id: SCRIPT_ID,
          matches: ['<all_urls>'],
          js: [profile.file],
          runAt: 'document_start',
          world: 'MAIN',
          allFrames: true
        }
      ]);
    }

    // 3. Manage Dynamic DeclarativeNetRequest Rules
    if (isEnabled && profile.userAgent) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_ID],
        addRules: [
          {
            id: RULE_ID,
            priority: 1,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                { header: 'User-Agent', operation: 'set', value: profile.userAgent },
                { header: 'sec-ch-ua', operation: 'set', value: profile.secChUa },
                { header: 'sec-ch-ua-mobile', operation: 'set', value: profile.secChUaMobile },
                { header: 'sec-ch-ua-platform', operation: 'set', value: profile.secChUaPlatform },
                { header: 'sec-ch-ua-model', operation: 'set', value: profile.secChUaModel }
              ]
            },
            condition: {
              urlFilter: '*',
              resourceTypes: [
                'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'other'
              ]
            }
          }
        ]
      });
    } else {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_ID]
      });
    }

    // 4. Update Action Icon & Badge
    if (isEnabled) {
      await chrome.action.setIcon({ path: ICONS_ON });
      await chrome.action.setBadgeText({ text: profile.badge });
      await chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
    } else {
      await chrome.action.setIcon({ path: ICONS_OFF });
      await chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('[SpoofPC] Error applying configuration:', error);
  }
}

// Installation default
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const current = await chrome.storage.local.get(['isEnabled', 'activeProfile', 'autoReload']);
    const defaults = {
      isEnabled: current.isEnabled ?? false,
      activeProfile: current.activeProfile ?? 'streaming',
      autoReload: current.autoReload ?? true
    };
    await chrome.storage.local.set(defaults);
    await applyConfiguration(defaults.isEnabled, defaults.activeProfile);
  } catch (err) {
    console.error('[SpoofPC] onInstalled error:', err);
  }
});

// Startup sync
chrome.runtime.onStartup.addListener(async () => {
  try {
    const { isEnabled = false, activeProfile = 'streaming' } = await chrome.storage.local.get(['isEnabled', 'activeProfile']);
    await applyConfiguration(isEnabled, activeProfile);
  } catch (err) {
    console.error('[SpoofPC] onStartup error:', err);
  }
});

// Runtime messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CONFIG') {
    (async () => {
      try {
        const state = await chrome.storage.local.get(['isEnabled', 'activeProfile', 'autoReload']);
        sendResponse({
          isEnabled: state.isEnabled ?? false,
          activeProfile: state.activeProfile ?? 'streaming',
          autoReload: state.autoReload ?? true,
          profiles: PROFILES
        });
      } catch (err) {
        sendResponse({ isEnabled: false, activeProfile: 'streaming', autoReload: true, profiles: PROFILES });
      }
    })();
    return true;
  }

  if (message.type === 'SET_CONFIG') {
    (async () => {
      try {
        const { isEnabled, activeProfile, autoReload } = message;
        await chrome.storage.local.set({ isEnabled, activeProfile, autoReload });
        await applyConfiguration(isEnabled, activeProfile);

        if (autoReload) {
          const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab?.id && activeTab?.url && !activeTab.url.startsWith('chrome://')) {
            try {
              await chrome.tabs.reload(activeTab.id);
            } catch {}
          }
        }

        sendResponse({ success: true });
      } catch (err) {
        console.error('[SpoofPC] SET_CONFIG error:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
