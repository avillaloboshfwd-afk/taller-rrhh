import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, MessageSquare, CornerDownLeft, Paperclip, Send, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { suggestedQuestions } from '../../data/mockData';
import type { ChatSession, ChatMessage, Source } from '../../types';

interface ChatContainerProps {
  sessions: ChatSession[];
  currentSessionId: string;
  messages: ChatMessage[];
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onSendMessage: (text: string) => void;
  onViewSource: (source: Source) => void;
  onEscalateSession: (sessionId: string) => void;
  isGenerating: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  sessions,
  currentSessionId,
  messages,
  onSelectSession,
  onCreateSession,
  onSendMessage,
  onViewSource,
  onEscalateSession,
  isGenerating,
}) => {
  const [search, setSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedClick = (q: string) => {
    if (isGenerating) return;
    onSendMessage(q);
  };

  const activeSession = sessions.find((s) => s.id === currentSessionId);
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Session History Sidebar */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shrink-0">
        {/* Search & Actions Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <button
            onClick={onCreateSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 dark:hover:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200/40 hover:border-brand-300 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nueva Conversación
          </button>
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              No se encontraron chats
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const hasEscalated = session.status === 'escalated';
              
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 flex items-start gap-3 group relative border ${
                    isActive
                      ? 'bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-750'
                      : 'border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover:border-slate-100 dark:hover:border-slate-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                    isActive ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">
                        {new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      {hasEscalated && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/30 flex items-center gap-0.5 uppercase shrink-0">
                          Escalado
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {session.title}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {session.preview}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Chat Header */}
        {activeSession ? (
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between relative z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  {activeSession.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {messages.length} mensajes en esta sesión • Canal de consultas internas
                </p>
              </div>
            </div>

            {activeSession.status === 'escalated' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/40 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Esta sesión está siendo revisada por un especialista de RRHH</span>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-100">Cargando chat...</span>
          </div>
        )}

        {/* Messages Logs Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            /* First conversation Empty state showing Garnier brand & suggested Qs */
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Sparkles className="w-8 h-8 text-white animate-bounce-in" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  ¿Cómo puedo ayudarte hoy?
                </h2>
                <p className="text-sm text-slate-450 dark:text-slate-400 max-w-md mx-auto">
                  Soy el Asistente Inteligente de Garnier. Resuelvo dudas de vacaciones, teletrabajo, onboarding e incidentes basándome en reglamentos internos vigentes.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="w-full">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                  Preguntas Recomendadas
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedClick(q)}
                      className="text-left px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50/20 dark:hover:bg-brand-950/10 text-slate-650 dark:text-slate-350 hover:text-brand-700 dark:hover:text-brand-300 text-sm font-semibold transition-all duration-200 shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Regular conversation logs */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onViewSource={onViewSource}
                  onEscalate={() => onEscalateSession(currentSessionId)}
                  isSessionEscalated={activeSession?.status === 'escalated'}
                />
              ))}

              {/* Typing indicator */}
              {isGenerating && (
                <div className="flex justify-start gap-3 max-w-[85%] animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shrink-0 shadow-md shadow-brand-500/10">
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-brand-500 typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-brand-500 typing-dot" />
                    <span className="w-2 h-2 rounded-full bg-brand-500 typing-dot" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input message box container */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-brand-500/15 focus-within:border-brand-500 transition-all shadow-inner">
              <button
                type="button"
                onClick={() => alert('Simulación: En producción podrás adjuntar capturas de pantalla o reportes en PDF.')}
                className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 rounded-xl transition-colors shrink-0"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu consulta sobre políticas o reglamentos..."
                className="flex-1 max-h-32 min-h-[44px] py-2 bg-transparent text-slate-850 dark:text-slate-250 placeholder-slate-400 focus:outline-none resize-none text-sm font-medium leading-relaxed"
                rows={1}
                disabled={isGenerating}
              />
              
              <button
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                  inputText.trim() && !isGenerating
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/15'
                    : 'bg-slate-100 dark:bg-slate-850 text-slate-350 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between px-2 mt-2">
              <span className="text-[10px] text-slate-405 dark:text-slate-500 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Respuestas basadas en reglamentos institucionales cargados.
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                Enter para enviar • Shift+Enter salto
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
