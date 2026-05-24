import os

class ConfigManager:
  """Gère l'environnement de base."""
  def __init__(self):
	  self.fallback_api_key = os.environ.get("GEMINI_API_KEY", "")
