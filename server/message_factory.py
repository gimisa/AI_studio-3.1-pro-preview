class MessageFactory:
  """Formatage strict pour l'API Google Gemini."""
  
  @staticmethod
  def build_system_instruction(system_content: str) -> dict:
	  if not system_content or not system_content.strip():
		  return None
	  return {"parts": [{"text": system_content.strip()}]}

  @staticmethod
  def append_user_message(history: list, question: str) -> list:
	  history.append({"role": "user", "parts": [{"text": question}]})
	  return history

  @staticmethod
  def append_model_message(history: list, answer: str) -> list:
	  history.append({"role": "model", "parts": [{"text": answer}]})
	  return history
