import React, { useState, useMemo } from 'react';
import { FileText, Download, Loader2, EyeOff, TrendingUp, TrendingDown, Minus, Hash } from 'lucide-react';
import { useAllReports, useTeams } from '../../hooks/usePulseData';
import type { ClimateReport, TeamStatus } from '../../types';

interface ClimateReportViewProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const statusBadgeStyle: Record<TeamStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  saludable: { label: 'Saludable', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  observacion: { label: 'En observación', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  alerta: { label: 'En alerta', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
};

export const ClimateReportView: React.FC<ClimateReportViewProps> = ({ showToast }) => {
  const { data: reports, loading: loadingReports } = useAllReports();
  const { data: teams } = useTeams();

  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

  const filteredReports = useMemo<ClimateReport[]>(() => {
    if (!reports) return [];
    if (selectedTeamId === 'all') return reports;
    return reports.filter((r) => r.teamId === selectedTeamId);
  }, [reports, selectedTeamId]);

  const maxKeywordCount = useMemo(() => {
    if (!filteredReports.length) return 1;
    return Math.max(
      1,
      ...filteredReports.flatMap((r) => r.keywords.map((k) => k.count))
    );
  }, [filteredReports]);

  if (loadingReports) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-600" /> Reporte de Clima Organizacional
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Vista agregada por área · Últimas 4 semanas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all"
            >
              <option value="all">Todas las áreas</option>
              {teams?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              onClick={() => showToast('Reporte generado y enviado a tu correo (simulado).', 'success')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-600/20"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
          <EyeOff className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-sky-800">Privacidad garantizada</div>
            <div className="text-xs text-sky-700 font-medium mt-0.5">
              Toda la información mostrada es agregada y anonimizada. Los comentarios individuales nunca se asocian a una persona; sólo se reflejan como temas recurrentes detectados por la IA.
            </div>
          </div>
        </div>

        {/* Status grid by team */}
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-3">Estado por área</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(selectedTeamId === 'all' ? reports : filteredReports)?.map((r) => {
              const s = statusBadgeStyle[r.status];
              const trendIcon = r.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : r.trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-600" /> : <Minus className="w-4 h-4 text-slate-500" />;
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{r.teamName}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{r.responsesCount} respuestas · {Math.round(r.participation * 100)}% participación</div>
                    </div>
                    <div className={`flex items-center gap-1.5 ${s.dot.replace('bg-', 'text-')}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-extrabold text-slate-800">{r.wellbeingIndex.toFixed(1)}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Índice / 5</div>
                    </div>
                    <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${r.trendDelta > 0 ? 'bg-emerald-50 text-emerald-700' : r.trendDelta < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                      {trendIcon}
                      {r.trendDelta > 0 ? '+' : ''}{r.trendDelta.toFixed(1)}
                    </div>
                  </div>
                  <div className={`mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${s.bg} ${s.text} ${s.border}`}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* For each filtered report, show narrative + keywords */}
        {filteredReports.map((r) => (
          <div key={`detail-${r.id}`} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-slate-800">{r.teamName} · Detalle</h3>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{r.periodLabel}</span>
            </div>

            {/* Narrative */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resumen automático</div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{r.narrative}</p>
            </div>

            {/* Keywords cloud */}
            {r.keywords.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Temas recurrentes en comentarios (anónimos)
                </div>
                <div className="flex flex-wrap gap-2 items-baseline">
                  {r.keywords.map((k) => {
                    const ratio = k.count / maxKeywordCount;
                    const size = 12 + ratio * 14;
                    const opacity = 0.5 + ratio * 0.5;
                    return (
                      <span
                        key={k.word}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 font-bold"
                        style={{ fontSize: `${size}px`, opacity }}
                      >
                        {k.word}
                        <span className="text-[10px] text-brand-500 font-bold">×{k.count}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top factors mini list */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Factores top</div>
              <div className="space-y-2">
                {r.topFactors.slice(0, 4).map((f) => {
                  const max = r.topFactors[0]?.count || 1;
                  const pct = (f.count / max) * 100;
                  return (
                    <div key={f.factorId}>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                        <span>{f.label}</span>
                        <span className="text-slate-400">{f.count} menciones</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div className="text-[11px] text-slate-400 font-semibold text-center pt-2">
          Pulso Garnier · Reporte agregado · Las respuestas individuales son confidenciales.
        </div>
      </div>
    </div>
  );
};
