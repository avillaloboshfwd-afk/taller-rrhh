import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Send, BookmarkCheck, Calendar, User, FileText, BadgeHelp, CheckCircle2 } from 'lucide-react';
import type { UnansweredQuery, Document, QAPair, QueryCategory } from '../../types';

interface UnansweredQueriesViewProps {
  queries: UnansweredQuery[];
  documents: Document[];
  onAddQAPair: (qa: Omit<QAPair, 'id'>) => void;
  onUpdateQueryStatus: (id: string, status: 'pending' | 'reviewed' | 'resolved') => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export const UnansweredQueriesView: React.FC<UnansweredQueriesViewProps> = ({
  queries,
  documents,
  onAddQAPair,
  onUpdateQueryStatus,
  showToast,
}) => {
  const [selectedQueryId, setSelectedQueryId] = useState<string>(
    queries.filter((q) => q.status === 'pending')[0]?.id || queries[0]?.id || ''
  );

  // Form State
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<QueryCategory>('vacaciones');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [sectionText, setSectionText] = useState('');
  const [pageNumber, setPageNumber] = useState<number>(1);

  const activeQuery = queries.find((q) => q.id === selectedQueryId);
  const pendingQueries = queries.filter((q) => q.status === 'pending');
  const resolvedQueries = queries.filter((q) => q.status === 'resolved');

  // When selecting a new query, preset the keywords with the words from the question
  const handleSelectQuery = (query: UnansweredQuery) => {
    setSelectedQueryId(query.id);
    setAnswer('');
    
    // Auto-generate some keywords from the question
    const words = query.queryText
      .toLowerCase()
      .replace(/[¿?]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4);
    setKeywordsInput(words.join(', '));
    
    if (documents.length > 0) {
      setSelectedDocId(documents[0].id);
    }
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuery) return;
    if (!answer.trim()) {
      showToast('Por favor, escribe una respuesta oficial.', 'error');
      return;
    }

    const keywords = keywordsInput
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      showToast('Por favor, ingresa al menos una palabra clave.', 'error');
      return;
    }

    // Build the citation source if a document is selected
    const sources = [];
    const doc = documents.find((d) => d.id === selectedDocId);
    if (doc) {
      sources.push({
        documentId: doc.id,
        documentName: doc.originalName,
        section: sectionText.trim() || 'Artículo General',
        pageNumber: pageNumber || 1,
        similarity: 0.98, // Newly created exact match
      });
    }

    // Add QA pair to simulated database
    onAddQAPair({
      keywords,
      question: activeQuery.queryText,
      answer: answer.trim(),
      sources,
      confidence: 0.98,
      hasAnswer: true,
      category,
    });

    // Mark query as resolved
    onUpdateQueryStatus(activeQuery.id, 'resolved');
    
    showToast('¡Consulta resuelta e incorporada a la base vectorial RAG!', 'success');
    
    // Clear Form
    setAnswer('');
    setKeywordsInput('');
    setSectionText('');
    
    // Auto select next pending query if any
    const nextPending = queries.find((q) => q.status === 'pending' && q.id !== activeQuery.id);
    if (nextPending) {
      handleSelectQuery(nextPending);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Unresolved Queries Sidebar List */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-805 dark:text-slate-205 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-650" /> Consultas por Resolver
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Preguntas que el agente no pudo responder automáticamente
          </p>
        </div>

        {/* Categories toggler */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Pending Sublist */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block mb-1">
              Pendientes ({pendingQueries.length})
            </span>
            {pendingQueries.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuery(q)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedQueryId === q.id
                    ? 'bg-brand-50/50 dark:bg-brand-950/15 border-brand-200 dark:border-brand-900/40 text-brand-950 dark:text-brand-300'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  "{q.queryText}"
                </h4>
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold mt-1.5">
                  <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" /> {q.userName}</span>
                  <span>{new Date(q.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </button>
            ))}
            {pendingQueries.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-400 italic font-semibold">
                Sin consultas pendientes
              </div>
            )}
          </div>

          {/* Resolved Sublist */}
          {resolvedQueries.length > 0 && (
            <div className="space-y-1 pt-4 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block mb-1">
                Resueltas recientemente ({resolvedQueries.length})
              </span>
              {resolvedQueries.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-slate-50/40 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-slate-400 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-medium truncate italic text-slate-500 dark:text-slate-400">
                      "{q.queryText}"
                    </h4>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1 block">
                      Resuelto por Admin
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Form Action Workspace */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto h-full">
        {activeQuery ? (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Active query Card details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100/30 flex items-center gap-1 w-fit uppercase">
                  <BadgeHelp className="w-3.5 h-3.5" /> Consulta sin respuesta RAG
                </span>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white leading-tight">
                  "{activeQuery.queryText}"
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Solicitante: <strong className="text-slate-600 dark:text-slate-350">{activeQuery.userName}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Recibida: <strong className="text-slate-600 dark:text-slate-350">{new Date(activeQuery.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Answer formulation Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-50 dark:border-slate-800/60 pb-3">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-650" /> Formular Respuesta Oficial
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  La respuesta escrita se guardará en la base de conocimientos mock y se auto-citará al buscar palabras clave
                </p>
              </div>

              <form onSubmit={handleResolve} className="space-y-6">
                {/* Textarea answer */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">
                    Respuesta de Recursos Humanos
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Escribe la respuesta formal aquí (puedes usar **negritas**)..."
                    className="w-full min-h-[140px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all resize-none shadow-inner"
                    rows={4}
                  />
                </div>

                {/* Category & Keywords inline fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">
                      Categoría de Consulta
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as QueryCategory)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                    >
                      <option value="vacaciones">Vacaciones</option>
                      <option value="permisos">Permisos</option>
                      <option value="teletrabajo">Teletrabajo</option>
                      <option value="induccion">Inducción (Onboarding)</option>
                      <option value="beneficios">Beneficios</option>
                      <option value="incidentes">Reporte de Incidentes</option>
                      <option value="otro">Otros reglamentos</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider block">
                      Palabras Clave (Keywords)
                    </label>
                    <input
                      type="text"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="mascota, perro, gato, animal, pet-friendly"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-inner"
                    />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
                      Separadas por coma. Activan la respuesta al coincidir en el chat del colaborador.
                    </span>
                  </div>
                </div>

                {/* Vector Document Citation Source setup */}
                <div className="p-5 bg-slate-100/50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-4">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-650" /> Citar Fuente y Documentación RAG
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Documento Fuente
                      </label>
                      <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
                      >
                        <option value="">-- No citar documento --</option>
                        {documents.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.originalName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Sección o Artículo
                      </label>
                      <input
                        type="text"
                        value={sectionText}
                        onChange={(e) => setSectionText(e.target.value)}
                        placeholder="Artículo 42 — Tenencia de mascotas"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Página Cita
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={pageNumber}
                        onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-600/15"
                  >
                    <BookmarkCheck className="w-4 h-4" /> Incorporar a RAG y Resolver
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center rounded-2xl mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              ¡Todas las consultas resueltas!
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold leading-relaxed">
              No hay más consultas sin respuesta acumuladas por los colaboradores. Los reglamentos actuales cubren todos los temas consultados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
