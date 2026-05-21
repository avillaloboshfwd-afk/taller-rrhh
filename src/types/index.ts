// ════════════════════════════════════════════════════════════
// Tipos globales de la aplicación
// ════════════════════════════════════════════════════════════

/** Documento de política/reglamento cargado */
export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  description: string;
  status: 'active' | 'inactive';
  pageCount: number;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string;
}

/** Sesión de conversación */
export interface ChatSession {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'escalated';
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  preview: string;
}

/** Mensaje individual en una sesión de chat */
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  confidence?: number;
  hasAnswer?: boolean;
  createdAt: string;
}

/** Fuente citada en una respuesta del agente */
export interface Source {
  documentId: string;
  documentName: string;
  section: string;
  pageNumber: number;
  similarity: number;
}

/** Par pregunta → respuesta predefinido para el motor mock */
export interface QAPair {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  sources: Source[];
  confidence: number;
  hasAnswer: boolean;
  category: QueryCategory;
}

/** Consulta sin respuesta registrada */
export interface UnansweredQuery {
  id: string;
  queryText: string;
  userName: string;
  maxSimilarity: number;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

/** Categoría de consulta para estadísticas */
export type QueryCategory =
  | 'vacaciones'
  | 'permisos'
  | 'teletrabajo'
  | 'induccion'
  | 'beneficios'
  | 'incidentes'
  | 'otro';

/** Datos de analítica para el dashboard */
export interface AnalyticsData {
  totalQueries: number;
  answeredQueries: number;
  unansweredQueries: number;
  activeDocuments: number;
  avgConfidence: number;
  avgResponseTime: number;
  uniqueUsers: number;
  categoryCounts: { category: string; count: number; label: string }[];
  recentUnanswered: UnansweredQuery[];
  weeklyTrend: { day: string; queries: number; answered: number }[];
}

/** Notificación toast */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/** Usuario que inicia sesión en la demo */
export interface AppUser {
  id: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  position: string;
  initials: string;
  accentColor: string;
  /** Equipo al que pertenece el funcionario o que lidera la jefatura */
  teamId?: string;
}

/** Identificador de emoción del check-in */
export type EmotionId =
  | 'estres'
  | 'ansiedad'
  | 'cansancio'
  | 'motivacion'
  | 'tristeza'
  | 'felicidad';

/** Opción de emoción mostrada en el check-in */
export interface EmotionOption {
  id: EmotionId;
  label: string;
  description: string;
  /** Token Tailwind del fondo pálido cuando la opción está seleccionada (ej: bg-rose-50). */
  bg: string;
  /** Token Tailwind del anillo cuando la opción está seleccionada (ej: ring-rose-400). */
  ring: string;
  /** Token Tailwind del color de texto principal (ej: text-rose-700). */
  text: string;
  /** Token Tailwind del color sólido del indicador cromático (ej: bg-rose-500). */
  dot: string;
}

/** Datos capturados durante el check-in emocional */
export interface CheckInData {
  emotion: EmotionId;
  emotionLabel: string;
  context: string;
}

// ════════════════════════════════════════════════════════════
// Pulso Garnier — entidades del backend (json-server)
// ════════════════════════════════════════════════════════════

/** Emoción del catálogo del micro-pulso */
export interface PulseEmotion {
  id: string;
  label: string;
  score: 1 | 2 | 3 | 4 | 5;
  category: 'positiva' | 'neutral' | 'negativa';
  /** Color hex semántico que representa el estado de ánimo. */
  color: string;
  description: string;
}

/** Factor que influye en el estado emocional */
export interface PulseFactor {
  id: string;
  label: string;
  icon: string;
}

/** Estado de bienestar de un equipo */
export type TeamStatus = 'saludable' | 'observacion' | 'alerta';

/** Equipo / área organizacional */
export interface Team {
  id: string;
  name: string;
  memberCount: number;
  status: TeamStatus;
  managerUserId: string;
  description: string;
}

/** Registro diario del micro-pulso de un funcionario */
export interface DailyEntry {
  id: string;
  userId: string;
  teamId: string;
  emotionId: string;
  factors: string[];
  comment: string;
  createdAt: string;
}

/** Datos para POST /entries (sin id) */
export type DailyEntryInput = Omit<DailyEntry, 'id'>;

/** Tendencia (up | down | stable) */
export type Trend = 'up' | 'down' | 'stable';

/** Factor más frecuente en un reporte */
export interface ReportFactor {
  factorId: string;
  label: string;
  count: number;
  trend: Trend;
}

/** Palabra clave detectada en comentarios abiertos */
export interface ReportKeyword {
  word: string;
  count: number;
}

/** Punto semanal de tendencia del clima */
export interface WeeklyTrendPoint {
  week: string;
  index: number;
  responses: number;
}

/** Reporte de clima de un equipo */
export interface ClimateReport {
  id: string;
  teamId: string;
  teamName: string;
  period: string;
  periodLabel: string;
  wellbeingIndex: number;
  previousIndex: number;
  participation: number;
  trend: Trend;
  trendDelta: number;
  responsesCount: number;
  status: TeamStatus;
  distribution: Record<string, number>;
  weeklyTrend: WeeklyTrendPoint[];
  topFactors: ReportFactor[];
  keywords: ReportKeyword[];
  narrative: string;
}

/** Alerta de patrones negativos sostenidos */
export interface ClimateAlert {
  id: string;
  teamId: string;
  teamName: string;
  severity: 'low' | 'medium' | 'high';
  type: 'factor-aumento' | 'indice-bajo' | 'patron-ciclico';
  title: string;
  message: string;
  recommendation: string;
  createdAt: string;
  acknowledged: boolean;
}

/** Tip de bienestar mostrado al funcionario */
export interface WellbeingTip {
  id: string;
  category: 'estres' | 'cansancio' | 'motivacion' | 'general';
  title: string;
  body: string;
}
