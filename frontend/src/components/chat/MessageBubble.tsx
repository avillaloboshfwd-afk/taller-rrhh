import React from 'react';
import { Sparkles, FileText, Send, CheckCircle2, User, HelpCircle, UserCheck } from 'lucide-react';
import type { ChatMessage, Source } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  onViewSource: (source: Source) => void;
  onEscalate: () => void;
  isSessionEscalated?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onViewSource,
  onEscalate,
  isSessionEscalated = false,
}) => {
  const isUser = message.role === 'user';

  // Helper to format text with simple bolding **text** and bullet points
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      let content = line;
      
      // Handle list items starting with bullet character or dot
      const isBullet = content.trim().startsWith('•') || content.trim().startsWith('*') || content.trim().startsWith('-');
      const isNumbered = /^\d+\.\s/.test(content.trim());
      
      if (isBullet) {
        content = content.replace(/^[•*\-]\s*/, '');
      } else if (isNumbered) {
        content = content.replace(/^\d+\.\s*/, '');
      }

      // Regex replace for bold tags
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-slate-900 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const formattedLine = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc text-sm leading-relaxed mb-1">
            {formattedLine}
          </li>
        );
      }
      if (isNumbered) {
        return (
          <li key={lineIdx} className="ml-4 list-decimal text-sm leading-relaxed mb-1">
            {formattedLine}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-sm leading-relaxed mb-2 last:mb-0">
          {formattedLine}
        </p>
      );
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-[85%] ml-auto animate-slide-in-right">
        <div className="flex flex-col items-end gap-1">
          <div className="bg-brand-600 hover:bg-brand-700 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md border border-brand-500/10 transition-colors">
            <p className="text-sm leading-relaxed font-medium">{message.content}</p>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold px-1">
            Tú • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300/30 shrink-0 select-none">
          <User className="w-4.5 h-4.5 text-slate-500" />
        </div>
      </div>
    );
  }

  // Assistant UI
  const hasSources = message.sources && message.sources.length > 0;
  const isNoAnswer = message.hasAnswer === false;

  // Confidence color
  const getConfidenceColor = (conf?: number) => {
    if (!conf) return 'bg-slate-100 text-slate-500';
    if (conf >= 0.8) return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    if (conf >= 0.5) return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
    return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
  };

  return (
    <div className="flex justify-start gap-3 max-w-[85%] animate-slide-in-left">
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/10 shrink-0 select-none">
        <Sparkles className="w-4.5 h-4.5 text-white" />
      </div>
      
      <div className="flex flex-col items-start gap-2 flex-1">
        {/* Message Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm w-full">
          {/* Header row with confidence rating */}
          {message.confidence !== undefined && (
            <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Agente RAG
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${getConfidenceColor(message.confidence)}`}>
                <span>{(message.confidence * 100).toFixed(0)}% Confianza</span>
              </div>
            </div>
          )}

          {/* Actual content */}
          <div className="message-content text-slate-700 dark:text-slate-300">
            {formatMessageText(message.content)}
          </div>

          {/* Citations/Sources */}
          {hasSources && (
            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Fuentes Citadas ({message.sources?.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {message.sources?.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => onViewSource(src)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-900 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-brand-300 text-xs font-medium transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0 text-brand-500" />
                    <span className="max-w-[150px] truncate">{src.documentName}</span>
                    <span className="px-1 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800 text-[10px] text-slate-500 font-bold shrink-0">
                      Pág. {src.pageNumber}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Escalation flow container */}
        {isNoAnswer && (
          <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 mt-1 shadow-inner">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">
                  ¿Esta información no resolvió tu duda?
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Podemos canalizar tu consulta con un representante de Recursos Humanos para recibir asistencia directa.
                </p>
              </div>
            </div>
            
            {!isSessionEscalated ? (
              <button
                onClick={onEscalate}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 hover:text-brand-800 border border-brand-200/50 hover:border-brand-300 rounded-lg text-xs font-bold transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Escalar Consulta a RRHH
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5" /> Consulta Escalada Exitosamente
              </div>
            )}
          </div>
        )}

        <span className="text-[10px] text-slate-400 font-semibold px-1 select-none">
          Asistente RAG • {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
