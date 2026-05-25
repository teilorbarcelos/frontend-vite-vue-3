<script setup lang="ts">
import { Users, Package } from 'lucide-vue-next';

defineProps<{
  totalUsers: number;
  totalProducts: number;
}>();
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <div
      class="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <div class="space-y-1">
        <p class="text-sm font-medium text-gray-500">Novos Usuários</p>
        <h3 class="text-2xl font-bold text-gray-900">{{ totalUsers }}</h3>
      </div>
      <div
        class="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"
      >
        <Users :size="20" />
      </div>
    </div>
    <div
      class="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2"
    >
      <div class="space-y-1">
        <p class="text-sm font-medium text-gray-500">Novos Produtos</p>
        <h3 class="text-2xl font-bold text-gray-900">{{ totalProducts }}</h3>
      </div>
      <div
        class="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"
      >
        <Package :size="20" />
      </div>
    </div>
  </div>
</template>
