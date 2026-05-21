import { apiClient } from './apiClient';
import type { ClimateAlert } from '../types';

/** GET /alerts — todas las alertas activas */
export async function fetchAllAlerts(): Promise<ClimateAlert[]> {
  const { data } = await apiClient.get<ClimateAlert[]>('/alerts');
  return data;
}

/** GET /alerts?teamId=... — alertas de un equipo */
export async function fetchAlertsByTeam(teamId: string): Promise<ClimateAlert[]> {
  const { data } = await apiClient.get<ClimateAlert[]>('/alerts', {
    params: { teamId },
  });
  return data;
}
