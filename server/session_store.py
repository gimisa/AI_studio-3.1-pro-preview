import os
import json
import re
import time

class SessionStore:
  def __init__(self, base_dir="sessions"):
	  self.base_dir = base_dir
	  os.makedirs(self.base_dir, exist_ok=True)

  @staticmethod
  def sanitize_filename(name: str) -> str:
	  return re.sub(r'[^a-zA-Z0-9_\-]', '_', name)

  def _get_default_schema(self) -> dict:
	  return {
		  "metadata": {
			  "api_key": "",
			  "last_updated": time.time(),
			  "tokens_cumulative": {"in": 0, "out": 0, "cache": 0}
		  },
		  "history": []
	  }

  def load(self, project_name: str) -> dict:
	  filepath = os.path.join(self.base_dir, f"{self.sanitize_filename(project_name)}.json")
	  if not os.path.exists(filepath):
		  return self._get_default_schema()
	  
	  try:
		  with open(filepath, "r", encoding="utf-8") as f:
			  data = json.load(f)
			  if "metadata" not in data:
				  raise ValueError("Schema JSON invalide. 'metadata' manquant.")
			  return data
	  except json.JSONDecodeError as e:
		  raise IOError(f"Corruption du fichier {filepath}: {e}") from e

  def save(self, project_name: str, data: dict) -> None:
	  data["metadata"]["last_updated"] = time.time()
	  filepath = os.path.join(self.base_dir, f"{self.sanitize_filename(project_name)}.json")
	  try:
		  with open(filepath, "w", encoding="utf-8") as f:
			  json.dump(data, f, indent=4, ensure_ascii=False)
	  except IOError as e:
		  raise IOError(f"Échec d'écriture de la session {filepath}: {e}") from e

  def get_last_session(self) -> tuple:
	  files = [f for f in os.listdir(self.base_dir) if f.endswith('.json')]
	  if not files:
		  return None, None
	  
	  paths = [os.path.join(self.base_dir, f) for f in files]
	  latest_file = max(paths, key=os.path.getmtime)
	  project_name = os.path.basename(latest_file).replace('.json', '')
	  
	  try:
		  data = self.load(project_name)
		  return project_name, data
	  except Exception:
		  return None, None
