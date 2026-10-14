// SpoofPC - Popup Controller Script (Manifest V3)

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('master-toggle');
  const statusBadge = document.getElementById('status-badge');
  const autoReloadToggle = document.getElementById('auto-reload-toggle');
  const profileCards = document.querySelectorAll('.profile-card');
  const benchmarkBtn = document.getElementById('test-benchmark-btn');

  let currentProfile = 'streaming';
  let isEnabled = false;
  let autoReload = true;

  // 1. Fetch current config from background service worker
  const response = await chrome.runtime.sendMessage({ type: 'GET_CONFIG' });
  if (response) {
    isEnabled = Boolean(response.isEnabled);
    currentProfile = response.activeProfile || 'streaming';
    autoReload = Boolean(response.autoReload);

    updateUI();
  }

  function updateUI() {
    masterToggle.checked = isEnabled;
    autoReloadToggle.checked = autoReload;

    if (isEnabled) {
      statusBadge.textContent = 'ON';
      statusBadge.className = 'status-badge on';
    } else {
      statusBadge.textContent = 'OFF';
      statusBadge.className = 'status-badge off';
    }

    profileCards.forEach(card => {
      const p = card.getAttribute('data-profile');
      if (p === currentProfile) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  async function saveConfig() {
    await chrome.runtime.sendMessage({
      type: 'SET_CONFIG',
      isEnabled,
      activeProfile: currentProfile,
      autoReload
    });
    updateUI();
  }

  // 2. Master Toggle Switch
  masterToggle.addEventListener('change', () => {
    isEnabled = masterToggle.checked;
    saveConfig();
  });

  // 3. Profile Selection Cards
  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      currentProfile = card.getAttribute('data-profile');
      saveConfig();
    });
  });

  // 4. Auto Reload Toggle
  autoReloadToggle.addEventListener('change', () => {
    autoReload = autoReloadToggle.checked;
    saveConfig();
  });

  // 5. Open Benchmark Test Page
  benchmarkBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('test.html') });
  });
});
