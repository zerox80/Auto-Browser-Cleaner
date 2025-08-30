"use strict";

// Elemente abrufen
const lastCleanEl   = document.getElementById('lastClean');
const nextCleanEl   = document.getElementById('nextClean');
const cleanCountEl  = document.getElementById('cleanCount');
const cleanNowBtn   = document.getElementById('cleanNowBtn');
const successMessage= document.getElementById('successMessage');
const errorMessage  = document.getElementById('errorMessage');
const intervalLabel = document.getElementById('intervalLabel');

// Lädt den aktuellen Status aus chrome.storage und updatet das UI
async function updateStatus() {
  try {
    const data = await new Promise(resolve => {
      chrome.storage.local.get(
        [STORAGE_KEYS.lastCleanTime, STORAGE_KEYS.cleanCount, STORAGE_KEYS.intervalMinutes],
        resolve
      );
    });

    const lastCleanTime = data[STORAGE_KEYS.lastCleanTime] ?? 0;
    const cleanCount = data[STORAGE_KEYS.cleanCount] ?? 0;
    const intervalMinutes = Number.isFinite(data[STORAGE_KEYS.intervalMinutes]) && data[STORAGE_KEYS.intervalMinutes] > 0
      ? data[STORAGE_KEYS.intervalMinutes]
      : DEFAULT_INTERVAL_MINUTES;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Anzahl updaten
    cleanCountEl.textContent = cleanCount;
    // Intervall-Label updaten (in Tagen, mind. 1 Dezimalstelle wenn < 1 Tag)
    if (intervalLabel) {
      const days = intervalMinutes / (60 * 24);
      intervalLabel.textContent = days >= 1 ? String(Math.round(days)) : days.toFixed(1).replace('.', ',');
    }

    // Wenn es noch keinen Vorgang gab, belassen wir die "unbekannt"-Anzeige
    if (lastCleanTime > 0) {
      const lastDate = new Date(lastCleanTime);
      lastCleanEl.textContent = lastDate.toLocaleString();
      lastCleanEl.title = lastDate.toString();

      // Fallback: Nächste Löschung = lastCleanTime + Intervall
      const fallbackNext = lastCleanTime + intervalMs;
      const now = Date.now();
      const fallbackDiff = fallbackNext - now;
      nextCleanEl.textContent = formatRelative(fallbackDiff);
      nextCleanEl.title = new Date(fallbackNext).toString();

      // Bevorzuge geplanten Alarm, falls vorhanden
      await showNextFromAlarmIfAvailable();
    } else {
      // Zeige geplanten Alarm, falls vorhanden (noch nie bereinigt)
      lastCleanEl.title = '';
      await showNextFromAlarmIfAvailable();
    }
  } catch (_) {
    // Im Popup schweigsam scheitern
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

// Liest den geplanten Alarm aus und zeigt die nächste Ausführung an
async function showNextFromAlarmIfAvailable() {
  try {
    if (!chrome?.alarms?.get) return;
    const alarm = await new Promise(resolve => chrome.alarms.get(ALARM_NAME, resolve));
    if (alarm?.scheduledTime) {
      const diff = alarm.scheduledTime - Date.now();
      nextCleanEl.textContent = formatRelative(diff);
      nextCleanEl.title = new Date(alarm.scheduledTime).toString();
    }
  } catch (_) {
    // ignoriere Fehler in der Popup-Ansicht
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
