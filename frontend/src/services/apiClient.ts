// ════════════════════════════════════════════════════════════
// Cliente HTTP central — consume la API de json-server.
// Los servicios por recurso (entriesService, teamsService, etc.)
// pasan SIEMPRE por aquí; los componentes nunca llaman a axios
// directamente.
// ════════════════════════════════════════════════════════════

import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

export const API_BASE_URL = baseURL;
