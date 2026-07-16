import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_USER_QUERY_KEY } from '@/hooks/useAuthUser';
import { useRouter } from 'next/navigation';

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return () => {
    Cookies.remove('medki_token');
    queryClient.removeQueries({ queryKey: AUTH_USER_QUERY_KEY });
    router.push('/auth');
  };
}