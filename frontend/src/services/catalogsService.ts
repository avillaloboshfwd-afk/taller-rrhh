import { apiClient } from './apiClient';
import type { PulseEmotion, PulseFactor, WellbeingTip } from '../types';

/** GET /emotions — catálogo de emociones del micro-pulso */
export async function fetchEmotions(): Promise<PulseEmotion[]> {
  const { data } = await apiClient.get<PulseEmotion[]>('/emotions');
  return data;
}

/** GET /factors — catálogo de factores de influencia */
export async function fetchFactors(): Promise<PulseFactor[]> {
  const { data } = await apiClient.get<PulseFactor[]>('/factors');
  return data;
}

/** GET /wellbeingTips — recursos de bienestar para el funcionario */
export async function fetchWellbeingTips(): Promise<WellbeingTip[]> {
  const { data } = await apiClient.get<WellbeingTip[]>('/wellbeingTips');
  return data;
}
