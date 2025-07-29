"use strict";

// Shared time interval for automatic cleaning (4 days)
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

// Browsing data options used by clearAllBrowserData()
// Adjust these flags to control which data types get removed
const CLEAR_DATA_TYPES = {
  appcache: true,
  cache: true,
  cacheStorage: true,
  cookies: true,
  downloads: false, // Keep downloads by default
  fileSystems: true,
  formData: true,
  history: true,
  indexedDB: true,
  localStorage: true,
  passwords: false, // Keep saved passwords
  serviceWorkers: true,
  webSQL: true,
};
