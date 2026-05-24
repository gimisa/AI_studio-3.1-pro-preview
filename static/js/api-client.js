export async function fetchLastSession() {
  const response = await fetch('/api/last_session');
  if (!response.ok) throw new Error("Erreur chargement session");
  return response.json();
}

export async function askQuestion(question, project, api_key) {
  const response = await fetch('/api/ask', {
	  method: 'POST',
	  headers: { 'Content-Type': 'application/json' },
	  body: JSON.stringify({ question, project, api_key })
  });
  return response.json();
}

