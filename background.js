"use strict";

// Load shared constants
importScripts('constants.js');

// Derived time constants
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Helper to read the configured interval (in minutes) from storage
async function getIntervalMinutes() {
  const { [STORAGE_KEYS.intervalMinutes]: intervalMinutes } = await new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.intervalMinutes], resolve);
  });
  return Number.isFinite(intervalMinutes) && intervalMinutes > 0
    ? intervalMinutes
    : DEFAULT_INTERVAL_MINUTES;
}


// Cross-browser removal helper with graceful fallback per data category
async function removeWithFallback(removeOptions) {
  // First try a single combined remove with a broad set
  const combinedTypes = {
    appcache: true,
    cache: true,
    cacheStorage: true,
    cookies: true,
    downloads: true,
    fileSystems: true,
    formData: true,
    history: true,
    indexedDB: true,
    localStorage: true,
    passwords: false,
    serviceWorkers: true,
    webSQL: true
  };
  try {
    await new Promise((resolve, reject) => {
      chrome.browsingData.remove(removeOptions, combinedTypes, () => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve();
      });
    });
    return; // success
  } catch (e) {
    console.warn('[Cleaner] Combined remove failed; falling back per category', e);
  }

  // Fallback per category (only widely supported methods, guarded by existence)
  const tasks = [
    ['removeCache', 'cache'],
    ['removeCookies', 'cookies'],
    ['removeDownloads', 'downloads'],
    ['removeFormData', 'formData'],
    ['removeHistory', 'history'],
    ['removeIndexedDB', 'indexedDB'],
    ['removeLocalStorage', 'localStorage'],
    ['removeServiceWorkers', 'serviceWorkers']
  ];

  for (const [method, label] of tasks) {
    try {
      const fn = chrome?.browsingData?.[method];
      if (typeof fn !== 'function') continue;
      await new Promise((resolve, reject) => {
        fn.call(chrome.browsingData, removeOptions, () => {
          if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
          resolve();
        });
      });
    } catch (e) {
      console.warn(`[Cleaner] ${label} removal failed`, e);
    }
  }
}

/**
 * Clears browsing data.
 * @param {boolean} forceAllTime If true, clears data for all time; otherwise uses lastCleanTime or ONE_YEAR_MS.
 */
async function clearAllBrowserData(forceAllTime = false) {
  const defaultSince = Date.now() - ONE_YEAR_MS;
  // Retrieve last clean time and count
  const { lastCleanTime = 0, cleanCount = 0 } = await new Promise((resolve) => {
    chrome.storage.local.get(['lastCleanTime', 'cleanCount'], resolve);
  });

  // Determine the 'since' option
  const since = forceAllTime ? 0 : Math.max(lastCleanTime, defaultSince);
  const removeOptions = since > 0 ? { since } : {};

  // Remove browsing data (with fallback strategy)
  try {
    await removeWithFallback(removeOptions);
  } catch (err) {
    throw err;
  }

  // Update storage with new timestamp and count
  await new Promise((resolve) => {
    chrome.storage.local.set(
      {
        lastCleanTime: Date.now(),
        cleanCount: cleanCount + 1
      },
      resolve
    );
  });

  console.info('[Cleaner] Browsing data cleared', { forceAllTime, since });
}

/** Schedule or reschedule the periodic auto-clean alarm */
async function scheduleAutoClean() {
  const minutes = await getIntervalMinutes();
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: minutes });
    console.info('[Cleaner] Alarm scheduled/rescheduled', {
      name: ALARM_NAME,
      periodInMinutes: minutes
    });
  });
}

/** If the last clean is overdue, trigger a cleanup */
async function catchUpIfOverdue() {
  const { lastCleanTime = 0 } = await new Promise((resolve) => {
    chrome.storage.local.get(['lastCleanTime'], resolve);
  });
  const minutes = await getIntervalMinutes();
  const intervalMs = minutes * 60 * 1000;
  const due = Date.now() - lastCleanTime >= intervalMs;
  if (due || lastCleanTime === 0) {
    try {
      await clearAllBrowserData(false);
    } catch (e) {
      console.warn('[Cleaner] Catch-up cleanup failed', e);
    }
  } else {
    // nothing to do
  }
}

// On install/update: schedule periodic alarm
chrome.runtime.onInstalled.addListener(() => {
  scheduleAutoClean();
});

// On browser startup: ensure alarm exists and catch up if needed
chrome.runtime.onStartup.addListener(() => {
  scheduleAutoClean();
  catchUpIfOverdue();
});

// Handle the periodic alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    clearAllBrowserData(false)
      .catch((e) => {
        console.warn('[Cleaner] Periodic cleanup failed', e);
      });
  }
});

// Reschedule alarm if user changes interval in options
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes[STORAGE_KEYS.intervalMinutes]) {
    scheduleAutoClean();
  }
});

// Listen for messages (e.g., from popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) {
    return;
  }
  if (request.action === 'clearNow') {
    // Force full-time clear when manually requested
    clearAllBrowserData(true)
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.warn('[Cleaner] Manual cleanup failed', error);
        sendResponse({ success: false });
      });
    return true; // Asynchrone Antwort
  }
});
