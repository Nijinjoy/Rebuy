import { useCallback, useState } from 'react';

// Pull-to-refresh state for a list. Unlike a query's isRefetching, it is
// only true while a refresh the user pulled for is running, so background
// refetches (e.g. when a screen mounts with stale data) don't flash the
// spinner and shift the list.
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  return { refreshing, onRefresh };
}
