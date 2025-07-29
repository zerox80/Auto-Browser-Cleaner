"use strict";

// Shared constants
importScripts('constants.js');

// Konstanten für die Zeitabstände
const VIER_TAGE_IN_MINUTEN = FOUR_DAYS_MS / (60 * 1000); // 5760 Minuten
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
const FOUR_DAYS_MINUTES = FOUR_DAYS_MS / (60 * 1000);
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Beim Installieren der Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto Browser Cleaner installiert');
  
  // Erstelle einen wiederkehrenden Alarm
  chrome.alarms.create('clearBrowserData', {
    periodInMinutes: FOUR_DAYS_MINUTES,
    delayInMinutes: FOUR_DAYS_MINUTES
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

// Beim Start des Browsers
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['lastCleanTime'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Fehler beim Lesen von lastCleanTime:', chrome.runtime.lastError);
      return;
    }

    const lastClean = result.lastCleanTime || 0;
    if (Date.now() - lastClean > FOUR_DAYS_MS) {
      clearAllBrowserData().catch((err) => {
        console.error('Fehler beim Bereinigen beim Start:', err);
      });
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

  console.log('Browserdaten wurden gelöscht');

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
  if (sender.id !== chrome.runtime.id) {
    console.warn('Unerlaubte Nachricht von', sender.id);
    return;
  }
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
