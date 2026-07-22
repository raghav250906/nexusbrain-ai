# 🧠 NexusBrain
### Enterprise Knowledge Intelligence Platform

> **ET AI Hackathon 2026 | Problem Statement 8**
>
> **Team:** NEUROFORGE AI

---

## 📌 Overview

NexusBrain is an AI-powered Enterprise Knowledge Intelligence Platform that transforms unstructured enterprise documents into an intelligent organizational knowledge base.

Instead of relying on traditional keyword search, NexusBrain combines **Document Intelligence**, **Semantic Search**, **Knowledge Graphs**, and **Retrieval-Augmented Generation (RAG)** to enable employees to interact with enterprise knowledge through natural language.

---

## 🚀 Problem Statement

Large organizations generate thousands of documents containing valuable organizational knowledge.

Traditional document management systems make it difficult to:

- Locate relevant information quickly
- Connect related knowledge across documents
- Preserve institutional knowledge
- Support AI-assisted enterprise decision making

NexusBrain addresses these challenges by converting enterprise documents into an intelligent, searchable knowledge ecosystem.

---

# ✨ Features

- 📄 AI-powered PDF document ingestion
- 🧠 Automatic document summarization
- 🔍 Semantic search using vector embeddings
- 🗂 Metadata and entity extraction
- 🕸 Interactive Enterprise Knowledge Graph
- 💬 AI Reasoning Copilot (RAG)
- 📊 Enterprise Dashboard
- ⚡ FastAPI backend
- ⚛ React + Next.js frontend
- 📦 ChromaDB vector database
- 🤖 Ollama local LLM integration

---

# 🏗 System Architecture

```text
                  Enterprise Documents
                           │
                           ▼
                 PDF Text Extraction
                           │
                           ▼
             Metadata & Entity Extraction
                           │
                           ▼
          Sentence Transformer Embeddings
                           │
                           ▼
                     ChromaDB
                           │
                 Semantic Retrieval
                           │
                           ▼
              Retrieval-Augmented Generation
                           │
                           ▼
                    Ollama LLM
                           │
                           ▼
                 AI Reasoning Copilot
                           │
                           ▼
                 Enterprise User Interface
```

---

# 🖥 Application Modules

## 📊 Enterprise Dashboard

Provides a centralized overview of enterprise knowledge assets.

- Document statistics
- Processing status
- Knowledge overview
- Navigation workspace

<img width="2042" height="2048" alt="image" src="https://github.com/user-attachments/assets/5e149d02-2991-4d6d-a3cf-736813ba1677" />

---

## 📄 Cognitive Memory Corpus

Responsible for enterprise document ingestion.

Features:

- Upload PDF documents
- Automatic summarization
- Metadata extraction
- Entity extraction
- Vector embedding generation

<img width="1829" height="2048" alt="image" src="https://github.com/user-attachments/assets/741b8dfb-85fb-4e78-ac7b-0fa92ac98853" />

---

## 🕸 Knowledge Synapse Matrix

Interactive Knowledge Graph generated automatically from extracted entities.

Features:

- Document–Entity relationships
- Interactive visualization
- Dynamic graph generation
- Enterprise knowledge exploration

<img width="2048" height="1600" alt="image" src="https://github.com/user-attachments/assets/69d79087-0a9d-4c66-aecb-e09f868e5050" />

---

## 🤖 AI Reasoning Copilot

Enterprise conversational AI powered by Retrieval-Augmented Generation.

Features:

- Natural language querying
- Semantic retrieval
- Context-aware responses
- Enterprise document reasoning

<img width="2048" height="1625" alt="image" src="https://github.com/user-attachments/assets/b27a9a99-41c6-4c36-afdb-8bd148ce0a9e" />

---

# ⚙ Tech Stack

## Frontend

- React
- Next.js
- TypeScript
- Tailwind CSS
- D3.js

## Backend

- FastAPI
- Python

## AI & NLP

- Sentence Transformers
- Ollama
- LangChain

## Database

- ChromaDB

---

# 📂 Project Structure

```
nexusbrain-ai/

├── backend/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── metadata.json
│   ├── graph.py
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
└── README.md
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/raghav250906/nexusbrain-ai.git

cd nexusbrain-ai
```

---

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 🔄 Workflow

1. Upload enterprise PDF documents.
2. Extract text and metadata.
3. Generate semantic embeddings.
4. Store vectors in ChromaDB.
5. Extract entities.
6. Automatically construct the Knowledge Graph.
7. Query documents using AI Copilot.
8. Receive context-aware enterprise responses.

---

# 📈 Future Scope

- Multi-format document support
- Microsoft Teams integration
- SharePoint integration
- ERP/SAP integration
- Graph Neural Networks
- Role-Based Access Control
- Multi-language enterprise support
- Cloud deployment

---

# 👥 Team

**NEUROFORGE AI**

- Raghav Rana (Team Leader)
- Vaibhavi Rai
- Priyanshi Gupta
- Nitin Kumar Sharma

---

# 🏆 ET AI Hackathon 2026

Problem Statement 8

Enterprise Knowledge Intelligence Platform

---

# 📜 License

This project has been developed as part of the **ET AI Hackathon 2026**.
