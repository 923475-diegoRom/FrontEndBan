# Arquitectura del Proyecto: Banorte GenAI Copilot

Este documento explica paso a paso la arquitectura completa de la solución, abarcando desde el **Backend** (FastAPI, LLMs, RAG) hasta el **Frontend** (React, Vite).

## 1. Visión General de la Arquitectura
El proyecto es una aplicación web Full-Stack impulsada por Inteligencia Artificial diseñada para asistir en tareas bancarias e interactuar con los usuarios. Utiliza modelos de lenguaje avanzados (LLMs) para procesar solicitudes en tiempo real (streaming), buscar contexto interno en documentos institucionales mediante RAG (Retrieval-Augmented Generation) y transcribir audio.

---

## 2. El Backend (`BackendBan`)
El backend está construido con **FastAPI** (Python), diseñado para ser extremadamente rápido, asíncrono y robusto.

### 2.1. Framework y Servidor
*   **FastAPI:** El framework principal que expone los endpoints HTTP.
*   **CORS Middleware:** Configurado para permitir que la aplicación cliente en React se comunique de manera segura con los servicios backend.

### 2.2. Inteligencia Artificial y LLMs
*   **Motor de Inferencia (Groq):** Se utiliza la API de Groq para acceder al modelo `llama-3.3-70b-versatile` para las conversaciones de chat, y `whisper-large-v3` para la transcripción de audio a texto. Groq asegura respuestas de latencia ultra baja.
*   **Generación de Texto en Streaming:** A través de un modelo de *Server-Sent Events* (SSE) y generadores asíncronos en el endpoint `/api/v1/chat/stream`, el backend devuelve las respuestas token por token.

### 2.3. Base de Conocimiento (RAG)
El proyecto implementa un sistema RAG localizado en `rag.py` para dotar al LLM de contexto hiper-específico (ej. manuales de tarjetas de crédito de Banorte):
*   **Base de Datos Vectorial:** Utiliza **Qdrant Cloud** para almacenar y buscar representaciones matemáticas del texto (embeddings).
*   **Ingesta de Documentos:** El endpoint `/api/v1/documents/upload` recibe archivos PDF, extrae el texto, lo divide en fragmentos pequeños (chunks), los convierte en vectores y los guarda en Qdrant.
*   **Recuperación de Contexto:** Cuando un usuario realiza una pregunta, el sistema busca en Qdrant los fragmentos de texto más similares y los inyecta dinámicamente en el *System Prompt* del modelo LLM antes de generar la respuesta.

### 2.4. Observabilidad, Base de Datos y Logs
*   **Métricas (Prometheus):** A través del endpoint `/metrics`, el sistema expone métricas operativas (Time To First Token, latencia total, conteo de tokens generados, tasas de error).
*   **Auditoría y Logs:** Se apoya en una base de datos (SQLite Cloud) y un sistema de logging integrado para llevar un registro detallado de cada solicitud y su rendimiento (`app/database.py`, `app/logger.py`).

---

## 3. El Frontend (`FrontEndBan`)
El frontend es una *Single Page Application* (SPA) ligera, rápida y modular enfocada en la experiencia de usuario (UX).

### 3.1. Framework y Entorno
*   **React + Vite:** React provee la capa de visualización basada en estado, mientras que Vite funciona como un servidor de desarrollo y empaquetador ultrarrápido.
*   **Diseño (CSS Nativo):** Emplea hojas de estilo nativas (`App.css`, `index.css`) con variables centralizadas para establecer una paleta de colores seria, accesible y orientada a la identidad de un banco, optimizada para dispositivos móviles (Mobile-first).

### 3.2. Estructura de Componentes Modulares
La interfaz está dividida lógicamente en `src/components`:
*   **`Layout.jsx`**: Es el envoltorio principal de la interfaz, definiendo las áreas de trabajo (encabezado, cuerpo del chat, barra de estado).
*   **`Message.jsx`**: El encargado de renderizar individualmente los mensajes (tanto del usuario como del asistente). Gestiona la conversión de texto plano a formato Markdown.
*   **Componentes Específicos de IA**:
    *   **`AgentThought.jsx`**: Componente visual para mostrar estados intermedios o "razonamientos" del agente de IA al usuario.
    *   **`CitationBadge.jsx`**: Resalta en la interfaz las fuentes documentales utilizadas por el sistema RAG (ej. el nombre del PDF).
    *   **`InteractiveCard.jsx`**: Renderiza tarjetas ricas y dinámicas, como simuladores de créditos financieros (invocados a través de herramientas de agente).

---

## 4. Flujo Completo: De la Pantalla al Modelo y de Regreso

1. **Interacción del Usuario:** El usuario teclea una consulta o graba un mensaje de voz en la interfaz de React.
2. **Petición Frontend -> Backend:** Si es texto, se envía una petición `POST` a `/api/v1/chat/stream`. Si es voz, se envía a `/api/v1/audio/transcribe` para convertir a texto primero.
3. **Búsqueda Semántica (RAG):** FastAPI toma el texto, genera su embedding, consulta a Qdrant Cloud y recupera los párrafos más relevantes de los documentos almacenados.
4. **Construcción del Prompt:** El backend ensambla un mega-prompt que incluye: La instrucción base del sistema + Los párrafos de contexto (RAG) + La pregunta original del usuario.
5. **Inferencia de IA (Groq):** FastAPI hace la petición asíncrona a Groq usando `llama-3.3-70b-versatile`.
6. **Flujo Token a Token (Streaming):** Tan pronto como Groq emite el primer token, FastAPI lo reenvía a React usando *Server-Sent Events*. Las métricas de latencia se registran internamente.
7. **Renderizado Progresivo (Frontend):** React (mediante estado de aplicación) captura cada pedazo de texto entrante y actualiza progresivamente el DOM en el componente `Message.jsx`, dando la ilusión de que la IA está "escribiendo" la respuesta en vivo.
