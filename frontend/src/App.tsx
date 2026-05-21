import React, { useState, useMemo } from 'react';
import { Sidebar, type TabId } from './components/layout/Sidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { DashboardView } from './components/analytics/DashboardView';
import { DocumentManager } from './components/documents/DocumentManager';
import { UnansweredQueriesView } from './components/admin/UnansweredQueriesView';
import { DocumentViewerModal } from './components/chat/DocumentViewerModal';
import { ToastContainer } from './components/common/Toast';
import { UserSelectionScreen } from './components/auth/UserSelectionScreen';
import { CheckInScreen } from './components/auth/CheckInScreen';
import { generateChatResponse, isAiEnabled } from './services/aiService';

// Import initial mock data
import {
  mockDocuments,
  mockChatSessions,
  mockSessionMessages,
  mockUnansweredQueries,
  mockQAPairs,
  emotionResponses,
} from './data/mockData';

import type {
  Document,
  ChatSession,
  ChatMessage,
  UnansweredQuery,
  QAPair,
  ToastNotification,
  Source,
  AppUser,
  CheckInData,
} from './types';

export default function App() {
  // ─── ESTADOS PRINCIPALES ──────────────────────────────────
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>(mockSessionMessages);
  const [unansweredQueries, setUnansweredQueries] = useState<UnansweredQuery[]>(mockUnansweredQueries);
  const [qaPairs, setQAPairs] = useState<QAPair[]>(mockQAPairs);

  // ─── SESIÓN / CHECK-IN ────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [checkInCompleted, setCheckInCompleted] = useState(false);

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [currentSessionId, setCurrentSessionId] = useState<string>(mockChatSessions[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modal viewer state
  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);
  const [viewerSource, setViewerSource] = useState<Source | undefined>(undefined);

  // ─── SISTEMA DE TOASTS ────────────────────────────────────
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      message,
      type,
      duration: 4000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── ENVÍO DE MENSAJE ─────────────────────────────────────
  // Chat 100% Groq: si la API falla o la key no está, se muestra error.
  // El admin loop sigue vivo — qaPairs (estado) se inyecta como
  // knowledge base en cada llamada, así las respuestas que el admin
  // agrega se vuelven inmediatamente parte del contexto del LLM.
  const handleSendMessage = async (text: string) => {
    if (!currentSessionId || isGenerating || !currentUser) return;

    if (!isAiEnabled()) {
      addToast('La IA no está configurada. Definí VITE_GROQ_API_KEY en .env y reiniciá.', 'error');
      return;
    }

    const timestamp = new Date().toISOString();
    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: currentSessionId,
      role: 'user',
      content: text,
      createdAt: timestamp,
    };

    // Capturamos el historial ANTES de agregar el mensaje nuevo
    // (la API recibe history + el mensaje actual como input separado).
    const priorHistory = sessionMessages[currentSessionId] || [];

    setSessionMessages((prev) => {
      const existing = prev[currentSessionId] || [];
      return { ...prev, [currentSessionId]: [...existing, newUserMessage] };
    });

    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, preview: text, messageCount: s.messageCount + 1, updatedAt: timestamp }
          : s
      )
    );

    setIsGenerating(true);

    try {
      const ai = await generateChatResponse(text, priorHistory, currentUser, documents, qaPairs);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sessionId: currentSessionId,
        role: 'assistant',
        content: ai.content,
        sources: ai.sources,
        confidence: ai.confidence,
        hasAnswer: ai.hasAnswer,
        createdAt: new Date().toISOString(),
      };

      setSessionMessages((prev) => {
        const existing = prev[currentSessionId] || [];
        return { ...prev, [currentSessionId]: [...existing, assistantMsg] };
      });

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messageCount: s.messageCount + 1, updatedAt: new Date().toISOString() }
            : s
        )
      );

      // Si el LLM no pudo responder O tiene muy baja confianza, registramos en el panel admin
      // Pero solo si hasAnswer es explícitamente false, no solo por confianza baja
      if (!ai.hasAnswer || (ai.confidence < 0.2 && !ai.sources.length)) {
        const newUnanswered: UnansweredQuery = {
          id: `unq-${Date.now()}`,
          queryText: text,
          userName: currentUser.name,
          maxSimilarity: ai.confidence,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        setUnansweredQueries((prev) => [newUnanswered, ...prev]);
        addToast('Consulta requiere revisión. Agregada al panel de HR.', 'warning');
      }
    } catch (err) {
      console.error('[Groq] Error al llamar al LLM:', err);
      addToast('La IA no respondió. Verificá tu conexión o la API key.', 'error');

      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sessionId: currentSessionId,
        role: 'assistant',
        content:
          'No pude conectar con el asistente en este momento. Intenta enviar tu mensaje de nuevo en unos segundos.',
        sources: [],
        confidence: 0,
        hasAnswer: false,
        createdAt: new Date().toISOString(),
      };

      setSessionMessages((prev) => {
        const existing = prev[currentSessionId] || [];
        return { ...prev, [currentSessionId]: [...existing, errorMsg] };
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── CREAR NUEVO CHAT ─────────────────────────────────────
  const handleCreateSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newSession: ChatSession = {
      id: newSessionId,
      title: `Consulta de ${currentUser?.name?.split(' ')[0] || 'RRHH'} #${chatSessions.length + 1}`,
      status: 'open',
      messageCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      preview: 'Escribe tu consulta sobre reglamentos...',
    };

    setChatSessions((prev) => [newSession, ...prev]);
    setSessionMessages((prev) => ({ ...prev, [newSessionId]: [] }));
    setCurrentSessionId(newSessionId);

    addToast('Nueva sesión de conversación iniciada.', 'info');
  };

  // ─── ESCALAR CONSULTA A RRHH ──────────────────────────────
  const handleEscalateSession = (sessionId: string) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'escalated' } : s))
    );

    const escalationMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      sessionId,
      role: 'assistant',
      content:
        '**[SISTEMA — CONSULTA ESCALADA]**\n\nTu pregunta ha sido enviada al panel prioritario de Recursos Humanos. Un representante revisará los detalles y te responderá a la brevedad.\n\n*Referencia de caso asignada: #GAR-2026-89A.*',
      createdAt: new Date().toISOString(),
    };

    setSessionMessages((prev) => {
      const existing = prev[sessionId] || [];
      return { ...prev, [sessionId]: [...existing, escalationMsg] };
    });

    addToast('Consulta canalizada prioritariamente al equipo de RRHH.', 'success');
  };

  // ─── ACCIONES DE DOCUMENTOS ───────────────────────────────
  const handleUploadDocument = (newDoc: Omit<Document, 'id' | 'uploadedAt'>) => {
    const uploadedDoc: Document = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [uploadedDoc, ...prev]);
    addToast(`"${uploadedDoc.originalName}" indexado en la base vectorial con éxito.`, 'success');
  };

  const handleToggleDocumentStatus = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const newStatus = d.status === 'active' ? 'inactive' : 'active';
          addToast(
            `"${d.originalName}" está ahora ${newStatus === 'active' ? 'activo' : 'inactivo'} para consultas RAG.`,
            'info'
          );
          return { ...d, status: newStatus };
        }
        return d;
      })
    );
  };

  const handleDeleteDocument = (docId: string) => {
    const docToDelete = documents.find((d) => d.id === docId);
    if (!docToDelete) return;
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    addToast(`"${docToDelete.originalName}" eliminado de la base vectorial RAG.`, 'error');
  };

  const handleViewSource = (source: Source) => {
    const doc = documents.find((d) => d.id === source.documentId);
    if (doc) {
      setViewerDoc(doc);
      setViewerSource(source);
    } else {
      addToast('El documento original ya no está disponible en la base vectorial.', 'error');
    }
  };

  const handleViewDocumentDirectly = (doc: Document) => {
    setViewerDoc(doc);
    setViewerSource(undefined);
  };

  // ─── ACCIONES DEL PANEL ADMINISTRADOR ─────────────────────
  const handleAddQAPair = (newQA: Omit<QAPair, 'id'>) => {
    const finalQA: QAPair = { ...newQA, id: `qa-${Date.now()}` };
    setQAPairs((prev) => [finalQA, ...prev]);
  };

  const handleUpdateQueryStatus = (queryId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    setUnansweredQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, status } : q))
    );
  };

  const handleQuickResolveFromDashboard = (_query: UnansweredQuery) => {
    setActiveTab('admin');
  };

  // ─── FLUJO DE AUTENTICACIÓN Y CHECK-IN ────────────────────
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('dashboard');
      setCheckInCompleted(true);
      addToast(`Bienvenido, ${user.name}. Acceso al panel analítico.`, 'success');
    } else {
      setActiveTab('chat');
      setCheckInCompleted(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCheckInCompleted(false);
    setActiveTab('chat');
    setCurrentSessionId(mockChatSessions[0]?.id || '');
  };

  const handleCheckIn = (data: CheckInData) => {
    if (!currentUser) return;
    const firstName = currentUser.name.split(' ')[0];
    const cfg = emotionResponses[data.emotion];

    // Crear nueva sesión "check-in"
    const newSessionId = `session-${Date.now()}`;
    const now = new Date().toISOString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: `Check-In de ${firstName} · ${data.emotionLabel}`,
      status: 'open',
      messageCount: 2,
      createdAt: now,
      updatedAt: now,
      preview: data.context,
    };

    // Mensaje del usuario (check-in)
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: newSessionId,
      role: 'user',
      content: `Hoy me siento **${data.emotionLabel.toLowerCase()}**. ${data.context}`,
      createdAt: now,
    };

    // Respuesta personalizada del asistente
    const responseContent =
      `Hola **${firstName}**, ${cfg.greeting}. ${cfg.intro}\n\n` +
      cfg.resources.map((r) => `• ${r}`).join('\n') +
      `\n\n${cfg.followUp}`;

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sessionId: newSessionId,
      role: 'assistant',
      content: responseContent,
      sources: [cfg.source],
      confidence: cfg.source.similarity,
      hasAnswer: true,
      createdAt: new Date(Date.now() + 1500).toISOString(),
    };

    setChatSessions((prev) => [newSession, ...prev]);
    setSessionMessages((prev) => ({
      ...prev,
      [newSessionId]: [userMsg, assistantMsg],
    }));
    setCurrentSessionId(newSessionId);
    setCheckInCompleted(true);
    setActiveTab('chat');
    addToast(`Check-In registrado. El asistente preparó una respuesta para ${firstName}.`, 'success');
  };

  // ─── CÓMPUTO DE ANALÍTICAS DINÁMICAS ──────────────────────
  const computedAnalytics = useMemo(() => {
    const activeDocsCount = documents.filter((d) => d.status === 'active').length;
    const unansweredCount = unansweredQueries.filter((q) => q.status === 'pending').length;

    let totalMsgs = 0;
    let answeredMsgs = 0;

    Object.values(sessionMessages).forEach((msgs) => {
      msgs.forEach((m) => {
        if (m.role === 'user') totalMsgs++;
        if (m.role === 'assistant' && m.hasAnswer) answeredMsgs++;
      });
    });

    const finalTotal = 347 + totalMsgs;
    const finalAnswered = 312 + answeredMsgs;
    const finalUnanswered = 35 + unansweredCount;

    const categoriesCountsMap: Record<string, number> = {
      vacaciones: 89,
      permisos: 72,
      beneficios: 65,
      teletrabajo: 48,
      incidentes: 31,
      induccion: 24,
      otro: 18,
    };

    qaPairs.slice(mockQAPairs.length).forEach((qa) => {
      if (categoriesCountsMap[qa.category] !== undefined) {
        categoriesCountsMap[qa.category]++;
      } else {
        categoriesCountsMap.otro++;
      }
    });

    const categoryLabels: Record<string, string> = {
      vacaciones: 'Vacaciones',
      permisos: 'Permisos',
      beneficios: 'Beneficios',
      teletrabajo: 'Teletrabajo',
      incidentes: 'Incidentes',
      induccion: 'Inducción',
      otro: 'Otros',
    };

    const categoryCountsArray = Object.keys(categoriesCountsMap).map((cat) => ({
      category: cat,
      count: categoriesCountsMap[cat],
      label: categoryLabels[cat] || cat,
    }));

    return {
      totalQueries: finalTotal,
      answeredQueries: finalAnswered,
      unansweredQueries: finalUnanswered,
      activeDocuments: activeDocsCount,
      avgConfidence: 0.89,
      avgResponseTime: 1850,
      uniqueUsers: 78,
      categoryCounts: categoryCountsArray,
      recentUnanswered: unansweredQueries,
      weeklyTrend: [
        { day: 'Lun', queries: 58, answered: 52 },
        { day: 'Mar', queries: 65, answered: 60 },
        { day: 'Mié', queries: 52, answered: 47 },
        { day: 'Jue', queries: 71, answered: 64 },
        { day: 'Vie', queries: 48, answered: 44 },
        { day: 'Sáb', queries: 12 + (activeTab === 'chat' && totalMsgs > 0 ? 3 : 0), answered: 11 + (activeTab === 'chat' && answeredMsgs > 0 ? 3 : 0) },
        { day: 'Dom', queries: 5, answered: 4 },
      ],
    };
  }, [documents, sessionMessages, unansweredQueries, qaPairs, activeTab]);

  // ─── RENDER CONDICIONAL POR ETAPA DE LA SESIÓN ────────────
  if (!currentUser) {
    return <UserSelectionScreen onLogin={handleLogin} />;
  }

  if (currentUser.role === 'employee' && !checkInCompleted) {
    return <CheckInScreen user={currentUser} onSubmit={handleCheckIn} onBack={handleLogout} />;
  }

  // Empleados sólo deben ver chat; admins ven todo
  const visibleTabs: TabId[] =
    currentUser.role === 'admin'
      ? ['chat', 'dashboard', 'documents', 'admin']
      : ['chat'];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 antialiased">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unansweredCount={unansweredQueries.filter((q) => q.status === 'pending').length}
        currentUser={currentUser}
        onLogout={handleLogout}
        visibleTabs={visibleTabs}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {activeTab === 'chat' && (
          <ChatContainer
            sessions={chatSessions}
            currentSessionId={currentSessionId}
            messages={sessionMessages[currentSessionId] || []}
            onSelectSession={setCurrentSessionId}
            onCreateSession={handleCreateSession}
            onSendMessage={handleSendMessage}
            onViewSource={handleViewSource}
            onEscalateSession={handleEscalateSession}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'dashboard' && currentUser.role === 'admin' && (
          <DashboardView
            data={computedAnalytics}
            onNavigateToAdmin={() => setActiveTab('admin')}
            onQuickResolve={handleQuickResolveFromDashboard}
          />
        )}

        {activeTab === 'documents' && currentUser.role === 'admin' && (
          <DocumentManager
            documents={documents}
            onUploadDocument={handleUploadDocument}
            onToggleStatus={handleToggleDocumentStatus}
            onDeleteDocument={handleDeleteDocument}
            onViewDocument={handleViewDocumentDirectly}
          />
        )}

        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <UnansweredQueriesView
            queries={unansweredQueries}
            documents={documents}
            onAddQAPair={handleAddQAPair}
            onUpdateQueryStatus={handleUpdateQueryStatus}
            showToast={addToast}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {viewerDoc && (
        <DocumentViewerModal
          document={viewerDoc}
          source={viewerSource}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </div>
  );
}
