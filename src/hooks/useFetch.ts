import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../types';

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

interface UseFetchResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  fetchData: (url: string, options?: FetchOptions) => Promise<void>;
}

export function useFetch<T>(): UseFetchResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();

  const fetchData = useCallback(async (url: string, options: FetchOptions = {}) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('@SysSolda:token');
      const baseUrl = API_BASE_URL;
      const headers = new Headers(options.headers || {});

      if (options.auth !== false && token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        signOut();
        throw new Error('Sessão expirada');
      }

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  return { data, error, loading, fetchData };
} 