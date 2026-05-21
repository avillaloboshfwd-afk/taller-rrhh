import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, Heart } from 'lucide-react';
import type { AppUser, CheckInData, EmotionId } from '../../types';
import { emotionOptions } from '../../data/mockData';

interface CheckInScreenProps {
  user: AppUser;
  onSubmit: (data: CheckInData) => void;
  onBack: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ user, onSubmit, onBack }) => {
  const [emotion, setEmotion] = useState<EmotionId | null>(null);
  const [context, setContext] = useState('');

  const selected = emotionOptions.find((e) => e.id === emotion);
  const firstName = user.name.split(' ')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !context.trim()) return;
    onSubmit({
      emotion: selected.id,
      emotionLabel: selected.label,
      context: context.trim(),
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 animate-fade-in">
        {/* Back link */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Cambiar de usuario
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${user.accentColor} text-white font-bold text-lg flex items-center justify-center shadow-md`}>
            {user.initials}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">
              Hola, {firstName} 👋
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Antes de empezar, contame cómo te sentís hoy. Esto me ayuda a darte una respuesta más útil.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Emotion picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-brand-600" /> ¿Cómo te sientes ahora?
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {emotionOptions.map((opt) => {
                const isSelected = opt.id === emotion;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEmotion(opt.id)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                      isSelected
                        ? `${opt.bg} border-current ${opt.text} ring-2 ${opt.ring} ring-offset-2 shadow-sm`
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-1.5 leading-none">{opt.emoji}</div>
                    <div className="text-sm font-bold leading-tight">{opt.label}</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5 leading-tight">
                      {opt.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Cuéntame un poco más
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Ej: Tengo muchas entregas acumuladas esta semana y no sé cómo organizarlas..."
              className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all resize-none shadow-inner placeholder-slate-400"
              rows={4}
            />
            <span className="text-[11px] text-slate-400 font-semibold block">
              Esta información se compartirá únicamente con el asistente para darte una respuesta personalizada.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!emotion || !context.trim()}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md ${
              emotion && context.trim()
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.99]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Enviar Check-In y conversar con el asistente
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
