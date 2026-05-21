import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import {
  MessageSquare,
  BadgeAlert,
  Files,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { AnalyticsData, UnansweredQuery } from '../../types';

interface DashboardViewProps {
  data: AnalyticsData;
  onNavigateToAdmin: () => void;
  onQuickResolve: (query: UnansweredQuery) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigateToAdmin, onQuickResolve }) => {
  // Sleek Tailwind CSS cards data mapping
  const metrics = [
    {
      title: 'Consultas Recibidas',
      value: data.totalQueries,
      change: '+12.4%',
      icon: <MessageSquare className="w-5 h-5 text-brand-650" />,
      bg: 'bg-brand-50/50 dark:bg-brand-950/10 border-brand-100 dark:border-brand-900/20',
      description: 'Consultas totales acumuladas',
    },
    {
      title: 'Consultas sin Respuesta',
      value: data.unansweredQueries,
      change: 'Requiere acción',
      icon: <BadgeAlert className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20',
      description: 'Consultas con baja similitud',
    },
    {
      title: 'Documentos Activos',
      value: data.activeDocuments,
      change: 'Actualizado',
      icon: <Files className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50/40 dark:bg-sky-950/10 border-sky-100 dark:border-sky-900/20',
      description: 'Políticas RAG indexadas',
    },
    {
      title: 'Confianza Promedio',
      value: `${(data.avgConfidence * 100).toFixed(0)}%`,
      change: 'Excelente',
      icon: <Activity className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20',
      description: 'Coincidencia semántica media',
    },
  ];

  // Custom colors for categories
  const COLORS = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7', '#a7f3d0', '#cbd5e1'];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 space-y-8 h-full">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-650" /> Estadísticas y Monitoreo RAG
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Métricas operacionales del motor de inteligencia artificial Garnier RH en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-500 shadow-sm shrink-0">
          <Clock className="w-3.5 h-3.5" /> Última actualización: Hace un momento
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((card, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 ${card.bg}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-inner">
                {card.icon}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {card.value}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {card.change}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {card.description}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (Lg span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">
                Frecuencia Semanal de Consultas
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Relación de consultas hechas por funcionarios vs respondidas exitosamente por RAG
              </p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-brand-600">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Totales
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Respondidas
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                />
                <Area type="monotone" dataKey="queries" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQueries)" />
                <Area type="monotone" dataKey="answered" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAnswered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Distribución por Categorías
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Temas más consultados por los colaboradores en el portal de asistencia
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryCounts} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="label" type="category" stroke="#64748b" fontSize={11} width={80} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                  {data.categoryCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower section: Recent Unanswered queries (Admin Quick Actions) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-650 animate-pulse" /> Consultas Recientes sin Respuesta
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Estas preguntas no pudieron ser contestadas automáticamente por falta de información o baja coincidencia semántica
            </p>
          </div>
          
          <button
            onClick={onNavigateToAdmin}
            className="flex items-center gap-1 text-xs font-bold text-brand-650 hover:text-brand-850 hover:underline transition-colors shrink-0"
          >
            Ver todas en Panel HR <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Consulta</th>
                <th className="py-3 px-4">Coincidencia RAG</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {data.recentUnanswered.filter(q => q.status === 'pending').slice(0, 3).map((query) => (
                <tr key={query.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {query.userName}
                  </td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-400 max-w-sm truncate font-medium">
                    "{query.queryText}"
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/30">
                      {(query.maxSimilarity * 100).toFixed(0)}% Máxima
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    {new Date(query.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => onQuickResolve(query)}
                      className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200/50 hover:border-brand-600 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      Resolver
                    </button>
                  </td>
                </tr>
              ))}
              {data.recentUnanswered.filter(q => q.status === 'pending').length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-slate-400 italic">
                    ¡Excelente! No hay consultas pendientes por resolver.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
