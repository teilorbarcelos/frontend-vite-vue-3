import { useQuery, type UseQueryReturnType } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { dashboardService, type DashboardStats } from '../services/dashboard.service';

export const useDashboardStats = (
  startDate: Ref<Date | undefined>,
  endDate: Ref<Date | undefined>
): UseQueryReturnType<DashboardStats, Error> => {
  return useQuery({
    queryKey: computed(() => ['dashboard', 'stats', startDate.value, endDate.value]),
    queryFn: () => dashboardService.getStats(startDate.value, endDate.value)
  });
};
