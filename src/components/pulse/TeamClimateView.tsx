import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  Eye,
  EyeOff,
  Lightbulb,
} from 'lucide-react';
import { useTeamReport, useTeamAlerts, useEmotions } from '../../hooks/usePulseData';
import type { AppUser, TeamStatus } from '../../types';

interface TeamClimateViewProps {
  user: AppUser;
}

const MIN_RESPONSES_FOR_KANONIMITY = 5;

const statusBadgeStyle: Record<TeamStatus, { label: string; bg: string; text: string; border: string }> = {
  saludable: { label: 'Saludable', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  observacion: { label: 'En observación', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  alerta: { label: 'En alerta', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const severityStyle: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};

export const TeamClimateView: React.FC<TeamClimateViewProps> = ({ user }) => {
  const teamId = user.teamId || '';
  const { data: report, loading: loadingReport, error } = useTeamReport(teamId);
  const { data: alerts } = useTeamAlerts(teamId);
  const { data: emotions } = useEmotions();

  if (loadingReport) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md text-center space-y-2">
          <p className="text-sm font-bold text-rose-600">No pudimos cargar el reporte del equipo.</p>
          <p className="text-xs text-slate-500 font-medium">Asegurate de que json-server esté arriba en :3001.</p>
        </div>
      </div>
    );
  }

  const status = statusBadgeStyle[report.status];
  const distributionData = emotions
    ?.map((em) => ({
      label: em.label,
      emoji: em.emoji,
      count: report.distribution[em.id] || 0,
      color: em.color,
    }))
    .filter((d) => d.count > 0) ?? [];

  const tooFewResponses = report.responsesCount < MIN_RESPONSES_FOR_KANONIMITY;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
              <Activity className="w-6 h-6 text-brand-600" /> Clima del equipo: {report.teamName}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {report.periodLabel} · {report.responsesCount} respuestas
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            <EyeOff className="w-3 h-3" /> Datos anonimizados
          </span>
        </div>

        {/* K-anonymity warning */}
        {tooFewResponses && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-800">Respuestas insuficientes para reportar</div>
              <div className="text-xs text-amber-700 font-medium mt-0.5">
                Se requieren al menos {MIN_RESPONSES_FOR_KANONIMITY} respuestas para mostrar datos del equipo y proteger la identidad de cada persona. Animá a tu equipo a registrar su pulso.
              </div>
            </div>
          </div>
        )}

        {!tooFewResponses && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Índice de bienestar</div>
                <div className="text-3xl font-extrabold text-slate-800 mt-2">{report.wellbeingIndex.toFixed(1)} <span className="text-base font-bold text-slate-400">/ 5</span></div>
                <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${report.trendDelta > 0 ? 'bg-emerald-50 text-emerald-700' : report.trendDelta < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                  {report.trendDelta > 0 ? <TrendingUp className="w-3 h-3" /> : report.trendDelta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                  {report.trendDelta > 0 ? '+' : ''}{report.trendDelta.toFixed(1)} vs período anterior
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Participación</div>
                <div className="text-3xl font-extrabold text-slate-800 mt-2">{Math.round(report.participation * 100)}%</div>
                <div className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {report.responsesCount} respuestas
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado del equipo</div>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${status.bg} ${status.text} ${status.border}`}>
                  <ShieldCheck className="w-4 h-4" /> {status.label}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-2">
                  Basado en índice y tendencia
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alertas activas</div>
                <div className="text-3xl font-extrabold text-slate-800 mt-2">{alerts?.filter((a) => !a.acknowledged).length ?? 0}</div>
                <div className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Patrones detectados
                </div>
              </div>
            </div>

            {/* Charts: trend + distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-800">Tendencia semanal</h3>
                  <p className="text-xs text-slate-500 font-medium">Evolución del índice de bienestar del equipo</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.weeklyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[1, 5]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: 12, border: 'none', color: '#f8fafc', fontSize: 12 }} />
                      <Area type="monotone" dataKey="index" stroke="#10b981" strokeWidth={3} fill="url(#trendArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-slate-800">Distribución</h3>
                  <p className="text-xs text-slate-500 font-medium">Estados emocionales del equipo</p>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={distributionData} dataKey="count" nameKey="label" innerRadius={40} outerRadius={70} paddingAngle={3}>
                        {distributionData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: 12, border: 'none', color: '#f8fafc', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-3">
                  {distributionData.map((d) => (
                    <div key={d.label} className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span>{d.emoji}</span> {d.label}
                      </span>
                      <span className="text-slate-500">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top factors */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-800">Factores que más influyen</h3>
                <p className="text-xs text-slate-500 font-medium">Lo más mencionado por el equipo en sus pulsos</p>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.topFactors} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="label" type="category" stroke="#64748b" fontSize={11} width={120} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: 12, border: 'none', color: '#f8fafc', fontSize: 12 }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts */}
            {alerts && alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertas detectadas por la IA
                </h3>
                {alerts.map((a) => {
                  const sev = severityStyle[a.severity];
                  return (
                    <div key={a.id} className={`p-5 rounded-2xl border ${sev.bg} ${sev.border}`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${sev.text}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`font-bold ${sev.text}`}>{a.title}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${sev.text} bg-white/70`}>
                              {a.severity}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed">{a.message}</p>
                          <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-700 font-semibold">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{a.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Narrative */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-2xl border border-brand-200/50 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-brand-700" /> Resumen narrativo (generado)
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{report.narrative}</p>
            </div>
          </>
        )}

        <div className="text-[11px] text-slate-400 font-semibold text-center pt-2 flex items-center justify-center gap-1.5">
          <EyeOff className="w-3 h-3" />
          Solo ves datos agregados. Las respuestas individuales son confidenciales y nunca asociables.
        </div>
      </div>
    </div>
  );
};
