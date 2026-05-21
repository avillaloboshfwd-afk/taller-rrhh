import { apiClient } from './apiClient';
import type { Team } from '../types';

/** GET /teams — todas las áreas/equipos */
export async function fetchAllTeams(): Promise<Team[]> {
  const { data } = await apiClient.get<Team[]>('/teams');
  return data;
}

/** GET /teams/:id — un equipo por id */
export async function fetchTeamById(teamId: string): Promise<Team | null> {
  try {
    const { data } = await apiClient.get<Team>(`/teams/${teamId}`);
    return data;
  } catch {
    return null;
  }
}
