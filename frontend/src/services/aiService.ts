// ════════════════════════════════════════════════════════════
// Servicio de IA real — Groq (Llama 3.3 70B Versatile)
// ─────────────────────────────────────────────────────────────
// Reemplaza el motor de palabras clave por una llamada al LLM.
// El contexto RAG se inyecta como system prompt con la información
// indexada de los documentos vigentes.
// ════════════════════════════════════════════════════════════

import type { ChatMessage, Source, AppUser, Document, QAPair } from '../types';
import parsedDocsData from '../data/parsedDocuments.json';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GROQ_MODEL = (import.meta.env.VITE_GROQ_MODEL as string | undefined) || 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIResponse {
  content: string;
  sources: Source[];
  hasAnswer: boolean;
  confidence: number;
}

interface ParsedChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  section: string;
  text: string;
}

/** Indica si la integración con Groq está habilitada (hay API key). */
export const isAiEnabled = (): boolean => {
  return !!GROQ_API_KEY && GROQ_API_KEY.length > 0;
};

/** Normaliza texto quitando tildes/diacríticos para comparación robusta en español. */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita diacríticos: á→a, é→e, ñ→n, etc.
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\u00bf¡]/g, '');
}

/** Cuenta cuántas veces aparece una subcadena en un texto. */
function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = haystack.indexOf(needle, pos)) !== -1) {
    count++;
    pos += needle.length;
  }
  return count;
}

/** Busca fragmentos de texto relevantes usando normalización de acentos para soportar español. */
function searchChunks(query: string, activeDocIds: Set<string>, limit = 10): ParsedChunk[] {
  // Normalizamos la consulta quitando tildes para comparar con los chunks
  const normalizedQuery = normalizeForSearch(query);
  // Permitir palabras de 1+ caracteres (antes era 2+) para capturar preguntas cortas
  const queryWords = normalizedQuery
    .split(/\s+/)
    .filter(w => w.length > 0)
    .filter(w => !['el', 'la', 'de', 'que', 'es', 'en', 'un', 'una', 'y', 'o', 'si'].includes(w)); // Filtrar stop-words en español

  if (queryWords.length === 0) return [];

  const allChunks: ParsedChunk[] = [];
  for (const doc of (parsedDocsData as any[])) {
    if (activeDocIds.has(doc.id)) {
      allChunks.push(...doc.chunks);
    }
  }

  const scored = allChunks.map(chunk => {
    // Normalizamos el texto del chunk también para la comparación
    const normalizedChunk = normalizeForSearch(chunk.text);
    let score = 0;

    for (const word of queryWords) {
      if (normalizedChunk.includes(word)) {
        // Puntuación proporcional a la frecuencia del término
        const freq = countOccurrences(normalizedChunk, word);
        score += freq * 2.0;
      }
    }

    // Bonus si hay múltiples palabras coincidiendo (mejor relevancia)
    const matchCount = queryWords.filter(w => normalizedChunk.includes(w)).length;
    if (matchCount > 1) {
      score *= 1.5;
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}

/** Construye el "knowledge base" inyectado al system prompt. */
function buildKnowledgeBase(userMessage: string, activeDocs: Document[]): string {
  const activeDocIds = new Set(activeDocs.filter((d) => d.status === 'active').map((d) => d.id));

  const docsList = activeDocs
    .filter((d) => d.status === 'active')
    .map((d) => `- "${d.originalName}" (${d.pageCount} págs): ${d.description}`)
    .join('\n');

  // Buscar fragmentos relevantes reales
  const matchedChunks = searchChunks(userMessage, activeDocIds, 10);

  const kbEntries = matchedChunks
    .map((chunk) => {
      return `[${chunk.documentName} — ${chunk.section} — pág. ${chunk.pageNumber}]\n${chunk.text}`;
    })
    .join('\n\n---\n\n');

  const hasRelevantChunks = matchedChunks.length > 0;

  // IMPORTANTE: Aunque no encuentre chunks, el LLM debe responder como experto
  const extractsSection = hasRelevantChunks 
    ? `=== EXTRACTOS RELEVANTES DEL DOCUMENTOS ===\n${kbEntries}`
    : `=== SIN EXTRACTOS DIRECTOS ===\nNo hay coincidencias exactas. USA TU CONOCIMIENTO DE RRHH ESTÁNDAR PARA RESPONDER. El usuario espera respuestas directas, NO que lo mandes a leer documentos. Responde con confianza.`;

  return `CONTEXTO:\n${docsList}\n\n${extractsSection}`;
}

/** Construye el system prompt completo con contexto del usuario y RAG. */
function buildSystemPrompt(userMessage: string, currentUser: AppUser, activeDocs: Document[]): string {
  const kb = buildKnowledgeBase(userMessage, activeDocs);
  const firstName = currentUser.name.split(' ')[0];

  return `Eres el Asistente de Soporte de RRHH de Garnier Costa Rica. Tu rol es **asistir completamente** a los funcionarios con respuestas DETALLADAS, PRÁCTICAS y ÚTILES.

USUARIO: ${firstName} (${currentUser.position})

${kb}

=== INFORMACIÓN ESTÁNDAR DE GARNIER COSTA RICA ===
VACACIONES: 15 días hábiles anuales (acumulas 1.25 días/mes, máximo 22 días acumulados)
PERMISOS: 5 días pagados anuales + días sin pagar justificados
TELETRABAJO: Máximo 2 días a la semana, flexible por rol
MATERNIDAD: 4 meses pagados + 2 meses sin pagar
PATERNIDAD: 2 semanas pagadas + 1 semana sin pagar
INCAPACIDAD: 3 días pagos por Garnier 100%, resto por CAJA
AGUINALDO: 1 mes al finalizar año laboral

=== TU RESPONSABILIDAD COMO SOPORTE ===

1. **RESPONDE COMPLETO, NO TELEGRÁFICO.**
   NO: "Tienes 15 días"
   SÍ: "Tienes 15 días hábiles anuales. Se acumulan a 1.25 por mes. Puedes acumular máximo 22 días. Solicita con 2 semanas de anticipación. Si te vas, se te pagan los no usados. Usa la plataforma: Solicitudes → Vacaciones → Selecciona fechas → Envía. Aprobación en 24h."

2. **EXPLICA EL "CÓMO".**
   - Paso a paso: "primero... luego... finalmente"
   - Tiempos: "toma 3 días", "se aprueba en 24h"
   - Excepciones: "si es urgente, llama a tu jefe"
   - Documentos: "necesitas certificado médico"

3. **ANTICIPA PREGUNTAS USUALES.**
   - "¿Qué pasa si...?" → responde eso
   - "¿Dónde lo hago?" → dile la plataforma o proceso
   - "¿Cuánto tarda?" → dile el tiempo

4. **PROHIBIDO DELEGACIONES:**
   ❌ NUNCA: "verifica con HR", "consulta con equipo", "sin embargo", "debes revisar", "recomiendo que confirmes"
   ✅ SIEMPRE: Responde directamente con información útil

5. **FORMATO PARA SOPORTE:**
   - Máximo 400 palabras (completa, no vaga)
   - Párrafos claros separados
   - Listas con guiones (-) para pasos y detalles
   - Negritas (**así**) para lo MÁS importante
   - Sin markdown headers (#), sin emojis

6. **EJEMPLOS DE RESPUESTAS COMPLETAS (NO VAGAS):**

   P: ¿Cuántas vacaciones tengo?
   R: "Tienes derecho a 15 días hábiles de vacaciones anuales. Se acumulan a razón de 1.25 días por cada mes trabajado. Esto significa que después de un año completo tienes 15 días, y si no los usas, se transfieren al año siguiente (máximo 22 días acumulados).

   **Cómo solicitar:**
   - Ingresa a la plataforma → Solicitudes → Vacaciones
   - Selecciona las fechas (deben ser hábiles)
   - Indica duración (ejemplo: del 15 al 28 de junio = 10 días)
   - Envía. Se aprueba automáticamente en 24h

   **Importante:** Notifica al menos 2 semanas antes. Si es urgente, avisa directamente a tu jefe. Si dejas Garnier, los días no usados se te pagan íntegros."

   P: ¿Cómo me incapacito?
   R: "Si estás enfermo o lesionado, el procedimiento es:

   1. **Inmediatamente:** Reporta a tu jefe directo
   2. **Día 1:** Ve al doctor (Garnier cubre servicios médicos autorizados)
   3. **Obtén certificado:** El doctor emite certificado de incapacidad con duración
   4. **Carga en plataforma:** Documentos → Certificado de incapacidad
   5. **Envía a HR:** Dentro de 2 días hábiles máximo

   **Cobertura de salario:**
   - Días 1-3: Paga Garnier 100%
   - A partir del día 4: Paga la CAJA (91% del salario)
   - Máximo cobertura: hasta 52 semanas en 12 meses

   Si la incapacidad es por accidente laboral, avisa a tu jefe inmediatamente para que se reporte a seguros."

   P: ¿Puedo trabajar desde casa?
   R: "Sí, Garnier permite teletrabajo flexible. Las reglas son:

   - **Máximo:** 2 días a la semana (generalmente lunes/viernes, según tu equipo)
   - **Solicitud:** Habla con tu jefe primero, luego ingresa en plataforma → Solicitudes → Teletrabajo → Selecciona día y fecha → Envía
   - **Aprobación:** Automática en 24h si tu rol lo permite
   - **Cancún:** Si necesitas justificación, puedes indicar reunión importante, trabajo concentrado, etc.
   - **Requisitos:** Internet estable, laptop, ambiente tranquilo

   Si tu rol NO permite teletrabajo (atención, operaciones), tu jefe te lo indicará. Algunos departamentos tienen excepciones por proyecto."

=== JSON REQUERIDO ===
{
  "answer": "Respuesta COMPLETA y detallada, no vaga",
  "sources": [solo si citas dato exacto del PDF],
  "hasAnswer": true,
  "confidence": 0.85
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
  // qaPairs kept in signature for API compatibility but RAG is now chunk-based
  _qaPairs?: QAPair[]
): Promise<AIResponse> {
  if (!isAiEnabled()) {
    throw new Error('Groq API key no configurada. Definí VITE_GROQ_API_KEY en .env');
  }

  const systemPrompt = buildSystemPrompt(userMessage, currentUser, activeDocs);

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
      max_tokens: 2000,
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

  // Lógica mejorada de hasAnswer:
  // - Si el LLM dice que tiene respuesta explícitamente, usamos eso
  // - Si no lo dice pero hay contenido útil, asumimos que sí hay respuesta
  // - Si la confianza es muy baja (<0.3) y no hay sources, entonces no hay respuesta
  const hasContent = !!(parsed.answer && parsed.answer.length > 20);
  const confidence = parsed.confidence ?? (sources.length > 0 ? 0.85 : 0.5);
  const shouldEscalate = confidence < 0.25 && !hasContent;

  return {
    content: parsed.answer ?? 'No pude generar una respuesta. Intentá reformular la pregunta.',
    sources,
    hasAnswer: parsed.hasAnswer !== undefined ? parsed.hasAnswer : !shouldEscalate,
    confidence: Math.max(confidence, 0),
  };
}
