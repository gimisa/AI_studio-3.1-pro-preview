    import { fetchLastSession, askQuestion } from './api-client.js';
    import { initializeFileInput, getAttachments, clearAttachments } from './file-handler.js';
    import { appendUserMessage, showLoadingIndicator, removeLoading, appendBotMessage, appendError, updateTokensUI } from './chat-renderer.js';
    import { escapeHtml } from './utils.js';

    let currentSessionProject = "";

    document.addEventListener('DOMContentLoaded', async () => {
      initializeFileInput();

      try {
          const keysResponse = await fetch('/api/keys');
          const keysData = await keysResponse.json();
          const selectKey = document.getElementById('api_key');
          const kIcon = document.getElementById('keyIcon');
          
          if (keysData.keys && keysData.keys.length > 0) {
              keysData.keys.forEach(keyName => {
                  const opt = document.createElement('option');
                  opt.value = keyName;
                  opt.textContent = keyName;
                  selectKey.appendChild(opt);
              });
          } else {
              const inputKey = document.createElement('input');
              inputKey.type = 'password';
              inputKey.id = 'api_key'; 
              inputKey.className = 'dropdown';
              inputKey.placeholder = 'Collez la clé API ici...';
              selectKey.parentNode.replaceChild(inputKey, selectKey);

              kIcon.style.cursor = 'pointer';
              kIcon.title = "Cliquez pour chercher comment obtenir une clé API Google";
              kIcon.addEventListener('click', () => {
                  window.open('https://www.google.com/search?q=Obtenir+clé+API+Google+AI+Studio', '_blank');
              });
          }
      } catch (e) {
          console.error("Erreur réseau: Impossible de lire les clés OS", e);
      }  

      try {
          const data = await fetchLastSession();
          if (data && data.project) {
              currentSessionProject = data.project;
              document.getElementById('project').value = data.project;
              if (data.has_key) {
                  document.getElementById('api_key').style.display = 'none';
                  document.getElementById('keyIcon').style.opacity = '0.3';
                  document.getElementById('keyIcon').style.pointerEvents = 'none';
              }
              updateTokensUI(data.tokens);
              appendUserMessage(`<i>[Session Restaurée: ${data.project}]</i>`, []);
          } else {
              document.getElementById('project').value = "";
              document.getElementById('api_key').style.display = 'none';
          }
      } catch (e) {
          console.error("Init session failed:", e);
      }

      document.getElementById('project').addEventListener('input', (e) => {
          const val = e.target.value.trim();
          const kInput = document.getElementById('api_key');
          const kIcon = document.getElementById('keyIcon');

          if (val.length <= 3) {
              kInput.style.display = 'none';
              kIcon.style.opacity = '1';
              kIcon.style.color = '';
              kIcon.style.pointerEvents = 'auto'; 
          } else if (val !== currentSessionProject) {
              kInput.style.display = 'inline-block';
              kIcon.style.opacity = '1';
              kIcon.style.color = '#d32f2f'; 
              kIcon.style.pointerEvents = 'auto'; 
          } else {
              kInput.style.display = 'none';
              kIcon.style.opacity = '0.3';
              kIcon.style.color = '';
              kIcon.style.pointerEvents = 'none';
          }
      });

      document.getElementById('attachBtn').addEventListener('click', () => {
          document.getElementById('fileInput').click();
      });

      document.getElementById('question').addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
          }
      });
    });

    async function send() {
      const qInput = document.getElementById('question');
      const pInput = document.getElementById('project');
      const kInput = document.getElementById('api_key');
      const kIcon = document.getElementById('keyIcon');
      
      const q = qInput.value.trim();
      const proj = pInput.value.trim() || 'sans_titre';
      const key = kInput.value.trim();
      
      const { content: attachedContent, names: attachedNames } = getAttachments();

      if (!q && !attachedContent) return;

      if (proj !== currentSessionProject && currentSessionProject !== "") {
          document.getElementById('chat').innerHTML = ''; 
          updateTokensUI({in: 0, out: 0, cache: 0}); 
          
          const lastTokensBox = document.getElementById('last-request-tokens');
          if (lastTokensBox) {
              lastTokensBox.innerHTML = '<span class="metric-item">&#x2B07; 0</span><span class="metric-item">&#x2B06; 0</span><span class="metric-item">&#x267B; 0</span>';
          }
          
          appendUserMessage(`<i>[Nouvelle Session Initiée : ${proj}]</i>`, []);
      }

      const promptPrefix = "reread gimisa_notes and apply to following question.\n";
      const finalQuestion = promptPrefix + q + (attachedContent ? "\n" + attachedContent : "");
      const displayQ = q ? escapeHtml(q) : "<i>[Fichiers envoyés]</i>";

      appendUserMessage(displayQ, attachedNames);
      qInput.value = '';
      clearAttachments();

      const loaderId = showLoadingIndicator();

      try {
          const data = await askQuestion(finalQuestion, proj, key);
          removeLoading(loaderId);

          if (data.error) {
              appendError(data.error);
          } else {
              appendBotMessage(data);
              updateTokensUI(data.cumulative);
              
              if (proj.length > 3) {
                  currentSessionProject = proj;
              }
              
              kInput.style.display = 'none';
              kIcon.style.opacity = '0.3';
              kIcon.style.color = ''; 
              kIcon.style.pointerEvents = 'none'; 
          }
      } catch (err) {
          removeLoading(loaderId);
          appendError(err.toString());
      }
    }
