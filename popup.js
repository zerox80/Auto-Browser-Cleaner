// Elemente abrufen
const lastCleanEl = document.getElementById('lastClean');
const nextCleanEl = document.getElementById('nextClean');
const cleanCountEl = document.getElementById('cleanCount');
const cleanNowBtn = document.getElementById('cleanNowBtn');
const successMessage = document.getElementById('successMessage');

// Status beim Laden abrufen
updateStatus();

// Button Event Listener
cleanNowBtn.addEventListener('click', () => {
  cleanNowBtn.disabled = true;
  cleanNowBtn.textContent = 'Lösche...';
  
  chrome.runtime.sendMessage({action: 'clearNow'}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Fehler beim Senden der Nachricht:', chrome.runtime.lastError);
      cleanNowBtn.disabled = false;
      cleanNowBtn.textContent = 'Jetzt löschen';
      return;
    }
    if (response && response.success) {
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
    }
  });
});

// Status aktualisieren
function updateStatus() {
  chrome.runtime.sendMessage({action: 'getStatus'}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Fehler beim Abrufen des Status:', chrome.runtime.lastError);
      return;
    }
    if (response) {
      // Letzte Löschung formatieren
      const lastCleanDate = new Date(response.lastCleanTime);
      lastCleanEl.textContent = formatDate(lastCleanDate);
      
      // Nächste Löschung berechnen
      const nextCleanDate = new Date(response.lastCleanTime + (4 * 24 * 60 * 60 * 1000));
      nextCleanEl.textContent = formatDate(nextCleanDate);
      
      // Anzahl anzeigen
      cleanCountEl.textContent = response.cleanCount || 0;
    }
  });
}

// Datum formatieren
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (date > now) {
    // Zukunft
    const futureDiffMs = date - now;
    const futureDiffDays = Math.floor(futureDiffMs / (1000 * 60 * 60 * 24));
    const futureDiffHours = Math.floor(futureDiffMs / (1000 * 60 * 60));
    
    if (futureDiffDays > 0) {
      return `in ${futureDiffDays} Tag${futureDiffDays === 1 ? '' : 'en'}`;
    } else if (futureDiffHours > 0) {
      return `in ${futureDiffHours} Stunde${futureDiffHours === 1 ? '' : 'n'}`;
    } else {
      return 'in wenigen Minuten';
    }
  } else {
    // Vergangenheit
    if (diffDays > 0) {
      return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    } else if (diffHours > 0) {
      return `vor ${diffHours} Stunde${diffHours === 1 ? '' : 'n'}`;
    } else if (diffMinutes > 0) {
      return `vor ${diffMinutes} Minute${diffMinutes === 1 ? '' : 'n'}`;
    } else {
      return 'gerade eben';
    }
  }
}