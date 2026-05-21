// ════════════════════════════════════════════════════════════
// Datos mock realistas — Garnier RH
// Simula toda la data que en producción vendría del backend.
// ════════════════════════════════════════════════════════════

import type {
  Document,
  ChatSession,
  ChatMessage,
  QAPair,
  AnalyticsData,
  UnansweredQuery,
  AppUser,
  EmotionId,
  EmotionOption,
  Source,
} from '../types';

// ─── DOCUMENTOS ───────────────────────────────────────────

export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    fileName: 'reglamento_interno_trabajo.pdf',
    originalName: 'Reglamento Interno de Trabajo',
    description: 'Reglamento que rige las relaciones laborales, horarios, obligaciones y derechos de los funcionarios de Garnier.',
    status: 'active',
    pageCount: 45,
    fileSize: '2.3 MB',
    uploadedAt: '2025-11-15T10:30:00',
    uploadedBy: 'María Fernández',
  },
  {
    id: 'doc-002',
    fileName: 'politica_teletrabajo.pdf',
    originalName: 'Política de Teletrabajo',
    description: 'Lineamientos para la modalidad de trabajo remoto, requisitos, equipamiento y obligaciones.',
    status: 'active',
    pageCount: 12,
    fileSize: '890 KB',
    uploadedAt: '2025-12-03T14:15:00',
    uploadedBy: 'María Fernández',
  },
  {
    id: 'doc-003',
    fileName: 'manual_induccion.pdf',
    originalName: 'Manual de Inducción',
    description: 'Guía completa para nuevos funcionarios: historia de la empresa, cultura, procesos y contactos clave.',
    status: 'active',
    pageCount: 28,
    fileSize: '4.1 MB',
    uploadedAt: '2025-10-20T09:00:00',
    uploadedBy: 'Carlos Ramírez',
  },
  {
    id: 'doc-004',
    fileName: 'politica_beneficios.pdf',
    originalName: 'Política de Beneficios',
    description: 'Detalle de los beneficios que ofrece Garnier a sus funcionarios: seguros, bonificaciones, convenios y más.',
    status: 'active',
    pageCount: 18,
    fileSize: '1.2 MB',
    uploadedAt: '2026-01-10T11:45:00',
    uploadedBy: 'María Fernández',
  },
  {
    id: 'doc-005',
    fileName: 'protocolo_reporte_incidentes.pdf',
    originalName: 'Protocolo de Reporte de Incidentes',
    description: 'Procedimiento para reportar incidentes laborales, de seguridad o de acoso en el lugar de trabajo.',
    status: 'active',
    pageCount: 8,
    fileSize: '540 KB',
    uploadedAt: '2026-02-28T16:20:00',
    uploadedBy: 'Ana Sofía López',
  },
  {
    id: 'doc-006',
    fileName: 'politica_vacaciones.pdf',
    originalName: 'Política de Vacaciones y Permisos',
    description: 'Normativa vigente sobre el otorgamiento de vacaciones, permisos con y sin goce de salario.',
    status: 'inactive',
    pageCount: 15,
    fileSize: '720 KB',
    uploadedAt: '2025-08-05T08:30:00',
    uploadedBy: 'Carlos Ramírez',
  },
];

// ─── PARES PREGUNTA-RESPUESTA ─────────────────────────────

export const mockQAPairs: QAPair[] = [
  {
    id: 'qa-001',
    keywords: ['vacaciones', 'días', 'descanso', 'feriado', 'asueto', 'cuántos días', 'derecho'],
    question: '¿Cuántos días de vacaciones me corresponden?',
    answer:
      'Según la **Política de Vacaciones y Permisos** de Garnier, todo funcionario con al menos un año de antigüedad tiene derecho a **15 días hábiles de vacaciones** al año.\n\nSi tiene más de 5 años de antigüedad, se agregan **2 días adicionales por cada año adicional**, hasta un máximo de 25 días hábiles.\n\nPara solicitarlas, debe completar el formulario de solicitud de vacaciones en el portal interno con al menos **15 días de anticipación** y contar con la aprobación de su jefatura directa.',
    sources: [
      {
        documentId: 'doc-006',
        documentName: 'Política de Vacaciones y Permisos',
        section: 'Artículo 12 — Derecho a vacaciones',
        pageNumber: 4,
        similarity: 0.94,
      },
      {
        documentId: 'doc-001',
        documentName: 'Reglamento Interno de Trabajo',
        section: 'Capítulo VI — Vacaciones',
        pageNumber: 22,
        similarity: 0.87,
      },
    ],
    confidence: 0.94,
    hasAnswer: true,
    category: 'vacaciones',
  },
  {
    id: 'qa-002',
    keywords: ['permiso', 'solicitar', 'ausencia', 'faltar', 'día libre', 'personal', 'licencia'],
    question: '¿Cómo solicito un permiso?',
    answer:
      'Para solicitar un **permiso con goce de salario**, debe seguir estos pasos:\n\n1. Ingrese al portal de Recursos Humanos.\n2. Seleccione "Solicitud de Permisos" en el menú principal.\n3. Complete el formulario indicando el **tipo de permiso**, la **fecha** y la **justificación**.\n4. Adjunte la documentación de respaldo si aplica (certificado médico, constancia, etc.).\n5. Envíe la solicitud a su jefatura directa para aprobación.\n\nLos permisos con goce de salario incluyen: enfermedad (hasta 3 días con certificado), matrimonio (5 días), nacimiento de hijo (3 días) y fallecimiento de familiar directo (3 días).\n\nPara **permisos sin goce de salario**, el proceso es similar pero requiere aprobación adicional de la Dirección de RRHH.',
    sources: [
      {
        documentId: 'doc-001',
        documentName: 'Reglamento Interno de Trabajo',
        section: 'Artículo 24 — Permisos y licencias',
        pageNumber: 12,
        similarity: 0.92,
      },
    ],
    confidence: 0.92,
    hasAnswer: true,
    category: 'permisos',
  },
  {
    id: 'qa-003',
    keywords: ['teletrabajo', 'remoto', 'casa', 'trabajo remoto', 'home office', 'virtual'],
    question: '¿Cuál es la política de teletrabajo?',
    answer:
      'La **Política de Teletrabajo** de Garnier establece lo siguiente:\n\n• **Elegibilidad:** Funcionarios con al menos 6 meses de antigüedad cuyas funciones sean compatibles con el trabajo remoto.\n• **Modalidad:** Hasta **3 días por semana** de teletrabajo, coordinados con la jefatura.\n• **Equipamiento:** La empresa proporciona laptop y subsidio mensual de ₡25,000 para internet y electricidad.\n• **Horario:** Se debe mantener el horario laboral establecido (8:00 a.m. - 5:00 p.m.) y estar disponible por los canales corporativos.\n• **Seguridad:** Es obligatorio usar la VPN corporativa y cumplir con la política de seguridad de la información.\n\nPara solicitar la modalidad, complete el formulario de teletrabajo y envíelo a RRHH con aprobación de su jefatura.',
    sources: [
      {
        documentId: 'doc-002',
        documentName: 'Política de Teletrabajo',
        section: 'Sección 3 — Modalidades y requisitos',
        pageNumber: 5,
        similarity: 0.96,
      },
    ],
    confidence: 0.96,
    hasAnswer: true,
    category: 'teletrabajo',
  },
  {
    id: 'qa-004',
    keywords: ['inducción', 'nuevo', 'ingreso', 'incorporación', 'primer día', 'onboarding'],
    question: '¿Cómo es el proceso de inducción?',
    answer:
      'El **proceso de inducción** para nuevos funcionarios en Garnier tiene una duración de **2 semanas** y consta de las siguientes etapas:\n\n**Semana 1 — Inducción General:**\n• Bienvenida y tour por las instalaciones\n• Presentación de la historia, misión y valores de Garnier\n• Entrega de credencial, equipo y accesos\n• Capacitación en herramientas internas (correo, portal, sistema de gestión)\n• Sesión sobre políticas de seguridad y salud ocupacional\n\n**Semana 2 — Inducción al puesto:**\n• Presentación con el equipo de trabajo\n• Capacitación específica del puesto con su jefatura\n• Asignación de un "buddy" o mentor durante los primeros 3 meses\n• Revisión de objetivos y expectativas del período de prueba\n\nSu contacto para cualquier duda durante la inducción es el Departamento de Recursos Humanos al ext. 2200.',
    sources: [
      {
        documentId: 'doc-003',
        documentName: 'Manual de Inducción',
        section: 'Capítulo 2 — Programa de inducción',
        pageNumber: 8,
        similarity: 0.93,
      },
    ],
    confidence: 0.93,
    hasAnswer: true,
    category: 'induccion',
  },
  {
    id: 'qa-005',
    keywords: ['beneficios', 'seguro', 'bono', 'convenio', 'descuento', 'gimnasio', 'salud'],
    question: '¿Qué beneficios tengo como funcionario?',
    answer:
      'Garnier ofrece un **paquete integral de beneficios** para sus funcionarios:\n\n**Salud y bienestar:**\n• Seguro médico privado (cobertura del 80% para el funcionario y 60% para dependientes)\n• Seguro de vida por 24 veces el salario mensual\n• Subsidio para gimnasio o actividades deportivas (₡20,000/mes)\n• Programa de asistencia al empleado (apoyo psicológico, legal y financiero)\n\n**Económicos:**\n• Bono de desempeño anual (hasta 1.5 salarios según evaluación)\n• Aguinaldo completo en diciembre\n• Asociación solidarista con aporte patronal del 5.33%\n\n**Desarrollo:**\n• Subsidio del 70% para estudios universitarios y posgrado\n• Acceso a plataforma de e-learning\n• Días libres para exámenes universitarios (hasta 6 al año)\n\n**Convenios:**\n• Descuentos en comercios afiliados, instituciones financieras y servicios de salud',
    sources: [
      {
        documentId: 'doc-004',
        documentName: 'Política de Beneficios',
        section: 'Sección 5 — Catálogo de beneficios',
        pageNumber: 7,
        similarity: 0.95,
      },
    ],
    confidence: 0.95,
    hasAnswer: true,
    category: 'beneficios',
  },
  {
    id: 'qa-006',
    keywords: ['incidente', 'reportar', 'accidente', 'denuncia', 'acoso', 'seguridad', 'emergencia'],
    question: '¿Cómo reporto un incidente?',
    answer:
      'Para reportar un incidente laboral, de seguridad o de conducta, siga el **Protocolo de Reporte de Incidentes**:\n\n**Paso 1 — Acción inmediata:**\nSi hay riesgo para la salud o seguridad, llame al ext. 9999 (Emergencias) o al 911.\n\n**Paso 2 — Registro del incidente:**\n• Ingrese al portal de RRHH → "Reporte de Incidentes"\n• Complete el formulario con: fecha, hora, ubicación, descripción detallada y testigos\n• Adjunte evidencia fotográfica si es posible\n\n**Paso 3 — Seguimiento:**\n• Recibirá un número de caso y confirmación por correo en un plazo máximo de 24 horas\n• El Comité de Seguridad o la Oficina de Ética investigará según la naturaleza del caso\n• Se garantiza **confidencialidad** y protección contra represalias\n\n**Canales de denuncia confidencial:**\n• Línea ética: 800-GARNIER (800-427-6437)\n• Correo: etica@garnier.com\n• Buzón físico en recepción de cada sede',
    sources: [
      {
        documentId: 'doc-005',
        documentName: 'Protocolo de Reporte de Incidentes',
        section: 'Sección 4 — Procedimiento de reporte',
        pageNumber: 3,
        similarity: 0.91,
      },
    ],
    confidence: 0.91,
    hasAnswer: true,
    category: 'incidentes',
  },
  {
    id: 'qa-007',
    keywords: ['mascota', 'perro', 'gato', 'animal', 'traer mascota', 'pet friendly'],
    question: '¿Puedo traer mi mascota a la oficina?',
    answer:
      'Lo siento, no encontré información sobre políticas relacionadas con mascotas en las instalaciones en los documentos disponibles. Esta consulta no está cubierta por los reglamentos actuales.',
    sources: [],
    confidence: 0.15,
    hasAnswer: false,
    category: 'otro',
  },
  {
    id: 'qa-008',
    keywords: ['horario', 'hora entrada', 'hora salida', 'jornada', 'turno'],
    question: '¿Cuál es el horario de trabajo?',
    answer:
      'Según el **Reglamento Interno de Trabajo**, la jornada laboral ordinaria en Garnier es:\n\n• **Lunes a viernes:** 8:00 a.m. a 5:00 p.m.\n• **Hora de almuerzo:** 12:00 m.d. a 1:00 p.m.\n• **Jornada semanal:** 44 horas\n\nExisten modalidades de **horario flexible** disponibles previa aprobación de la jefatura:\n• Horario temprano: 7:00 a.m. a 4:00 p.m.\n• Horario tardío: 9:00 a.m. a 6:00 p.m.\n\nLas horas extra deben ser autorizadas previamente por escrito y se compensan según lo establecido en el Código de Trabajo.',
    sources: [
      {
        documentId: 'doc-001',
        documentName: 'Reglamento Interno de Trabajo',
        section: 'Artículo 8 — Jornada laboral',
        pageNumber: 5,
        similarity: 0.90,
      },
    ],
    confidence: 0.90,
    hasAnswer: true,
    category: 'otro',
  },
];

// ─── SESIONES DE CHAT ANTERIORES ──────────────────────────

export const mockChatSessions: ChatSession[] = [
  {
    id: 'session-001',
    title: 'Consulta sobre días de vacaciones',
    status: 'closed',
    messageCount: 4,
    createdAt: '2026-05-18T09:15:00',
    updatedAt: '2026-05-18T09:22:00',
    preview: '¿Cuántos días de vacaciones me corresponden?',
  },
  {
    id: 'session-002',
    title: 'Teletrabajo y equipamiento',
    status: 'closed',
    messageCount: 6,
    createdAt: '2026-05-16T14:30:00',
    updatedAt: '2026-05-16T14:45:00',
    preview: '¿Cuál es la política de teletrabajo?',
  },
  {
    id: 'session-003',
    title: 'Proceso de inducción para nuevo ingreso',
    status: 'escalated',
    messageCount: 3,
    createdAt: '2026-05-15T11:00:00',
    updatedAt: '2026-05-15T11:10:00',
    preview: '¿Cómo es el proceso de inducción?',
  },
  {
    id: 'session-004',
    title: 'Reporte de incidente de seguridad',
    status: 'closed',
    messageCount: 5,
    createdAt: '2026-05-12T16:20:00',
    updatedAt: '2026-05-12T16:35:00',
    preview: '¿Cómo reporto un incidente en mi área de trabajo?',
  },
];

// ─── MENSAJES DE SESIONES ANTERIORES ──────────────────────

export const mockSessionMessages: Record<string, ChatMessage[]> = {
  'session-001': [
    {
      id: 'msg-001',
      sessionId: 'session-001',
      role: 'user',
      content: '¿Cuántos días de vacaciones me corresponden?',
      createdAt: '2026-05-18T09:15:00',
    },
    {
      id: 'msg-002',
      sessionId: 'session-001',
      role: 'assistant',
      content: mockQAPairs[0].answer,
      sources: mockQAPairs[0].sources,
      confidence: 0.94,
      hasAnswer: true,
      createdAt: '2026-05-18T09:15:30',
    },
    {
      id: 'msg-003',
      sessionId: 'session-001',
      role: 'user',
      content: '¿Y si tengo 7 años trabajando en la empresa?',
      createdAt: '2026-05-18T09:18:00',
    },
    {
      id: 'msg-004',
      sessionId: 'session-001',
      role: 'assistant',
      content: 'Con **7 años de antigüedad** en Garnier, le corresponden **19 días hábiles de vacaciones** al año. Esto se calcula así:\n\n• Base: 15 días (por tener más de 1 año)\n• Adicional: 2 días × 2 años adicionales (años 6 y 7) = 4 días extra\n• **Total: 15 + 4 = 19 días hábiles**\n\nRecuerde que el máximo es de 25 días hábiles anuales.',
      sources: [
        {
          documentId: 'doc-006',
          documentName: 'Política de Vacaciones y Permisos',
          section: 'Artículo 13 — Antigüedad y días adicionales',
          pageNumber: 5,
          similarity: 0.91,
        },
      ],
      confidence: 0.91,
      hasAnswer: true,
      createdAt: '2026-05-18T09:18:30',
    },
  ],
  'session-002': [
    {
      id: 'msg-005',
      sessionId: 'session-002',
      role: 'user',
      content: '¿Cuál es la política de teletrabajo?',
      createdAt: '2026-05-16T14:30:00',
    },
    {
      id: 'msg-006',
      sessionId: 'session-002',
      role: 'assistant',
      content: mockQAPairs[2].answer,
      sources: mockQAPairs[2].sources,
      confidence: 0.96,
      hasAnswer: true,
      createdAt: '2026-05-16T14:30:30',
    },
    {
      id: 'msg-007',
      sessionId: 'session-002',
      role: 'user',
      content: '¿Qué equipo me da la empresa para trabajar desde casa?',
      createdAt: '2026-05-16T14:35:00',
    },
    {
      id: 'msg-008',
      sessionId: 'session-002',
      role: 'assistant',
      content: 'Para la modalidad de teletrabajo, **Garnier proporciona el siguiente equipamiento:**\n\n• Laptop corporativa con las herramientas de trabajo instaladas\n• Acceso VPN para conexión segura a los sistemas internos\n• Licencias de software necesarias (Microsoft 365, Teams, etc.)\n• Subsidio mensual de **₡25,000** para cubrir gastos de internet y electricidad\n\nEl funcionario es responsable de contar con un espacio de trabajo adecuado en su hogar que cumpla con condiciones básicas de ergonomía y privacidad.\n\nEn caso de requerir equipo adicional (monitor, teclado, silla ergonómica), puede solicitarlo a través del formulario de equipamiento en el portal de RRHH.',
      sources: [
        {
          documentId: 'doc-002',
          documentName: 'Política de Teletrabajo',
          section: 'Sección 5 — Equipamiento y recursos',
          pageNumber: 8,
          similarity: 0.93,
        },
      ],
      confidence: 0.93,
      hasAnswer: true,
      createdAt: '2026-05-16T14:35:30',
    },
    {
      id: 'msg-009',
      sessionId: 'session-002',
      role: 'user',
      content: '¿Puedo teletrabajar todos los días?',
      createdAt: '2026-05-16T14:40:00',
    },
    {
      id: 'msg-010',
      sessionId: 'session-002',
      role: 'assistant',
      content: 'No, la política actual establece un **máximo de 3 días por semana** de teletrabajo. Los días deben coordinarse con su jefatura directa considerando las necesidades del equipo.\n\nExisten excepciones aprobadas por la Dirección de RRHH para casos especiales (condición médica, distancia extrema al centro de trabajo), donde se puede aprobar una modalidad de teletrabajo completo de forma temporal.',
      sources: [
        {
          documentId: 'doc-002',
          documentName: 'Política de Teletrabajo',
          section: 'Sección 3.2 — Límite de días remotos',
          pageNumber: 6,
          similarity: 0.89,
        },
      ],
      confidence: 0.89,
      hasAnswer: true,
      createdAt: '2026-05-16T14:40:30',
    },
  ],
  'session-003': [
    {
      id: 'msg-011',
      sessionId: 'session-003',
      role: 'user',
      content: '¿Cómo es el proceso de inducción?',
      createdAt: '2026-05-15T11:00:00',
    },
    {
      id: 'msg-012',
      sessionId: 'session-003',
      role: 'assistant',
      content: mockQAPairs[3].answer,
      sources: mockQAPairs[3].sources,
      confidence: 0.93,
      hasAnswer: true,
      createdAt: '2026-05-15T11:00:30',
    },
    {
      id: 'msg-013',
      sessionId: 'session-003',
      role: 'user',
      content: '¿Puedo traer mi mascota durante la inducción?',
      createdAt: '2026-05-15T11:05:00',
    },
  ],
  'session-004': [
    {
      id: 'msg-014',
      sessionId: 'session-004',
      role: 'user',
      content: '¿Cómo reporto un incidente en mi área de trabajo?',
      createdAt: '2026-05-12T16:20:00',
    },
    {
      id: 'msg-015',
      sessionId: 'session-004',
      role: 'assistant',
      content: mockQAPairs[5].answer,
      sources: mockQAPairs[5].sources,
      confidence: 0.91,
      hasAnswer: true,
      createdAt: '2026-05-12T16:20:30',
    },
    {
      id: 'msg-016',
      sessionId: 'session-004',
      role: 'user',
      content: '¿El reporte es confidencial?',
      createdAt: '2026-05-12T16:25:00',
    },
    {
      id: 'msg-017',
      sessionId: 'session-004',
      role: 'assistant',
      content: 'Sí, **todos los reportes de incidentes son tratados con estricta confidencialidad**. El protocolo garantiza:\n\n• La identidad del denunciante se mantiene protegida durante todo el proceso\n• Solo el Comité de Ética o el Comité de Seguridad (según corresponda) tiene acceso a la información\n• Garnier tiene una **política de cero tolerancia ante represalias** contra quienes reporten incidentes de buena fe\n• Si en algún momento siente que su seguridad está comprometida, puede utilizar el canal anónimo: **Línea ética 800-GARNIER**',
      sources: [
        {
          documentId: 'doc-005',
          documentName: 'Protocolo de Reporte de Incidentes',
          section: 'Sección 6 — Confidencialidad y protección',
          pageNumber: 6,
          similarity: 0.88,
        },
      ],
      confidence: 0.88,
      hasAnswer: true,
      createdAt: '2026-05-12T16:25:30',
    },
    {
      id: 'msg-018',
      sessionId: 'session-004',
      role: 'user',
      content: 'Perfecto, gracias por la información.',
      createdAt: '2026-05-12T16:30:00',
    },
    {
      id: 'msg-019',
      sessionId: 'session-004',
      role: 'assistant',
      content: '¡Con gusto! Si necesita realizar el reporte, puede acceder directamente desde el portal de RRHH o llamar al ext. 9999 si es una emergencia. ¿Hay algo más en lo que pueda ayudarle?',
      sources: [],
      confidence: 0.95,
      hasAnswer: true,
      createdAt: '2026-05-12T16:30:15',
    },
  ],
};

// ─── CONSULTAS SIN RESPUESTA ──────────────────────────────

export const mockUnansweredQueries: UnansweredQuery[] = [
  {
    id: 'unq-001',
    queryText: '¿Puedo traer mi mascota a la oficina?',
    userName: 'Jorge Villalobos',
    maxSimilarity: 0.15,
    status: 'pending',
    createdAt: '2026-05-19T10:30:00',
  },
  {
    id: 'unq-002',
    queryText: '¿Tienen programa de intercambio internacional?',
    userName: 'Laura Méndez',
    maxSimilarity: 0.22,
    status: 'pending',
    createdAt: '2026-05-18T15:45:00',
  },
  {
    id: 'unq-003',
    queryText: '¿Cuál es la política de uso de redes sociales personales?',
    userName: 'Diego Chaves',
    maxSimilarity: 0.31,
    status: 'reviewed',
    createdAt: '2026-05-17T09:20:00',
  },
  {
    id: 'unq-004',
    queryText: '¿Hay guardería o subsidio para cuido de hijos?',
    userName: 'Sofía Rodríguez',
    maxSimilarity: 0.28,
    status: 'pending',
    createdAt: '2026-05-16T11:10:00',
  },
  {
    id: 'unq-005',
    queryText: '¿Se permite el uso de bicicleta para llegar al trabajo y hay parqueo?',
    userName: 'Andrés Mora',
    maxSimilarity: 0.19,
    status: 'resolved',
    createdAt: '2026-05-14T08:50:00',
  },
];

// ─── DATOS DE ANALÍTICA ───────────────────────────────────

export const mockAnalyticsData: AnalyticsData = {
  totalQueries: 347,
  answeredQueries: 312,
  unansweredQueries: 35,
  activeDocuments: 5,
  avgConfidence: 0.89,
  avgResponseTime: 1850,
  uniqueUsers: 78,
  categoryCounts: [
    { category: 'vacaciones', count: 89, label: 'Vacaciones' },
    { category: 'permisos', count: 72, label: 'Permisos' },
    { category: 'beneficios', count: 65, label: 'Beneficios' },
    { category: 'teletrabajo', count: 48, label: 'Teletrabajo' },
    { category: 'incidentes', count: 31, label: 'Incidentes' },
    { category: 'induccion', count: 24, label: 'Inducción' },
    { category: 'otro', count: 18, label: 'Otros' },
  ],
  recentUnanswered: mockUnansweredQueries,
  weeklyTrend: [
    { day: 'Lun', queries: 58, answered: 52 },
    { day: 'Mar', queries: 65, answered: 60 },
    { day: 'Mié', queries: 52, answered: 47 },
    { day: 'Jue', queries: 71, answered: 64 },
    { day: 'Vie', queries: 48, answered: 44 },
    { day: 'Sáb', queries: 12, answered: 11 },
    { day: 'Dom', queries: 5, answered: 4 },
  ],
};

// ─── PREGUNTAS SUGERIDAS ──────────────────────────────────

export const suggestedQuestions = [
  '¿Cuántos días de vacaciones me corresponden?',
  '¿Cómo solicito un permiso?',
  '¿Cuál es la política de teletrabajo?',
  '¿Cómo es el proceso de inducción?',
  '¿Qué beneficios tengo como funcionario?',
  '¿Cómo reporto un incidente?',
];

// ─── USUARIOS PARA SELECCIÓN DE PERFIL ────────────────────

export const mockUsers: AppUser[] = [
  {
    id: 'user-pedro',
    name: 'Pedro Vargas',
    role: 'employee',
    position: 'Desarrollador de Software',
    initials: 'PV',
    accentColor: 'from-sky-500 to-sky-700',
    teamId: 'tecnologia',
  },
  {
    id: 'user-maria',
    name: 'María Solano',
    role: 'employee',
    position: 'Ejecutiva de Ventas',
    initials: 'MS',
    accentColor: 'from-rose-500 to-rose-700',
    teamId: 'ventas',
  },
  {
    id: 'user-carlos',
    name: 'Carlos Ramírez',
    role: 'employee',
    position: 'Analista Financiero',
    initials: 'CR',
    accentColor: 'from-amber-500 to-amber-700',
    teamId: 'finanzas',
  },
  {
    id: 'user-ana',
    name: 'Ana Sofía López',
    role: 'employee',
    position: 'Coordinadora de Operaciones',
    initials: 'AL',
    accentColor: 'from-violet-500 to-violet-700',
    teamId: 'operaciones',
  },
  {
    id: 'user-jefe-tech',
    name: 'Diego Mora',
    role: 'manager',
    position: 'Jefe de Tecnología',
    initials: 'DM',
    accentColor: 'from-sky-600 to-indigo-700',
    teamId: 'tecnologia',
  },
  {
    id: 'user-jefe-ventas',
    name: 'Laura Méndez',
    role: 'manager',
    position: 'Jefa de Ventas',
    initials: 'LM',
    accentColor: 'from-rose-600 to-pink-700',
    teamId: 'ventas',
  },
  {
    id: 'user-admin',
    name: 'Administrador RRHH',
    role: 'admin',
    position: 'Gestión y Analítica · RRHH',
    initials: 'RH',
    accentColor: 'from-brand-500 to-brand-700',
    teamId: 'rrhh',
  },
];

// ─── EMOCIONES DEL CHECK-IN ───────────────────────────────

export const emotionOptions: EmotionOption[] = [
  {
    id: 'estres',
    label: 'Estrés',
    emoji: '😰',
    description: 'Carga laboral o presión alta',
    bg: 'bg-rose-50',
    ring: 'ring-rose-400',
    text: 'text-rose-700',
  },
  {
    id: 'ansiedad',
    label: 'Ansiedad',
    emoji: '😟',
    description: 'Preocupación o incertidumbre',
    bg: 'bg-violet-50',
    ring: 'ring-violet-400',
    text: 'text-violet-700',
  },
  {
    id: 'cansancio',
    label: 'Cansancio',
    emoji: '😴',
    description: 'Falta de energía o descanso',
    bg: 'bg-amber-50',
    ring: 'ring-amber-400',
    text: 'text-amber-700',
  },
  {
    id: 'motivacion',
    label: 'Motivación',
    emoji: '🚀',
    description: 'Con energía y enfoque',
    bg: 'bg-sky-50',
    ring: 'ring-sky-400',
    text: 'text-sky-700',
  },
  {
    id: 'tristeza',
    label: 'Tristeza',
    emoji: '😔',
    description: 'Estado de ánimo bajo',
    bg: 'bg-slate-100',
    ring: 'ring-slate-400',
    text: 'text-slate-700',
  },
  {
    id: 'felicidad',
    label: 'Felicidad',
    emoji: '😊',
    description: 'Todo va bien hoy',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-400',
    text: 'text-emerald-700',
  },
];

// ─── PLANTILLAS DE RESPUESTA AL CHECK-IN (RAG SIMULADO) ───

interface EmotionResponseTemplate {
  greeting: string;
  intro: string;
  resources: string[];
  followUp: string;
  source: Source;
}

export const emotionResponses: Record<EmotionId, EmotionResponseTemplate> = {
  estres: {
    greeting: 'entiendo que estás atravesando un momento de estrés',
    intro: 'Gracias por contármelo, valoramos mucho que lo compartas. Revisando los reglamentos vigentes de Garnier, hay varios recursos pensados justo para esto:',
    resources: [
      '**Pausas activas:** se recomiendan micro-pausas de 5 minutos cada 2 horas durante la jornada para bajar la activación.',
      '**Programa de Asistencia al Empleado:** acompañamiento psicológico confidencial y gratuito para colaboradores y dependientes directos.',
      '**Subsidio para gimnasio:** ₡20,000/mes para actividades deportivas que ayudan a regular el estrés.',
    ],
    followUp: '¿Te gustaría que te comparta un ejercicio rápido de respiración 4-7-8 para hacer en este momento, o prefieres que te conecte con el programa de bienestar?',
    source: {
      documentId: 'doc-004',
      documentName: 'Política de Beneficios',
      section: 'Sección 5 — Programa de bienestar integral',
      pageNumber: 7,
      similarity: 0.91,
    },
  },
  ansiedad: {
    greeting: 'entiendo que estás sintiendo ansiedad',
    intro: 'Es muy valioso que lo expreses. En Garnier contamos con apoyo profesional confidencial pensado exactamente para estos momentos:',
    resources: [
      '**Línea de apoyo psicológico:** atención telefónica 24/7 con profesionales licenciados (gratuita y anónima).',
      '**Programa de Asistencia al Empleado:** hasta 6 sesiones presenciales o virtuales por año sin costo.',
      '**Flexibilidad de jornada:** posibilidad de coordinar con tu jefatura una jornada flexible temporal según tu situación.',
    ],
    followUp: '¿Quieres que te comparta el contacto directo del programa de asistencia, o prefieres primero conversar un poco más sobre lo que estás sintiendo?',
    source: {
      documentId: 'doc-004',
      documentName: 'Política de Beneficios',
      section: 'Sección 5.2 — Salud mental y apoyo emocional',
      pageNumber: 9,
      similarity: 0.88,
    },
  },
  cansancio: {
    greeting: 'entiendo que estás con cansancio acumulado',
    intro: 'El descanso es parte del trabajo, no algo opuesto. Estos son los recursos que el reglamento te ampara para recuperar energía:',
    resources: [
      '**Vacaciones:** tienes derecho a 15 días hábiles al año (más si llevas más de 5 años en Garnier), solicitables con 15 días de anticipación.',
      '**Permiso por agotamiento o salud:** hasta 3 días con certificado médico, con goce de salario completo.',
      '**Teletrabajo parcial:** si tu rol lo permite, hasta 3 días por semana coordinados con tu jefatura.',
    ],
    followUp: '¿Quieres que te explique cómo iniciar una solicitud de vacaciones, o prefieres explorar la opción de teletrabajo esta semana?',
    source: {
      documentId: 'doc-006',
      documentName: 'Política de Vacaciones y Permisos',
      section: 'Artículo 12 — Derecho a vacaciones',
      pageNumber: 4,
      similarity: 0.89,
    },
  },
  motivacion: {
    greeting: 'me encanta saber que estás motivado',
    intro: '¡Excelente! Es el momento perfecto para aprovechar las oportunidades de desarrollo que tiene Garnier:',
    resources: [
      '**Subsidio educativo:** 70% de cobertura para estudios universitarios y posgrado afines a tu rol.',
      '**Plataforma de e-learning:** acceso ilimitado a más de 800 cursos técnicos y de habilidades blandas.',
      '**Plan de carrera interno:** revisión semestral con tu jefatura para definir próximos pasos de crecimiento.',
    ],
    followUp: '¿Te gustaría explorar el catálogo de cursos disponibles, o prefieres saber cómo postular al subsidio educativo?',
    source: {
      documentId: 'doc-004',
      documentName: 'Política de Beneficios',
      section: 'Sección 7 — Desarrollo profesional',
      pageNumber: 12,
      similarity: 0.86,
    },
  },
  tristeza: {
    greeting: 'lamento que estés pasando por un momento difícil',
    intro: 'Gracias por la confianza de contarlo. Quiero recordarte que no estás solo y que tenemos recursos confidenciales y gratuitos:',
    resources: [
      '**Programa de Asistencia al Empleado:** apoyo psicológico confidencial con profesionales especializados.',
      '**Permisos por situación personal:** licencias por duelo (3 días), situaciones familiares o cuidado de un dependiente.',
      '**Conversación con RRHH:** un espacio seguro y privado si necesitas acompañamiento humano directo.',
    ],
    followUp: '¿Quieres que te ayude a coordinar una sesión confidencial con el programa de asistencia, o prefieres que te explique el proceso de un permiso personal?',
    source: {
      documentId: 'doc-004',
      documentName: 'Política de Beneficios',
      section: 'Sección 5.2 — Salud mental y apoyo emocional',
      pageNumber: 9,
      similarity: 0.84,
    },
  },
  felicidad: {
    greeting: 'qué bueno saber que tu día va bien',
    intro: '¡Gracias por compartirlo! Aprovecho para recordarte algunos beneficios que quizás estés sub-utilizando:',
    resources: [
      '**Convenios con comercios:** descuentos en restaurantes, gimnasios, librerías y entretenimiento.',
      '**Asociación solidarista:** aporte patronal del 5.33% que potencia tu ahorro a largo plazo.',
      '**Reconocimiento entre pares:** si quieres reconocer a alguien del equipo, hay un programa formal en el portal.',
    ],
    followUp: '¿Quieres que te muestre los convenios vigentes o prefieres conocer cómo nominar a un compañero al reconocimiento del trimestre?',
    source: {
      documentId: 'doc-004',
      documentName: 'Política de Beneficios',
      section: 'Sección 5 — Catálogo de beneficios',
      pageNumber: 7,
      similarity: 0.82,
    },
  },
};
