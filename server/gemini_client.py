import json
import urllib.request
import urllib.error

class GeminiClient:
  def __init__(self, model_name="gemini-3.1-pro-preview"):
	  self.model_name = model_name
	  self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"

  def ask(self, api_key: str, contents: list, system_instruction: dict = None) -> dict:
	  if not api_key:
		  raise ValueError("Clé API Google Gemini manquante.")

	  url = f"{self.base_url}?key={api_key}"
	  payload = {"contents": contents}
	  if system_instruction:
		  payload["systemInstruction"] = system_instruction

	  data = json.dumps(payload).encode('utf-8')
	  headers = {"Content-Type": "application/json"}
	  req = urllib.request.Request(url, data=data, headers=headers, method='POST')

	  try:
		  with urllib.request.urlopen(req, timeout=300) as response:
			  result = json.loads(response.read().decode())
			  
			  try:
				  answer = result['candidates'][0]['content']['parts'][0]['text']
			  except (KeyError, IndexError):
				  raise ValueError("Format de réponse inattendu de Gemini.")

			  usage = result.get('usageMetadata', {})
			  return {
				  "answer": answer,
				  "usage": {
					  "in": usage.get("promptTokenCount", 0),
					  "out": usage.get("candidatesTokenCount", 0),
					  "cache": usage.get("cachedContentTokenCount", 0)
				  }
			  }
	  except urllib.error.HTTPError as e:
		  error_body = e.read().decode()
		  raise ConnectionError(f"HTTP {e.code}: {error_body}") from e
	  except Exception as e:
		  raise ConnectionError(f"Erreur réseau Gemini: {e}") from e
