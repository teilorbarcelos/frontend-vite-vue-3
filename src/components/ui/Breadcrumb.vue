<script setup lang="ts">
import { ChevronRight, Home } from 'lucide-vue-next';
import { useRoute, RouterLink } from 'vue-router';
import { computed } from 'vue';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuários',
  roles: 'Perfis',
  products: 'Produtos',
  new: 'Novo',
  update: 'Editar',
};

const route = useRoute();
const pathnames = computed(() => route.path.split('/').filter((x) => x));

const breadcrumbs = computed(() => {
  const paths = pathnames.value;
  const result: any[] = [];
  
  paths.forEach((value, index) => {
    // Skip IDs after 'update'
    if (index > 0 && paths[index - 1] === 'update') return;

    const isLast = index === paths.length - 1 || paths[index + 1] === undefined || value === 'update';
    const to = `/${paths.slice(0, index + 1).join('/')}`;
    const displayName = routeMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

    result.push({
      to,
      displayName,
      isLast
    });
  });
  
  return result;
});
</script>

<template>
  <nav class="flex mb-4" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      <li>
        <RouterLink
          to="/dashboard"
          class="text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Home class="w-4 h-4" />
        </RouterLink>
      </li>

      <li v-for="bc in breadcrumbs" :key="bc.to" class="flex items-center">
        <ChevronRight class="w-4 h-4 text-gray-400 mx-1 shrink-0" />
        <span v-if="bc.isLast" class="text-sm font-semibold text-indigo-600 truncate max-w-[200px]">
          {{ bc.displayName }}
        </span>
        <RouterLink
          v-else
          :to="bc.to"
          class="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          {{ bc.displayName }}
        </RouterLink>
      </li>
    </ol>
  </nav>
</template>
