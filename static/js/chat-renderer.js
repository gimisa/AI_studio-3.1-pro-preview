import { escapeHtml } from './utils.js';

// Stockage des compteurs pour éviter les fuites de mémoire
const activeTimers = {};

export function appendUserMessage(displayQ, attachments) {
  const chat = document.getElementById('chat');
  let html = `<div class="msg user"><b>Vous:</b><br>${displayQ}`;
  if (attachments && attachments.length > 0) {
      html += `<br><i style='color:#00bfa5;'>+ &#x1F4CE; ${attachments.join(", ")}</i>`;
  }
  html += `</div>`;
  chat.insertAdjacentHTML('beforeend', html);
  chat.scrollTop = chat.scrollHeight;
}

export function showLoadingIndicator() {
  const chat = document.getElementById('chat');
  const id = 'load-' + Date.now();
  
  // Design minimaliste : Uniquement le spinner et le chronomètre
  chat.insertAdjacentHTML('beforeend', `
    <div class="msg bot" id="${id}">
        <div class="loading-container">
            <div class="spinner"></div>
            <span><span id="timer-${id}">0</span>s</span>
        </div>
    </div>
  `);
  chat.scrollTop = chat.scrollHeight;

  // Lancement du chronomètre
  let seconds = 0;
  activeTimers[id] = setInterval(() => {
      seconds++;
      const timerSpan = document.getElementById(`timer-${id}`);
      if (timerSpan) {
          timerSpan.innerText = seconds;
      } else {
          clearInterval(activeTimers[id]);
          delete activeTimers[id];
      }
  }, 1000);

  return id;
}

export function removeLoading(loaderId) {
  // ARRÊT DU CHRONOMÈTRE AVANT DE DÉTRUIRE LE MESSAGE
  if (activeTimers[loaderId]) {
      clearInterval(activeTimers[loaderId]);
      delete activeTimers[loaderId];
  }
  
  const el = document.getElementById(loaderId);
  if (el) el.remove();
}

export function appendBotMessage(data) {
  const chat = document.getElementById('chat');
  let msgHtml = `<div class="msg bot">`;
  
  msgHtml += `<div class="system-info">&#x1F4C1; ${escapeHtml(data.session_file)} | &#x2699; ${escapeHtml(data.sys_loaded)}</div>`;
  msgHtml += `<b>Gemini:</b><br>`;
  const rawAnswer = data.answer || "";
  
  if (rawAnswer.includes("```")) {
      const parts = rawAnswer.split("```");
      parts.forEach((part, index) => {
          if (index % 2 === 1) {
              const lines = part.split('\n');
              const content = lines.slice(1).join('\n') || part;
              msgHtml += `<pre><code>${escapeHtml(content)}</code></pre>`;
          } else {
              msgHtml += `<span style="white-space: pre-wrap;">${escapeHtml(part)}</span>`;
          }
      });
  } else {
      msgHtml += `<span style="white-space: pre-wrap;">${escapeHtml(rawAnswer)}</span>`;
  }

  msgHtml += `</div>`;
  
  chat.insertAdjacentHTML('beforeend', msgHtml);
  chat.scrollTop = chat.scrollHeight;

  const lastTokensBox = document.getElementById('last-request-tokens');
  if (lastTokensBox && data.usage) {
      lastTokensBox.innerHTML = `
          <span class="metric-item" title="Tokens In">&#x2B07; ${data.usage.in}</span>
          <span class="metric-item" title="Tokens Out">&#x2B06; ${data.usage.out}</span>
          <span class="metric-item" title="Tokens Cache">&#x267B; ${data.usage.cache}</span>
      `;
  }
}

export function appendError(err) {
  const chat = document.getElementById('chat');
  chat.insertAdjacentHTML('beforeend', `<div class="msg bot" style="color:red;"><b>Erreur:</b> ${escapeHtml(err)}</div>`);
  chat.scrollTop = chat.scrollHeight;
}

export function updateTokensUI(cumulative) {
  if (!cumulative) return;
  const counter = document.getElementById('token-counter');
  counter.innerHTML = `
    <span class="metric-item" title="Total Tokens In">&#x2B07; ${cumulative.in}</span>
    <span class="metric-item" title="Total Tokens Out">&#x2B06; ${cumulative.out}</span>
    <span class="metric-item" title="Total Tokens Cache">&#x267B; ${cumulative.cache}</span>
  `;
}
