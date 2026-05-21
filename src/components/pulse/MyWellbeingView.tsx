import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Heart, Lock, Loader2, Sparkles, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useUserEntries, useEmotions, useWellbeingTips } from '../../hooks/usePulseData';
import type { AppUser } from '../../types';

interface MyWellbeingViewProps {
  user: AppUser;
}

export const MyWellbeingView: React.FC<MyWellbeingViewProps> = ({ user }) => {
  const { data: entries, loading: loadingEntries, error } = useUserEntries(user.id);
  const { data: emotions } = useEmotions();
  const { data: tips } = useWellbeingTips();

  const chartData = useMemo(() => {
    if (!entries || !emotions) return [];
    return entries.map((e) => {
      const em = emotions.find((x) => x.id === e.emotionId);
      const d = new Date(e.createdAt);
      return {
        date: d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short' }),
        score: em?.score ?? 3,
        label: em?.label ?? 'Neutral',
        emoji: em?.emoji ?? '😐',
      };
    });
  }, [entries, emotions]);

  const avgScore = useMemo(() => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce((acc, p) => acc + p.score, 0);
    return sum / chartData.length;
  }, [chartData]);

  const trendDelta = useMemo(() => {
    if (chartData.length < 4) return 0;
    const half = Math.floor(chartData.length / 2);
    const oldAvg = chartData.slice(0, half).reduce((a, p) => a + p.score, 0) / half;
    const newAvg = chartData.slice(half).reduce((a, p) => a + p.score, 0) / (chartData.length - half);
    return newAvg - oldAvg;
  }, [chartData]);

  const recentTip = useMemo(() => {
    if (!tips || !chartData.length) return tips?.[0];
    const last = chartData[chartData.length - 1];
    if (last.score <= 2) return tips.find((t) => t.category === 'estres') || tips[0];
    if (last.score === 3) return tips.find((t) => t.category === 'cansancio') || tips[0];
    return tips.find((t) => t.category === 'motivacion') || tips[0];
  }, [tips, chartData]);

  if (loadingEntries) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md text-center space-y-2">
          <p className="text-sm font-bold text-rose-600">No pudimos cargar tus pulsos.</p>
          <p className="text-xs text-slate-500 font-medium">¿La API en :3001 está corriendo? Probá <code className="bg-slate-100 px-1 py-0.5 rounded">npm run dev</code>.</p>
        </div>
      </div>
    );
  }

  const trendIcon = trendDelta > 0.2 ? <TrendingUp className="w-4 h-4" /> : trendDelta < -0.2 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />;
  const trendColor = trendDelta > 0.2 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : trendDelta < -0.2 ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-100 border-slate-200';
  const trendLabel = trendDelta > 0.2 ? 'Mejorando' : trendDelta < -0.2 ? 'Necesita atención' : 'Estable';

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-brand-50/20 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" /> Mi Bienestar
            </h1>
            <p className="text-sm text-slate-500 font-medium">Cómo te has sentido en las últimas semanas — solo vos podés ver esto.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Información privada
          </span>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pulsos registrados</div>
            <div className="text-3xl font-extrabold text-slate-800 mt-2">{chartData.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Últimas 4 semanas
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tu índice promedio</div>
            <div className="text-3xl font-extrabold text-slate-800 mt-2">{avgScore.toFixed(1)} <span className="text-base font-bold text-slate-400">/ 5</span></div>
            <div className="text-xs text-slate-500 font-medium mt-1">Donde 5 = muy bien, 1 = desmotivado</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tendencia reciente</div>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${trendColor}`}>
              {trendIcon} {trendLabel}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-2">
              Comparado con tus primeras semanas
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Tu evolución emocional</h3>
            <p className="text-xs text-slate-500 font-medium">Línea de bienestar con cada pulso que registraste</p>
          </div>
          {chartData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: 12, border: 'none', color: '#f8fafc', fontSize: 12 }}
                    formatter={(_, __, props) => [`${props.payload.emoji} ${props.payload.label}`, 'Estado']}
                  />
                  <ReferenceLine y={3} stroke="#cbd5e1" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-slate-400 italic">
              Aún no hay pulsos registrados. ¡Registrá el de hoy para empezar!
            </div>
          )}
        </div>

        {/* Recent entries + Tip */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent entries */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Últimos pulsos</h3>
            <div className="space-y-2">
              {entries && entries.slice(-6).reverse().map((e) => {
                const em = emotions?.find((x) => x.id === e.emotionId);
                const d = new Date(e.createdAt);
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="text-2xl shrink-0">{em?.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 truncate">{em?.label}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">
                        {d.toLocaleDateString('es-CR', { weekday: 'long', day: '2-digit', month: 'short' })}
                      </div>
                      {e.comment && (
                        <div className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{e.comment}"</div>
                      )}
                    </div>
                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${em?.color}20`, color: em?.color }}>
                      {em?.category}
                    </div>
                  </div>
                );
              })}
              {entries?.length === 0 && (
                <div className="text-xs text-slate-400 italic py-4 text-center">Aún sin pulsos.</div>
              )}
            </div>
          </div>

          {/* Wellbeing tip */}
          <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-3xl border border-brand-200/50 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-brand-700 mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Recurso para vos</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 leading-tight mb-2">
              {recentTip?.title}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {recentTip?.body}
            </p>
            <div className="mt-4 text-[11px] font-bold text-brand-700">
              💚 Más recursos en el portal de RRHH
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-semibold text-center pt-2 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3" />
          Esta vista es 100% privada. Solo vos podés ver tu historial.
        </div>
      </div>
    </div>
  );
};
