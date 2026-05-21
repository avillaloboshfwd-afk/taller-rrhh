import { apiClient } from './apiClient';
import type { DailyEntry, DailyEntryInput } from '../types';

/** GET /entries — todos los registros del micro-pulso */
export async function fetchAllEntries(): Promise<DailyEntry[]> {
  const { data } = await apiClient.get<DailyEntry[]>('/entries');
  return data;
}

/** GET /entries?userId=... — registros de un funcionario específico */
export async function fetchEntriesByUser(userId: string): Promise<DailyEntry[]> {
  const { data } = await apiClient.get<DailyEntry[]>('/entries', {
    params: { userId },
  });
  // Ordenamos por fecha ascendente para los gráficos de tendencia
  return [...data].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** GET /entries?teamId=... — registros agregados de un equipo */
export async function fetchEntriesByTeam(teamId: string): Promise<DailyEntry[]> {
  const { data } = await apiClient.get<DailyEntry[]>('/entries', {
    params: { teamId },
  });
  return data;
}

/** POST /entries — crea un nuevo registro de pulso */
export async function createEntry(input: DailyEntryInput): Promise<DailyEntry> {
  const { data } = await apiClient.post<DailyEntry>('/entries', input);
  return data;
}

/** Verifica si el usuario ya registró su pulso hoy (zona local) */
export async function hasEntryToday(userId: string): Promise<boolean> {
  const entries = await fetchEntriesByUser(userId);
  const today = new Date().toISOString().split('T')[0];
  return entries.some((e) => e.createdAt.startsWith(today));
}
