"use strict";

// Reads the current interval from storage and initializes the UI
async function loadInterval() {
  const data = await new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.intervalMinutes], resolve);
  });
  const minutes = Number.isFinite(data[STORAGE_KEYS.intervalMinutes]) && data[STORAGE_KEYS.intervalMinutes] > 0
    ? data[STORAGE_KEYS.intervalMinutes]
    : DEFAULT_INTERVAL_MINUTES;

  // Try to pick a nice unit/value pair
  let value = minutes;
  let unit = 'minutes';
  if (minutes % (60 * 24) === 0) {
    value = minutes / (60 * 24);
    unit = 'days';
  } else if (minutes % 60 === 0) {
    value = minutes / 60;
    unit = 'hours';
  }

  document.getElementById('value').value = String(value);
  document.getElementById('unit').value = unit;
}

function toMinutes(value, unit) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return null;
  switch (unit) {
    case 'days': return Math.round(v * 24 * 60);
    case 'hours': return Math.round(v * 60);
    case 'minutes': return Math.round(v);
    default: return null;
  }
}

function clampMinutes(m) {
  return Math.min(Math.max(m, MIN_INTERVAL_MINUTES), MAX_INTERVAL_MINUTES);
}

async function saveInterval() {
  const valueEl = document.getElementById('value');
  const unitEl = document.getElementById('unit');
  const minutes = toMinutes(valueEl.value, unitEl.value);
  const ok = document.getElementById('msgOk');
  const err = document.getElementById('msgErr');
  ok.style.display = 'none';
  err.style.display = 'none';
  if (!minutes) {
    err.textContent = 'Bitte eine gültige Zahl > 0 angeben';
    err.style.display = 'block';
    return;
  }
  try {
    const clamped = clampMinutes(minutes);
    await new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEYS.intervalMinutes]: clamped }, resolve);
    });
    ok.textContent = clamped !== minutes
      ? `Gespeichert ✔️ (angepasst auf ${clamped} Minuten)`
      : 'Gespeichert ✔️';
    ok.style.display = 'block';
  } catch (_) {
    err.style.display = 'block';
  }
}

// Initialize
loadInterval();
document.getElementById('saveBtn').addEventListener('click', saveInterval);

