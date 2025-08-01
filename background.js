"use strict";

// Load shared constants
importScripts('constants.js');

// Derived time constants
const FOUR_DAYS_MINUTES = FOUR_DAYS_MS / (60 * 1000);
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Simple configurable logging function
const DEBUG_LOGGING = false;
const log = (...args) => {
  if (DEBUG_LOGGING) {
    console.debug(...args);
  }
};

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

  // Remove browsing data
  await new Promise((resolve, reject) => {
    chrome.browsingData.remove(
      removeOptions,
      {
        appcache: true,
        cache: true,
        cacheStorage: true,
        cookies: true,
        downloads: false,
        fileSystems: true,
        formData: true,
        history: true,
        indexedDB: true,
        localStorage: true,
        passwords: false,
        serviceWorkers: true,
        webSQL: true
      },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        resolve();
      }
    );
  });

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

  log('Browsing data cleared', { since, newCount: cleanCount + 1 });
}

// Listen for messages (e.g., from popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) {
    console.warn('Unerlaubte Nachricht von', sender.id);
    return;
  }
  if (request.action === 'clearNow') {
    // Force full-time clear when manually requested
    clearAllBrowserData(true)
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error('Fehler beim Löschen der Browserdaten:', error);
        sendResponse({ success: false });
      });
    return true; // Asynchrone Antwort
  }
});
