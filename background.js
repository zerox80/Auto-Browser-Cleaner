"use strict";

// Konstanten für die Zeitabstände
const VIER_TAGE_IN_MINUTEN = 4 * 24 * 60; // 5760 Minuten
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const FOUR_DAYS_MS = VIER_TAGE_IN_MINUTEN * 60 * 1000;

// Einfache konfigurierbare Logging-Funktion
const DEBUG_LOGGING = false;
const log = (...args) => {
  if (DEBUG_LOGGING) {
    console.debug(...args);
  }
};

// Beim Installieren der Extension
chrome.runtime.onInstalled.addListener(() => {
  log('Auto Browser Cleaner installiert');
  
  // Erstelle einen wiederkehrenden Alarm
  chrome.alarms.create('clearBrowserData', {
    periodInMinutes: VIER_TAGE_IN_MINUTEN,
    delayInMinutes: VIER_TAGE_IN_MINUTEN
  });
  
  // Speichere den Installationszeitpunkt
  chrome.storage.local.set({
    installTime: Date.now(),
    lastCleanTime: Date.now()
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Fehler beim Speichern des Installationszeitpunkts:', chrome.runtime.lastError);
    }
  });
});

// Wenn der Alarm ausgelöst wird
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'clearBrowserData') {
    clearAllBrowserData().catch((err) => {
      console.error('Fehler beim periodischen Löschen:', err);
    });
  }
});

// Funktion zum Löschen der Browserdaten
async function clearAllBrowserData() {
  const defaultSince = Date.now() - ONE_YEAR_MS;
  const { lastCleanTime = 0, cleanCount = 0 } = await new Promise((resolve) => {
    chrome.storage.local.get(['lastCleanTime', 'cleanCount'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Fehler beim Lesen von lastCleanTime/cleanCount:', chrome.runtime.lastError);
        resolve({ lastCleanTime: 0, cleanCount: 0 });
        return;
      }
      resolve(result);
    });
  });

  const since = Math.max(lastCleanTime, defaultSince);

  await new Promise((resolve, reject) => {
    chrome.browsingData.remove(
      { since },
      {
        appcache: true,
        cache: true,
        cacheStorage: true,
        cookies: true,
        downloads: false, // Downloads behalten
        fileSystems: true,
        formData: true,
        history: true,
        indexedDB: true,
        localStorage: true,
        passwords: false, // Passwörter behalten
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

  log('Browserdaten wurden gelöscht');

  await new Promise((resolve, reject) => {
    chrome.storage.local.set(
      {
        lastCleanTime: Date.now(),
        cleanCount: cleanCount + 1
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
}

// Manuelles Löschen über Nachricht vom Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'clearNow') {
    clearAllBrowserData()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(() => {
        sendResponse({ success: false });
      });
    return true; // Asynchrone Antwort
  } else if (request.action === 'getStatus') {
    chrome.storage.local.get(['lastCleanTime', 'cleanCount'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Fehler beim Abrufen des Status:', chrome.runtime.lastError);
        sendResponse({
          lastCleanTime: Date.now(),
          cleanCount: 0
        });
        return;
      }
      sendResponse({
        lastCleanTime: result.lastCleanTime || Date.now(),
        cleanCount: result.cleanCount || 0
      });
    });
    return true; // Asynchrone Antwort
  }
});