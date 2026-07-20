import json
import os

from app.services.gemini_service import MODELS, client

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")
METADATA_FILE = os.path.join(UPLOAD_DIR, "documents.json")


def build_graph():
    nodes = []
    edges = []

    if not os.path.exists(METADATA_FILE):
        return {
            "success": True,
            "nodes": [],
            "edges": []
        }

    with open(METADATA_FILE, "r") as f:
        metadata = json.load(f)

    # Prevent duplicate entity nodes
    added_entities = set()

    for stored_name, info in metadata.items():

        # ------------------------
        # Document node
        # ------------------------

        document_id = stored_name

        nodes.append({
            "id": document_id,
            "label": info.get("original_name", stored_name),
            "type": "document"
        })

        # ------------------------
        # Entity nodes
        # ------------------------

        entities = info.get("entities", [])

        for entity in entities:

            entity_name = entity.get("name", "").strip()

            if not entity_name:
                continue

            entity_id = f"entity_{entity_name.lower()}"

            # create entity node only once
            if entity_id not in added_entities:

                added_entities.add(entity_id)

                nodes.append({
                    "id": entity_id,
                    "label": entity_name,
                    "type": entity.get("type", "Other").lower()
                })

            # connect document -> entity

            edges.append({
                "source": document_id,
                "target": entity_id
            })

    return {
        "success": True,
        "nodes": nodes,
        "edges": edges
    }

def extract_entities(text: str):
    """
    Extract important entities from a document using Gemini.
    Returns a list like:
    [
        {"name": "Raghav Rana", "type": "Person"},
        {"name": "Java", "type": "Skill"}
    ]
    """

    prompt = f"""
You are an enterprise knowledge graph extraction engine.

Extract ONLY important entities from the document.

Return ONLY valid JSON.

Format:

[
  {{
    "name":"...",
    "type":"Person | Organization | Skill | Technology | Concept | Location | Project | Other"
  }}
]

Rules:

- No explanation.
- No markdown.
- No code block.
- Maximum 30 entities.
- Remove duplicates.

DOCUMENT:

{text}
"""

    last_error = None

    for model in MODELS:
        try:

            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )

            raw = response.text.strip()

            if raw.startswith("```"):
                raw = raw.replace("```json", "").replace("```", "").strip()

            return json.loads(raw)

        except Exception as e:
            last_error = e

    print(last_error)
    return []