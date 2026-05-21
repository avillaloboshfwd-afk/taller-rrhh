import { useCallback } from 'react';
import { useAsync } from './useAsync';
import {
  fetchEntriesByUser,
  fetchEntriesByTeam,
  createEntry,
} from '../services/entriesService';
import { fetchAllTeams } from '../services/teamsService';
import { fetchAllReports, fetchReportByTeam } from '../services/reportsService';
import { fetchAllAlerts, fetchAlertsByTeam } from '../services/alertsService';
import { fetchEmotions, fetchFactors, fetchWellbeingTips } from '../services/catalogsService';
import type { DailyEntryInput } from '../types';

/** Pulsos del usuario actual (para "Mi Bienestar") */
export const useUserEntries = (userId: string) =>
  useAsync(() => fetchEntriesByUser(userId), [userId]);

/** Pulsos de un equipo (agregados, sin identificar individuos) */
export const useTeamEntries = (teamId: string) =>
  useAsync(() => fetchEntriesByTeam(teamId), [teamId]);

/** Catálogo de equipos */
export const useTeams = () => useAsync(() => fetchAllTeams(), []);

/** Reporte de clima de un equipo específico */
export const useTeamReport = (teamId: string) =>
  useAsync(() => fetchReportByTeam(teamId), [teamId]);

/** Todos los reportes (para la vista de reporte organizacional) */
export const useAllReports = () => useAsync(() => fetchAllReports(), []);

/** Alertas globales */
export const useAlerts = () => useAsync(() => fetchAllAlerts(), []);

/** Alertas filtradas por equipo */
export const useTeamAlerts = (teamId: string) =>
  useAsync(() => fetchAlertsByTeam(teamId), [teamId]);

/** Catálogos compartidos: emociones, factores, tips */
export const useEmotions = () => useAsync(() => fetchEmotions(), []);
export const useFactors = () => useAsync(() => fetchFactors(), []);
export const useWellbeingTips = () => useAsync(() => fetchWellbeingTips(), []);

/** Acción: crear un nuevo registro de pulso (POST) */
export function useCreateEntry() {
  return useCallback((input: DailyEntryInput) => createEntry(input), []);
}
