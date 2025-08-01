"use strict";

// Elemente abrufen
const lastCleanEl   = document.getElementById('lastClean');
const nextCleanEl   = document.getElementById('nextClean');
const cleanCountEl  = document.getElementById('cleanCount');
const cleanNowBtn   = document.getElementById('cleanNowBtn');
const successMessage= document.getElementById('successMessage');
const errorMessage  = document.getElementById('errorMessage');

// Lädt den aktuellen Status aus chrome.storage und updatet das UI
async function updateStatus() {
  const data = await new Promise(resolve => {
    chrome.storage.local.get(
      ['lastCleanTime', 'cleanCount'],
      resolve
    );
  });

  const { lastCleanTime = 0, cleanCount = 0 } = data;

  // Anzahl updaten
  cleanCountEl.textContent = cleanCount;

  // Wenn es noch keinen Vorgang gab, belassen wir die "unbekannt"-Anzeige
  if (lastCleanTime > 0) {
    const lastDate = new Date(lastCleanTime);
    lastCleanEl.textContent = lastDate.toLocaleString();

    // Nächste Löschung = lastCleanTime + Intervall
    const nextTime = lastCleanTime + FOUR_DAYS_MS;
    const now = Date.now();

    // relative Anzeige: „in x Tagen“ oder „vor x Tagen“
    const diff = nextTime - now;
    nextCleanEl.textContent = formatRelative(diff);
  }
}

// Relativzeit-Formatter (nur deutsch, grobe Einheiten)
function formatRelative(diffMs) {
  const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
  const diffSec = Math.round(diffMs / 1000);
  const absSec  = Math.abs(diffSec);

  if (absSec >= 86400) {
    return rtf.format(Math.round(diffSec / 86400), 'day');
  } else if (absSec >= 3600) {
    return rtf.format(Math.round(diffSec / 3600), 'hour');
  } else if (absSec >= 60) {
    return rtf.format(Math.round(diffSec / 60), 'minute');
  } else {
    return rtf.format(diffSec, 'second');
  }
}

// Klick auf „Jetzt löschen“
cleanNowBtn.addEventListener('click', () => {
  cleanNowBtn.disabled = true;
  successMessage.style.display = 'none';
  errorMessage.style.display   = 'none';

  chrome.runtime.sendMessage(
    { action: 'clearNow' },
    response => {
      cleanNowBtn.disabled = false;
      if (response?.success) {
        successMessage.style.display = 'block';
        // Status neu laden
        updateStatus();
      } else {
        errorMessage.style.display = 'block';
      }
    }
  );
});

// Direkt beim Laden den Status anzeigen
updateStatus();
