// file-handler.js – GiMiSa v2.1
// Stockage persistant des fichiers attachés
let attachedFiles = []; // Array<{name: string, content: string}>

function formatContent() {
  return attachedFiles
    .map(f => `\n\n--- DEBUT DU FICHIER : ${f.name} ---\n${f.content}\n--- FIN DU FICHIER : ${f.name} ---\n`)
    .join('');
}

function renderBadges() {
  const container = document.getElementById('fileBadges');
  if (!container) return;
  container.innerHTML = '';
  
  if (attachedFiles.length === 0) {
    return;
  }
  
  attachedFiles.forEach((file, index) => {
    const badge = document.createElement('span');
    badge.className = 'file-badge';
    // Ajout d'une marge et d'une icône explicite pour la suppression
    badge.innerHTML = `${file.name} <span style="margin-left: 8px; color: #ff6b6b; font-weight: bold;">&times;</span>`;
    badge.style.marginRight = '10px'; 
    badge.style.cursor = 'pointer';
    badge.title = `Cliquer pour retirer ${file.name}`;
    
    badge.addEventListener('click', () => {
      attachedFiles.splice(index, 1);
      renderBadges();
      document.getElementById('fileInput').value = '';
      updatePreviewText();
    });
    
    container.appendChild(badge);
  });
  updatePreviewText();
}

function updatePreviewText() {
  const preview = document.getElementById('filePreview');
  if (!preview) return;
  if (attachedFiles.length === 0) {
    preview.innerHTML = '';
  } else {
    // Espacement garanti entre les éléments du preview
    preview.innerHTML = '📎 ' + attachedFiles.map(f => `[${f.name}]`).join('  ');
  }
}

export function initializeFileInput() {
  const fileInput = document.getElementById('fileInput');
  const fileBadges = document.getElementById('fileBadges');
  if (!fileInput || !fileBadges) return;

  if (!initializeFileInput._init) {
    fileInput.addEventListener('change', async (event) => {
      const files = event.target.files;
      if (files.length === 0) return;
      for (const file of files) {
        const existingIndex = attachedFiles.findIndex(f => f.name === file.name);
        const content = await file.text();
        if (existingIndex !== -1) {
          attachedFiles[existingIndex] = { name: file.name, content };
        } else {
          attachedFiles.push({ name: file.name, content });
        }
      }
      fileInput.value = '';
      renderBadges();
    });
    initializeFileInput._init = true;
  }
}

export function getAttachments() {
  return {
    content: formatContent(),
    names: attachedFiles.map(f => f.name)
  };
}

export function clearAttachments() {
  attachedFiles = [];
  renderBadges();
  document.getElementById('fileInput').value = '';
}
