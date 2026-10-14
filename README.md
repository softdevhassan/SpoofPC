# SpoofPC (Chrome Extension) — Multi-Profile Suite

A lightweight Manifest V3 Chrome extension designed for web developers. **SpoofPC** lets you switch between 3 specialized device profiles with a single click—without resizing your browser window.

---

## 🎭 The 3 Profiles

| Profile | Target Device | Best Used For |
| :--- | :--- | :--- |
| **🎬 Streaming & Touch** | Windows 11 Surface / Touch PC | **Netflix, Prime Video, Hulu & Widevine DRM**. Allows full 1080p web video playback with 0 warnings, while keeping `maxTouchPoints = 5` and touch events active. |
| **📱 Mobile Phone** | Google Pixel 10 Pro (Android 15) | **Strict Mobile Phone Testing**. Overrides screen to 412×915px, sets `mobile: true`, touch points: 5, and full Android Chrome mobile headers. |
| **📟 Tablet** | Google Pixel Tablet (Android 14) | **Tablet Responsive Testing**. Sets 1280×800px touch layout while blocking mobile app store redirects (`intent://`) and banners. |

---

## ⚡ Controller Popup UI

Clicking the **SpoofPC** icon in your Chrome toolbar opens the controller popup:
- **Master Toggle**: Turns Emulation ON or OFF instantly.
- **Profile Selector**: Switch between the 3 profiles with 1 click.
- **Auto-Reload**: Automatically refreshes your current tab so new headers and scripts take effect immediately.
- **Test Benchmark**: Instant link to verify live headers and JavaScript APIs.

---

## 🚀 How to Reload or Install in Chrome

1. In Chrome, open `chrome://extensions/`.
2. Locate **SpoofPC**.
3. Click the **Reload icon** (circular arrow button 🔄) on the card.
4. Pin **SpoofPC** to your Chrome toolbar.
5. Click the SpoofPC icon, select **Streaming & Touch**, turn it **ON**, and test **Netflix**!
