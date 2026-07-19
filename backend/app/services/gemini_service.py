import os
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Read Gemini API Key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

# Initialize Gemini Client
client = genai.Client(api_key=api_key)

# Models to try in order
MODELS = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
]


def generate_answer(question: str, context: str) -> str:
    """
    Generates an answer using only the supplied document context.
    Automatically falls back to another Gemini model if one is unavailable.
    """

    prompt = f"""
You are NexusBrain AI.

You are an enterprise document assistant.

Rules:
1. Answer ONLY from the supplied document context.
2. Never use outside knowledge.
3. Never hallucinate or invent information.
4. If the answer is not found in the context, reply EXACTLY:
"I couldn't find this information in the uploaded documents."

================ DOCUMENT CONTEXT ================

{context}

================ USER QUESTION ================

{question}

================ ANSWER ================
"""

    last_error = None

    for model in MODELS:
        try:
            print(f"Trying Gemini model: {model}")

            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )

            if response.text:
                print(f"Success with model: {model}")
                return response.text.strip()

        except Exception as e:
            print(f"Model {model} failed: {e}")
            last_error = e

    raise RuntimeError(f"All Gemini models failed.\nLast error: {last_error}")