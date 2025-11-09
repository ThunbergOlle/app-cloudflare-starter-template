import { trpc } from '../utils/trpc';
import { useAuthContext } from '../contexts/AuthContext';

export interface User {
  id: number;
  email: string;
  firstName?: string;
}

export function useUser() {
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  const { error, data, isLoading, refetch } = trpc.getCurrentUser.useQuery(
    undefined,
    {
      enabled: isAuthenticated && !authLoading,
      retry: 1,
    }
  );

  const updateUserMutation = trpc.updateUser.useMutation();

  const updateFirstName = async (firstName: string) => {
    try {
      await updateUserMutation.mutateAsync({ firstName });
      // Refetch to ensure we have the latest data
      refetchUser();
    } catch (error) {
      console.error('Error updating first name:', error);
    }
  };

  const refetchUser = () => {
    refetch();
  };

  return {
    user: data?.user,
    isLoading,
    error,
    updateFirstName,
    isUpdating: updateUserMutation.isPending,
    refetchUser,
  };
}
