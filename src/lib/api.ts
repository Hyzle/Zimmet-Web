import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

export type ApiListParams = Record<string, string | number | boolean | undefined>;

export const get = async <T>(url: string, params?: ApiListParams): Promise<T> => {
  const res = await api.get<T>(url, { params });
  return res.data;
};

export const post = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await api.post<T>(url, data);
  return res.data;
};

export const put = async <T>(url: string, data?: unknown): Promise<T> => {
  const res = await api.put<T>(url, data);
  return res.data;
};

export const del = async <T = { ok: boolean }>(url: string): Promise<T> => {
  const res = await api.delete<T>(url);
  return res.data;
};
