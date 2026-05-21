import React from 'react';
import {
  MessageSquare,
  BarChart3,
  Files,
  ShieldAlert,
  Sparkles,
  Building2,
  LogOut,
  Heart,
  Activity,
  FileText,
  HeartPulse,
} from 'lucide-react';
import type { AppUser } from '../../types';

export type TabId =
  | 'chat'
  | 'dashboard'
  | 'documents'
  | 'admin'
  | 'pulse-register'
  | 'pulse-my-wellbeing'
  | 'pulse-team'
  | 'pulse-report';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  unansweredCount: number;
  currentUser: AppUser;
  onLogout: () => void;
  visibleTabs: TabId[];
}

interface MenuItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: number;
  group: 'asistente' | 'pulso' | 'admin';
}

const groupLabels: Record<MenuItem['group'], string> = {
  asistente: 'Asistente RH',
  pulso: 'Pulso Garnier',
  admin: 'Administración',
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unansweredCount,
  currentUser,
  onLogout,
  visibleTabs,
}) => {
  const allMenuItems: MenuItem[] = [
    {
      id: 'chat',
      label: 'Asistente Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Conversación con IA',
      group: 'asistente',
    },
    {
      id: 'pulse-register',
      label: 'Registrar Pulso',
      icon: <HeartPulse className="w-5 h-5" />,
      description: 'Cómo te sentís hoy',
      group: 'pulso',
    },
    {
      id: 'pulse-my-wellbeing',
      label: 'Mi Bienestar',
      icon: <Heart className="w-5 h-5" />,
      description: 'Tu historial privado',
      group: 'pulso',
    },
    {
      id: 'pulse-team',
      label: 'Clima del Equipo',
      icon: <Activity className="w-5 h-5" />,
      description: 'Datos agregados',
      group: 'pulso',
    },
    {
      id: 'pulse-report',
      label: 'Reporte de Clima',
      icon: <FileText className="w-5 h-5" />,
      description: 'Reporte organizacional',
      group: 'pulso',
    },
    {
      id: 'dashboard',
      label: 'Dashboard RAG',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Métricas del asistente',
      group: 'admin',
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: <Files className="w-5 h-5" />,
      description: 'Políticas y reglamentos',
      group: 'admin',
    },
    {
      id: 'admin',
      label: 'Panel HR',
      icon: <ShieldAlert className="w-5 h-5" />,
      description: 'Consultas por resolver',
      badge: unansweredCount > 0 ? unansweredCount : undefined,
      group: 'admin',
    },
  ];

  const menuItems = allMenuItems.filter((item) => visibleTabs.includes(item.id));

  // Agrupar por sección
  const grouped = menuItems.reduce<Record<MenuItem['group'], MenuItem[]>>(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    { asistente: [], pulso: [], admin: [] }
  );

  return (
    <aside className="w-80 bg-slate-900 text-slate-100 flex flex-col h-screen shrink-0 border-r border-slate-800 shadow-xl relative z-10">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg leading-none tracking-wide text-white">GARNIER</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-0.5 uppercase tracking-wider">
              <Sparkles className="w-2.5 h-2.5" /> Demo
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Asistente RH · Pulso Garnier</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {(Object.keys(grouped) as MenuItem['group'][]).map((group) => {
          const items = grouped[group];
          if (!items.length) return null;
          return (
            <div key={group} className="space-y-2">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {groupLabels[group]}
              </div>
              {items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left relative ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r" />
                    )}

                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive ? 'bg-brand-500/30 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white truncate">{item.label}</div>
                      <div className={`text-[11px] font-medium leading-none mt-0.5 truncate ${isActive ? 'text-brand-100' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        isActive ? 'bg-white text-brand-700' : 'bg-brand-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Current User */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800/50">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentUser.accentColor} text-white text-sm font-bold flex items-center justify-center shadow-sm`}>
            {currentUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
              {currentUser.name}
              {currentUser.role === 'admin' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-500/20 text-brand-300 uppercase tracking-wide">Admin</span>
              )}
              {currentUser.role === 'manager' && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wide">Jefe/a</span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate font-medium">{currentUser.position}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-700 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Cambiar de Usuario
        </button>
      </div>
    </aside>
  );
};
