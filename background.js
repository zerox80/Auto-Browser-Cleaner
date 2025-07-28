// Konstante für 4 Tage in Minuten
const VIER_TAGE_IN_MINUTEN = 4 * 24 * 60; // 5760 Minuten

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
    clearAllBrowserData();
  }
});

// Funktion zum Löschen der Browserdaten
function clearAllBrowserData() {
  const oneYearAgo = (new Date()).getTime() - (1000 * 60 * 60 * 24 * 365);
  
  chrome.browsingData.remove({
    "since": oneYearAgo
  }, {
    "appcache": true,
    "cache": true,
    "cacheStorage": true,
    "cookies": true,
    "downloads": false, // Downloads behalten
    "fileSystems": true,
    "formData": true,
    "history": true,
    "indexedDB": true,
    "localStorage": true,
    "passwords": false, // Passwörter behalten
    "serviceWorkers": true,
    "webSQL": true
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Fehler beim Löschen der Browserdaten:', chrome.runtime.lastError);
      return;
    }
    console.log('Browserdaten wurden gelöscht');
    
    // Aktualisiere die Zeit der letzten Löschung und erhöhe den Zähler
    chrome.storage.local.get(['cleanCount'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Fehler beim Lesen des cleanCount:', chrome.runtime.lastError);
        return;
      }
      const count = (result.cleanCount || 0) + 1;
      chrome.storage.local.set({
        lastCleanTime: Date.now(),
        cleanCount: count
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Fehler beim Aktualisieren der letzten Löschung:', chrome.runtime.lastError);
        }
      });
    });
  });
}

// Manuelles Löschen über Nachricht vom Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'clearNow') {
    clearAllBrowserData();
    sendResponse({success: true});
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