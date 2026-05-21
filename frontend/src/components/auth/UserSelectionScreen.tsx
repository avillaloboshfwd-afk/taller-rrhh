import React, { useState } from 'react';
import { Building2, Sparkles, LogIn, ShieldCheck, User } from 'lucide-react';
import type { AppUser } from '../../types';
import { mockUsers } from '../../data/mockData';

interface UserSelectionScreenProps {
  onLogin: (user: AppUser) => void;
}

export const UserSelectionScreen: React.FC<UserSelectionScreenProps> = ({ onLogin }) => {
  const [selectedId, setSelectedId] = useState<string>(mockUsers[0].id);

  const selectedUser = mockUsers.find((u) => u.id === selectedId) || mockUsers[0];
  const employees = mockUsers.filter((u) => u.role === 'employee');
  const managers = mockUsers.filter((u) => u.role === 'manager');
  const admins = mockUsers.filter((u) => u.role === 'admin');

  const handleEnter = () => {
    if (selectedUser) onLogin(selectedUser);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-5 animate-fade-in">
        {/* Left brand panel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-xl tracking-wide">GARNIER</div>
                <div className="text-[11px] text-brand-100 font-semibold uppercase tracking-widest">Recursos Humanos</div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Asistente IA · Demo
              </span>
              <h1 className="text-3xl font-extrabold leading-tight">
                Bienvenido al Asistente Inteligente de Garnier
              </h1>
              <p className="text-brand-50/90 text-sm leading-relaxed font-medium">
                Selecciona tu perfil para iniciar. Si eres colaborador, comenzaremos con un breve check-in emocional para personalizar tu conversación. Si eres del equipo de RRHH, accederás directo al panel analítico.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3 text-[11px] font-semibold">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-2xl font-extrabold">RAG</div>
              <div className="text-brand-100 leading-tight mt-1">Respuestas citadas con base en reglamentos internos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-2xl font-extrabold">24/7</div>
              <div className="text-brand-100 leading-tight mt-1">Disponible para colaboradores y administradores</div>
            </div>
          </div>
        </div>

        {/* Right user picker */}
        <div className="lg:col-span-3 p-10 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">¿Quién eres?</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Elige un perfil de la demo para ver el flujo correspondiente.
            </p>
          </div>

          {/* Employee cards */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Colaboradores
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {employees.map((u) => {
                const isSelected = u.id === selectedId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`group text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                        : 'border-slate-100 hover:border-brand-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${u.accentColor} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                      {u.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-800 truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate">{u.position}</div>
                    </div>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manager cards (Jefaturas) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Jefaturas (acceso a clima del equipo)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {managers.map((u) => {
                const isSelected = u.id === selectedId;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`group text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                        : 'border-slate-100 hover:border-brand-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${u.accentColor} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                      {u.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-800 truncate flex items-center gap-1.5">
                        {u.name}
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">Jefe/a</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate">{u.position}</div>
                    </div>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin card */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Equipo de Recursos Humanos
            </span>
            {admins.map((u) => {
              const isSelected = u.id === selectedId;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10'
                      : 'border-slate-100 hover:border-brand-200 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${u.accentColor} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-800 truncate flex items-center gap-1.5">
                      {u.name}
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-100 text-brand-700 uppercase tracking-wide">Admin</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold truncate">{u.position} · Acceso directo al Dashboard</div>
                  </div>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Enter button */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <User className="w-4 h-4 text-brand-600" />
              Entrando como <strong className="text-slate-800">{selectedUser.name}</strong>
            </div>
            <button
              onClick={handleEnter}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
