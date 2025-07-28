"use strict";

// Konstante für 4 Tage in Minuten
const VIER_TAGE_IN_MINUTEN = 4 * 24 * 60; // 5760 Minuten
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Beim Installieren der Extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto Browser Cleaner installiert');
  
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
  const oneYearAgo = Date.now() - ONE_YEAR_MS;

  await new Promise((resolve, reject) => {
    chrome.browsingData.remove(
      { since: oneYearAgo },
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

  const { cleanCount = 0 } = await new Promise((resolve) => {
    chrome.storage.local.get(['cleanCount'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Fehler beim Lesen des cleanCount:', chrome.runtime.lastError);
        resolve({ cleanCount: 0 });
        return;
      }
      resolve(result);
    });
  });

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