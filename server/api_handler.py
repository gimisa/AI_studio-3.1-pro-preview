import os
from server.message_factory import MessageFactory

class ApiHandler:
	def __init__(self, config, session_store, client):
		self.config = config
		self.session_store = session_store
		self.client = client

	def handle(self, question: str, project_name: str, front_api_key: str) -> dict:
		if not question:
			raise ValueError("Question vide.")

		session_data = self.session_store.load(project_name)
		meta = session_data["metadata"]
		history = session_data["history"]

		# Résolution de la clé API
		api_key = front_api_key or meta.get("api_key") or self.config.fallback_api_key
		if not api_key:
			raise ValueError("Aucune clé API GEMINI trouvée. Veuillez en saisir une.")
		
		meta["api_key"] = api_key

		# Contexte système (non stocké dans history)
		sys_content = self._build_system_context(project_name)
		sys_instr = MessageFactory.build_system_instruction(sys_content)

		# =====================================================================
		# STRATÉGIE "LEAN CONTEXT" : MINIMISATION DES JETONS (GiMiSa V2.1)
		# =====================================================================
		# 1. Extraction des anciennes réponses de l'IA uniquement
		previous_ai_outputs = [
			msg["parts"][0]["text"] 
			for msg in history 
			if msg.get("role") == "model"
		]
		
		# 2. Construction d'un prompt combiné (Mémoire + Nouvelle Question)
		if previous_ai_outputs:
			memory_string = "\n\n--- PREVIOUS AI OUTPUTS ---\n\n".join(previous_ai_outputs)
			combo_prompt = f"Here is the established state of the project so far:\n{memory_string}\n\n--- NEW REQUEST ---\n{question}"
		else:
			combo_prompt = question

		# 3. Création d'un contexte allégé avec UN SEUL message utilisateur
		lean_context = MessageFactory.append_user_message([], combo_prompt)

		# =====================================================================

		# Appel API (On envoie lean_context, pas history)
		response = self.client.ask(api_key, lean_context, sys_instr)

		# Mise à jour de l'historique RÉEL (Pour sauvegarde JSON et affichage UI)
		history = MessageFactory.append_user_message(history, question)
		history = MessageFactory.append_model_message(history, response["answer"])
		
		tokens = meta["tokens_cumulative"]
		usage = response["usage"]
		tokens["in"] += usage["in"]
		tokens["out"] += usage["out"]
		tokens["cache"] += usage["cache"]

		session_data["history"] = history
		self.session_store.save(project_name, session_data)

		return {
			"answer": response["answer"],
			"usage": response["usage"],
			"cumulative": tokens,
			"session_file": f"{self.session_store.sanitize_filename(project_name)}.json",
			"sys_loaded": self._loaded_files_str()
		}

	def _build_system_context(self, project_name: str) -> str:
		parts, loaded = [], []
		for filename, label in [("sessions/GiMiSa_note.yaml", "GiMiSa"), ("sessions/prompt_init.md", "Prompt")]:
			if os.path.exists(filename):
				try:
					with open(filename, "r", encoding="utf-8") as f:
						parts.append(f"--- {label.upper()} ---\n{f.read()}")
					loaded.append(label)
				except IOError:
					pass
		
		parts.append(f"Project Name: {project_name}")
		self._last_loaded = loaded
		return "\n".join(parts)

	def _loaded_files_str(self) -> str:
		lst = getattr(self, '_last_loaded', [])
		return "+".join(lst) if lst else "Aucun"
