"use strict";

// Elemente abrufen
const lastCleanEl = document.getElementById('lastClean');
const nextCleanEl = document.getElementById('nextClean');
const cleanCountEl = document.getElementById('cleanCount');
const cleanNowBtn = document.getElementById('cleanNowBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
// FOUR_DAYS_MS is defined in constants.js and available globally

// Status beim Laden abrufen
updateStatus();

// Button Event Listener
cleanNowBtn.addEventListener('click', () => {
  cleanNowBtn.disabled = true;
  cleanNowBtn.textContent = 'Lösche...';
  let handled = false;

  const timeoutId = setTimeout(() => {
    if (!handled) {
      handled = true;
      console.error('Keine Antwort vom Hintergrundskript.');
      errorMessage.style.display = 'block';
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 3000);
      cleanNowBtn.disabled = false;
      cleanNowBtn.textContent = 'Jetzt löschen';
    }
  }, 5000);

  chrome.runtime.sendMessage({action: 'clearNow'}, (response) => {
    if (handled) {
      return;
    }
    handled = true;
    clearTimeout(timeoutId);

    if (chrome.runtime.lastError || !(response && response.success)) {
      if (chrome.runtime.lastError) {
        console.error('Fehler beim Senden der Nachricht:', chrome.runtime.lastError);
      }
      errorMessage.style.display = 'block';
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 3000);
      cleanNowBtn.disabled = false;
      cleanNowBtn.textContent = 'Jetzt löschen';
      return;
    }

    successMessage.style.display = 'block';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);

    // Status nach kurzer Verzögerung aktualisieren
    setTimeout(() => {
      updateStatus();
      cleanNowBtn.disabled = false;
      cleanNowBtn.textContent = 'Jetzt löschen';
    }, 1000);
  });
});

// Status aktualisieren
function updateStatus() {
  chrome.runtime.sendMessage({action: 'getStatus'}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Fehler beim Abrufen des Status:', chrome.runtime.lastError);
      lastCleanEl.textContent = 'unbekannt';
      nextCleanEl.textContent = 'unbekannt';
      cleanCountEl.textContent = '0';
      return;
    }
    if (response) {
      // Letzte Löschung formatieren
      const lastCleanDate = new Date(response.lastCleanTime);
      lastCleanEl.textContent = formatDate(lastCleanDate);
      
      // Nächste Löschung berechnen
      const nextCleanDate = new Date(response.lastCleanTime + FOUR_DAYS_MS);
      nextCleanEl.textContent = formatDate(nextCleanDate);
      
      // Anzahl anzeigen
      cleanCountEl.textContent = response.cleanCount || 0;
    }
  });
}

// Datum formatieren
const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });

function formatDate(date) {
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const absSec = Math.abs(diffSec);

  let value;
  let unit;
  if (absSec >= 86400) {
    value = Math.round(diffSec / 86400);
    unit = 'day';
  } else if (absSec >= 3600) {
    value = Math.round(diffSec / 3600);
    unit = 'hour';
  } else if (absSec >= 60) {
    value = Math.round(diffSec / 60);
    unit = 'minute';
  } else {
    value = diffSec;
    unit = 'second';
  }

  return rtf.format(value, unit);
}