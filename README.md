# Garnier RH — Asistente Inteligente (Demo Frontend)

Demo visual de un agente conversacional de Recursos Humanos para **Garnier**, construido con un stack moderno de React + Vite + TypeScript + Tailwind. Todo el backend se simula con datos mock — no hay servidor real ni motor LLM real.

---

## Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Tailwind CSS 3** con paleta corporativa verde (`brand`) y tonos slate extendidos
- **Recharts** para los gráficos de la vista de analítica
- **Lucide React** para los iconos
- Estado en memoria con `useState` / `useMemo` — sin `localStorage`, sin Redux

---

## Instalación y arranque

Requisitos: **Node.js 18+** y **npm**.

```bash
npm install
npm run dev
```

El servidor de desarrollo abrirá automáticamente <http://localhost:5173/>.

Para construir la versión de producción:

```bash
npm run build
npm run preview
```

### Conectar la IA real (Groq) — opcional pero recomendado para demo

El chat usa **Llama 3.3 70B** vía Groq (gratis, súper rápido). Si no configurás API key, cae automáticamente al motor local de palabras clave.

1. Crea una cuenta gratuita en <https://console.groq.com> (no pide tarjeta).
2. En la sección **API Keys**, generá una key nueva.
3. Copiá [.env.example](.env.example) a `.env` y pegá la key:

```dotenv
VITE_GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXX
```

4. Reiniciá el dev server (`npm run dev`). Listo — el chat ahora consulta al LLM real.

El system prompt en [src/services/aiService.ts](src/services/aiService.ts) inyecta el contenido de los reglamentos activos como "base vectorial" para que el modelo responda **basándose** en ellos y cite secciones reales.

> ⚠️ **Aviso de seguridad**: la API key queda expuesta en el bundle del frontend (variables `VITE_*` se compilan al cliente). Para producción, mover la llamada a un backend proxy. Para demos en local está bien.

---

## Vistas incluidas

La navegación se hace desde el sidebar lateral persistente:

| Vista                  | Descripción                                                                                                         |
|------------------------|---------------------------------------------------------------------------------------------------------------------|
| **Asistente Chat**     | Chat principal con burbujas, preguntas sugeridas, indicador de "escribiendo…", citas de fuente y escalación a RRHH. |
| **Dashboard**          | KPIs, gráfico de tendencia semanal (Area) y distribución por categorías (Bar) con Recharts.                         |
| **Documentos**         | Tabla de políticas indexadas, drag-and-drop simulando ingesta RAG (chunking → embeddings → indexación).            |
| **Panel HR**           | Lista de consultas sin respuesta + formulario para incorporar la respuesta a la base mock (la próxima vez la responde el chat). |

---

## Cómo funciona el "motor" del chat

El archivo [src/App.tsx](src/App.tsx) contiene un buscador simple de palabras clave que recorre el array `qaPairs` de [src/data/mockData.ts](src/data/mockData.ts):

- Normaliza el texto del usuario (minúsculas, sin acentos).
- Asigna puntaje por cada keyword que coincide.
- Si el mejor puntaje cae por debajo del umbral, devuelve la respuesta "no encontré información" y registra la consulta automáticamente en el panel de **Consultas sin Respuesta**.
- Si encuentra match, devuelve la respuesta + las fuentes citadas (documento, sección, página, similitud vectorial).

Cada respuesta simula latencia con `setTimeout` (1.2 – 2.2 s) para que se vea el indicador de typing.

> En producción esto sería una llamada a `POST /api/chat/sessions/:id/messages` contra un backend RAG real (vector store + LLM).

---

## Datos mock

Todos los datos viven en [src/data/mockData.ts](src/data/mockData.ts):

- **`mockDocuments`** — 6 políticas (Reglamento Interno, Teletrabajo, Inducción, Beneficios, Incidentes, Vacaciones).
- **`mockQAPairs`** — 8 pares pregunta→respuesta con fuentes citadas (incluye uno marcado como `hasAnswer: false`).
- **`mockChatSessions`** + **`mockSessionMessages`** — 4 conversaciones históricas con sus mensajes.
- **`mockUnansweredQueries`** — 5 consultas pendientes para el panel admin.
- **`mockAnalyticsData`** — KPIs, tendencia semanal y conteos por categoría.
- **`suggestedQuestions`** — los chips clicables del estado vacío del chat.

---

## Estructura del proyecto

```
src/
├── App.tsx                       # Estado global y enrutamiento por tab
├── main.tsx                      # Entry point de React
├── index.css                     # Tailwind base + animaciones (typing, shimmer, etc.)
├── components/
│   ├── layout/Sidebar.tsx
│   ├── chat/
│   │   ├── ChatContainer.tsx     # Vista de chat + lista de sesiones
│   │   ├── MessageBubble.tsx     # Burbuja con confianza, fuentes y escalación
│   │   └── DocumentViewerModal.tsx
│   ├── documents/DocumentManager.tsx
│   ├── analytics/DashboardView.tsx
│   ├── admin/UnansweredQueriesView.tsx
│   └── common/Toast.tsx
├── data/mockData.ts              # Toda la data simulada
├── services/chatService.ts       # Versión async del motor (no usado, App.tsx tiene su propia copia)
└── types/index.ts                # Tipos compartidos (Document, ChatMessage, Source, etc.)
```

---

## Cosas para probar en la demo

1. Abrir **Asistente Chat** → clic en cualquier chip sugerido → ver respuesta con badge de confianza + tarjetas de fuente.
2. Hacer clic en una tarjeta de fuente → se abre el **DocumentViewerModal** con la página citada resaltada.
3. Escribir algo fuera de tema (ej. *"¿puedo traer mi mascota?"*) → respuesta "no encontré información" + botón **Escalar a RRHH** + la consulta aparece en el badge del Panel HR.
4. En **Documentos** → arrastrar cualquier archivo al drop-zone → ver la animación de chunking/embeddings → el doc aparece en la tabla.
5. Toggle del estado de un documento (activo/inactivo) y eliminación con confirmación.
6. En **Dashboard** → ver KPIs reactivos, gráficos Recharts y la sección "Consultas Recientes sin Respuesta" → clic en *Resolver* salta al Panel HR.
7. En **Panel HR** → escoger una consulta pendiente, escribir la respuesta + keywords + citar documento → **Incorporar a RAG y Resolver** → la próxima vez que se pregunte eso en el chat, ya responde.

---

## Dónde se conectaría un backend real

- [src/App.tsx](src/App.tsx) — `handleSendMessage` haría `POST /api/chat/sessions/:id/messages`.
- [src/App.tsx](src/App.tsx) — `handleUploadDocument` haría `POST /api/documents` con `multipart/form-data` y dispararía la pipeline RAG real.
- [src/App.tsx](src/App.tsx) — `handleToggleDocumentStatus` / `handleDeleteDocument` → `PATCH` / `DELETE /api/documents/:id`.
- `computedAnalytics` se reemplazaría por `GET /api/analytics`.
