import { apiClient } from './apiClient';
import type { ClimateReport } from '../types';

/** GET /climateReports — todos los reportes (uno por equipo) */
export async function fetchAllReports(): Promise<ClimateReport[]> {
  const { data } = await apiClient.get<ClimateReport[]>('/climateReports');
  return data;
}

/** GET /climateReports?teamId=... — reporte de un equipo */
export async function fetchReportByTeam(teamId: string): Promise<ClimateReport | null> {
  const { data } = await apiClient.get<ClimateReport[]>('/climateReports', {
    params: { teamId },
  });
  return data[0] ?? null;
}
