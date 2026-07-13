'use client';

import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import type { UserProfile, NavbarApiResponse } from '@/types/user';

export const AUTH_USER_QUERY_KEY = ['auth', 'user', 'navbar'] as const;

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

async function fetchNavbarUser(): Promise<UserProfile> {
  const token = Cookies.get('medki_token');

  if (!token) throw new UnauthenticatedError();

  const res = await fetch(`${API_BASE}/user/navbar`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    Cookies.remove('medki_token'); 
    throw new UnauthenticatedError();
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const json: NavbarApiResponse = await res.json();
  return json.data;
}

class UnauthenticatedError extends Error {
  constructor() {
    super('Unauthenticated');
    this.name = 'UnauthenticatedError';
  }
}

export function useAuthUser() {
  const hasToken = !!Cookies.get('medki_token');

  const query = useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: fetchNavbarUser,
    staleTime: 1000 * 60 * 5,
    enabled: hasToken,
    retry: (failureCount, error) => {
      if (error instanceof UnauthenticatedError) return false;
      return failureCount < 1;
    },
  });

  const isUnauthenticated = query.error instanceof UnauthenticatedError;

  return {
    user: query.data ?? null,
    isAuth: !!query.data && !isUnauthenticated,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError && !isUnauthenticated,

    // isLoading: hasToken ? query.isPending : false,
    // isFetching: query.isFetching,
    // isError: query.isError && !isUnauthenticated,
  };
}