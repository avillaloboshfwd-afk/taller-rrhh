// ════════════════════════════════════════════════════════════
// Servicio de IA real — Groq (Llama 3.3 70B Versatile)
// ─────────────────────────────────────────────────────────────
// Reemplaza el motor de palabras clave por una llamada al LLM.
// El contexto RAG se inyecta como system prompt con la información
// indexada de los documentos vigentes.
// ════════════════════════════════════════════════════════════

import type { ChatMessage, Source, AppUser, Document, QAPair } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL = (import.meta.env.VITE_GROQ_MODEL as string | undefined) || 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIResponse {
  content: string;
  sources: Source[];
  hasAnswer: boolean;
  confidence: number;
}

/** Indica si la integración con Groq está habilitada (hay API key). */
export const isAiEnabled = (): boolean => {
  return !!GROQ_API_KEY && GROQ_API_KEY.length > 0;
};

/** Construye el "knowledge base" inyectado al system prompt. */
function buildKnowledgeBase(activeDocs: Document[], qaPairs: QAPair[]): string {
  const activeNames = new Set(activeDocs.filter((d) => d.status === 'active').map((d) => d.originalName));

  const docsList = activeDocs
    .filter((d) => d.status === 'active')
    .map((d) => `- "${d.originalName}" (${d.pageCount} págs): ${d.description}`)
    .join('\n');

  // Sólo incluimos QA pairs cuyos sources pertenezcan a documentos activos
  const kbEntries = qaPairs
    .filter((qa) => qa.hasAnswer && qa.sources.some((s) => activeNames.has(s.documentName)))
    .map((qa) => {
      const src = qa.sources[0];
      const ref = src ? `[${src.documentName} — ${src.section} — pág. ${src.pageNumber}]` : '';
      return `${ref}\nPregunta tipo: ${qa.question}\nContenido oficial: ${qa.answer.replace(/\*\*/g, '')}`;
    })
    .join('\n\n---\n\n');

  return `DOCUMENTOS VIGENTES (base vectorial RAG):\n${docsList}\n\n=== EXTRACTOS INDEXADOS ===\n${kbEntries}`;
}

/** Construye el system prompt completo con contexto del usuario y RAG. */
function buildSystemPrompt(currentUser: AppUser, activeDocs: Document[], qaPairs: QAPair[]): string {
  const kb = buildKnowledgeBase(activeDocs, qaPairs);
  const firstName = currentUser.name.split(' ')[0];

  return `Eres el Asistente Inteligente de Recursos Humanos de Garnier, una empresa costarricense. Tu trabajo es responder consultas de colaboradores sobre políticas internas, beneficios, vacaciones, teletrabajo, inducción e incidentes — basándote ÚNICAMENTE en los reglamentos vigentes que se listan abajo.

USUARIO ACTUAL:
- Nombre: ${currentUser.name} (puedes llamarle ${firstName})
- Cargo: ${currentUser.position}
- Rol: ${currentUser.role === 'admin' ? 'Administrador de RRHH' : 'Colaborador'}

${kb}

REGLAS ESTRICTAS:
1. Responde SIEMPRE en español, tono profesional pero cálido y cercano. Tutea al usuario.
2. NO inventes información, montos, plazos, ni políticas que no estén en los documentos arriba.
3. Cuando uses datos de los documentos, CITA siempre el documento, sección y página en el campo "sources".
4. Si la pregunta no se puede contestar con los documentos vigentes, devuelve hasAnswer:false, sources:[] y sugiere amablemente escalar la consulta a RRHH.
5. Formato del campo "answer": markdown — usa **negritas** para términos clave, listas con "•" (bullet) o numeradas, párrafos cortos. NO uses encabezados markdown (# ##).
6. Si el usuario hizo un check-in emocional al inicio del chat, mantén ese contexto y sé empático.
7. Sé conciso: máximo ~250 palabras por respuesta a menos que la pregunta exija detalle.

FORMATO DE RESPUESTA (DEBE ser JSON válido, sin texto fuera del objeto):
{
  "answer": "texto markdown de la respuesta",
  "sources": [
    { "documentName": "nombre EXACTO del documento", "section": "ej: Artículo 12 — Vacaciones", "pageNumber": 4 }
  ],
  "hasAnswer": true,
  "confidence": 0.92
}

Si NO encuentras información en los documentos:
{
  "answer": "Lo siento ${firstName}, no encontré información sobre eso en los reglamentos vigentes. ¿Deseas escalar la consulta al equipo de RRHH?",
  "sources": [],
  "hasAnswer": false,
  "confidence": 0.1
}`;
}

/**
 * Genera la respuesta del asistente llamando a la API de Groq.
 * Pasa el historial reciente de la conversación para mantener contexto.
 */
export async function generateChatResponse(
  userMessage: string,
  history: ChatMessage[],
  currentUser: AppUser,
  activeDocs: Document[],
  qaPairs: QAPair[]
): Promise<AIResponse> {
  if (!isAiEnabled()) {
    throw new Error('Groq API key no configurada. Definí VITE_GROQ_API_KEY en .env');
  }

  const systemPrompt = buildSystemPrompt(currentUser, activeDocs, qaPairs);

  // Limitar el historial a los últimos 12 mensajes para no inflar tokens.
  const trimmedHistory = history.slice(-12).map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }));

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...trimmedHistory,
    { role: 'user' as const, content: userMessage },
  ];

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawContent: string = data?.choices?.[0]?.message?.content ?? '{}';

  let parsed: {
    answer?: string;
    sources?: { documentName?: string; section?: string; pageNumber?: number | string }[];
    hasAnswer?: boolean;
    confidence?: number;
  };

  try {
    parsed = JSON.parse(rawContent);
  } catch {
    // El modelo no devolvió JSON válido — usamos el texto como respuesta plana.
    parsed = { answer: rawContent, sources: [], hasAnswer: true, confidence: 0.6 };
  }

  // Mapear sources del LLM a nuestro tipo Source con documentId real.
  const sources: Source[] = (parsed.sources ?? [])
    .map((s) => {
      const doc = activeDocs.find(
        (d) => d.originalName.toLowerCase() === (s.documentName ?? '').toLowerCase()
      );
      if (!doc) return null;
      return {
        documentId: doc.id,
        documentName: doc.originalName,
        section: s.section || 'Sección referenciada',
        pageNumber: typeof s.pageNumber === 'number' ? s.pageNumber : parseInt(String(s.pageNumber)) || 1,
        similarity: parsed.confidence ?? 0.85,
      } satisfies Source;
    })
    .filter((s): s is Source => s !== null);

  return {
    content: parsed.answer ?? 'No pude generar una respuesta. Intentá reformular la pregunta.',
    sources,
    hasAnswer: parsed.hasAnswer ?? sources.length > 0,
    confidence: parsed.confidence ?? 0.75,
  };
}
