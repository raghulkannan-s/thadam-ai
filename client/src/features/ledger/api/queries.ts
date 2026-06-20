import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface BalanceResponse {
  userId: number;
  balance: number;
}

export function useCoinBalance() {
  return useQuery({
    queryKey: ['ledger', 'balance'],
    queryFn: async () => {
      const response = await apiFetch<BalanceResponse>('/api/ledger/balance');
      return response.data;
    },
  });
}
