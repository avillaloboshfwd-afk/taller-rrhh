import React, { useState, useMemo } from 'react';
import {
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles,
  Loader2,
  Send,
  Briefcase,
  Users,
  Compass,
  Sun,
  MoreHorizontal,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { useEmotions, useFactors, useUserEntries, useCreateEntry } from '../../hooks/usePulseData';
import type { AppUser, DailyEntryInput, PulseEmotion } from '../../types';

interface PulseRegisterViewProps {
  user: AppUser;
  onCompleted: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const pulseEmotionIcons: Record<string, React.ComponentType<any>> = {
  'muy-bien': Smile,
  'bien': Smile,
  'neutral': Meh,
  'estresado': AlertTriangle,
  'desmotivado': Frown,
};

const factorIcons: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  MoreHorizontal: <MoreHorizontal className="w-4 h-4" />,
};

const emotionStyle = (emotion: PulseEmotion, isSelected: boolean) => {
  const base = 'border-2 transition-all duration-200 rounded-2xl p-5 text-center cursor-pointer';
  if (!isSelected) return `${base} border-slate-100 bg-white hover:border-slate-300 hover:-translate-y-0.5`;
  return `${base} border-current shadow-lg`;
};

export const PulseRegisterView: React.FC<PulseRegisterViewProps> = ({ user, onCompleted, showToast }) => {
  const { data: emotions, loading: loadingEmotions } = useEmotions();
  const { data: factors, loading: loadingFactors } = useFactors();
  const { data: userEntries, refetch: refetchEntries } = useUserEntries(user.id);
  const createEntry = useCreateEntry();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const alreadyRegisteredToday = useMemo(() => {
    if (!userEntries) return false;
    const today = new Date().toISOString().split('T')[0];
    return userEntries.some((e) => e.createdAt.startsWith(today));
  }, [userEntries]);

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!selectedEmotion) return;
    setSubmitting(true);
    try {
      const input: DailyEntryInput = {
        userId: user.id,
        teamId: user.teamId || 'sin-equipo',
        emotionId: selectedEmotion,
        factors: selectedFactors,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      await createEntry(input);
      setSubmitted(true);
      await refetchEntries();
      showToast('Pulso registrado. Gracias por compartir cómo te sientes hoy.', 'success');
    } catch (err) {
      console.error(err);
      showToast('No pudimos registrar tu pulso. Revisa que la API esté activa.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEmotions || loadingFactors) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50/30">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (alreadyRegisteredToday && !submitted) {
    const lastEntry = userEntries?.[userEntries.length - 1];
    const lastEmotion = emotions?.find((e) => e.id === lastEntry?.emotionId);
    const LastEmotionIcon = lastEmotion ? (pulseEmotionIcons[lastEmotion.id] || Smile) : Smile;
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800">
              Ya registraste tu pulso hoy ✓
            </h2>
            <p className="text-sm text-slate-500 font-medium flex items-center justify-center gap-1">
              Marcaste <strong>{lastEmotion?.label || 'tu estado'}</strong>
              <LastEmotionIcon className="w-5 h-5 text-brand-600 inline" />
              ¡Gracias por compartirlo con nosotros!
            </p>
          </div>
          <button
            onClick={onCompleted}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-600/20"
          >
            Ver mi bienestar de la semana <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-400 to-brand-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-brand-500/30 animate-bounce-in">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800">¡Gracias por compartir!</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
              Tu pulso de hoy fue registrado de forma <strong>anónima y confidencial</strong>. Nos ayuda a entender cómo está la organización y a generar mejores espacios de bienestar.
            </p>
          </div>
          <button
            onClick={onCompleted}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-600/20"
          >
            Ver Mi Bienestar <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const canAdvanceStep1 = selectedEmotion !== null;
  const canAdvanceStep2 = selectedFactors.length > 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-brand-50/30 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-[11px] font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3 h-3" /> Pulso Garnier · Anónimo
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">
            Hola, {user.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Tu pulso de hoy lleva apenas 30 segundos.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-brand-500' : 'bg-slate-200'
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-2 whitespace-nowrap">
            Paso {step} de 3
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10 animate-fade-in">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">¿Cómo te sentiste hoy?</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Elegí la opción que más se acerca a tu estado.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {emotions?.map((e) => {
                  const isSelected = selectedEmotion === e.id;
                  const EmotionIcon = pulseEmotionIcons[e.id] || Smile;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEmotion(e.id)}
                      className={emotionStyle(e, isSelected)}
                      style={isSelected ? { color: e.color, backgroundColor: `${e.color}15`, borderColor: e.color } : undefined}
                      type="button"
                    >
                      <div className="flex justify-center mb-2">
                        <EmotionIcon className="w-8 h-8" />
                      </div>
                      <div className="text-xs font-bold leading-tight">{e.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">¿Qué influyó en tu estado hoy?</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Podés seleccionar más de uno.</p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {factors?.map((f) => {
                  const isSelected = selectedFactors.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFactor(f.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50/30'
                      }`}
                      type="button"
                    >
                      {factorIcons[f.icon] || <MoreHorizontal className="w-4 h-4" />}
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">¿Querés agregar algo más?</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Opcional · Tu comentario es <strong>anónimo</strong> y solo se usa de forma agregada.
                </p>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Lo que necesites compartir, sin presiones..."
                className="w-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all resize-none shadow-inner placeholder-slate-400"
                rows={5}
                maxLength={500}
              />
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                Las jefaturas solo ven datos agregados, nunca tu comentario individual.
              </div>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between gap-3 pt-8 mt-8 border-t border-slate-100">
            <button
              onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : 1))}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Atrás
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => ((s + 1) as 2 | 3))}
                disabled={(step === 1 && !canAdvanceStep1) || (step === 2 && !canAdvanceStep2)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  (step === 1 && canAdvanceStep1) || (step === 2 && canAdvanceStep2)
                    ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Enviar Pulso
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-semibold text-center mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          Pulso Garnier garantiza anonimato. Tu jefatura nunca verá quién marcó qué.
        </p>
      </div>
    </div>
  );
};
