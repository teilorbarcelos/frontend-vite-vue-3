<script setup lang="ts">
import { ref, computed } from 'vue';
import { subDays } from 'date-fns';
import { Loader2 } from 'lucide-vue-next';
import DateRangePicker from '@/components/ui/DateRangePicker.vue';
import { useDashboardStats } from '../hooks/useDashboardStats';
import SummaryCards from '../components/SummaryCards.vue';
import UserCreationsChart from '../components/UserCreationsChart.vue';
import TopCreatorsChart from '../components/TopCreatorsChart.vue';
import ProductCreationsChart from '../components/ProductCreationsChart.vue';

const dateRange = ref<{ from: Date; to: Date }>({
  from: subDays(new Date(), 30),
  to: new Date()
});

const fromDate = computed(() => dateRange.value?.from);
const endDate = computed(() => dateRange.value?.to);

const { data: stats, isLoading, isError } = useDashboardStats(fromDate, endDate);

const totalUsers = computed(() => {
  return stats.value?.userCreationStats.reduce((acc, curr) => acc + curr.count, 0) || 0;
});

const totalProducts = computed(() => {
  return stats.value?.productCreationStats.reduce((acc, curr) => acc + curr.count, 0) || 0;
});
</script>

<template>
  <div class="flex-1 space-y-6 p-4 md:p-8 pt-6 overflow-y-auto min-h-0 bg-gray-50">
    <div class="flex items-center justify-between space-y-2">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
      <div class="flex items-center space-x-2">
        <DateRangePicker v-model="dateRange" class="w-[300px]" />
      </div>
    </div>

    <div v-if="isError" class="flex items-center justify-center h-[50vh] text-red-500">
      <p>Erro ao carregar os dados do dashboard.</p>
    </div>

    <div v-else-if="isLoading || !stats" class="flex items-center justify-center h-[50vh]">
      <Loader2 class="h-8 w-8 animate-spin text-indigo-600 inline-block" />
    </div>

    <template v-else>
      <SummaryCards :total-users="totalUsers" :total-products="totalProducts" />

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <UserCreationsChart :data="stats.userCreationStats" />
        <TopCreatorsChart :data="stats.productsPerUser" />
        <ProductCreationsChart :data="stats.productCreationStats" />
      </div>
    </template>
  </div>
</template>
