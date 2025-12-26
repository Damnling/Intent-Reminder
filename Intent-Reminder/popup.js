document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save-session");
    const restoreButton = document.getElementById("restore-session");
    const sessionNameInput = document.getElementById("session-name");
    const savedSessionsDropdown = document.getElementById("saved-sessions");
    const statusText = document.getElementById("status");
  
    // --- Helper: Load saved sessions into dropdown ---
    function refreshDropdown() {
      chrome.storage.local.get("sessions", (result) => {
        const sessions = result.sessions || [];
        savedSessionsDropdown.innerHTML = `<option value="">-- Select session --</option>`;
        sessions.forEach((s, index) => {
          const option = document.createElement("option");
          option.value = index;
          option.textContent = s.name + " (" + new Date(s.timestamp).toLocaleString() + ")";
          savedSessionsDropdown.appendChild(option);
        });
      });
    }
  
    refreshDropdown();
  
    // --- SAVE SESSION ---
    saveButton.addEventListener("click", () => {
      const name = sessionNameInput.value.trim() || "Unnamed Session";
  
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const newSession = {
          name,
          timestamp: new Date().toISOString(),
          tabs: tabs.map(tab => ({ title: tab.title, url: tab.url }))
        };
  
        chrome.storage.local.get("sessions", (result) => {
          const sessions = result.sessions || [];
          sessions.push(newSession);
          chrome.storage.local.set({ sessions }, () => {
            statusText.textContent = `Session "${name}" saved!`;
            console.log("Saved sessions:", sessions);
            refreshDropdown();
            sessionNameInput.value = "";
          });
        });
      });
    });
  
    // --- RESTORE SELECTED SESSION ---
    restoreButton.addEventListener("click", () => {
      const selectedIndex = savedSessionsDropdown.value;
      if (selectedIndex === "") {
        statusText.textContent = "Please select a session!";
        return;
      }
  
      chrome.storage.local.get("sessions", (result) => {
        const sessions = result.sessions || [];
        const session = sessions[selectedIndex];
  
        if (!session || !session.tabs) {
          statusText.textContent = "Session data missing!";
          return;
        }
  
        session.tabs.forEach(tab => {
          chrome.tabs.create({ url: tab.url });
        });
  
        statusText.textContent = `Restored "${session.name}" (${session.tabs.length} tabs)`;
        console.log("Restored session:", session);
      });
    });
  });
  