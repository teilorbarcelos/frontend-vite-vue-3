<script setup lang="ts">
import { useRoute, RouterView, RouterLink } from 'vue-router';
import { LogOut, User as UserIcon } from 'lucide-vue-next';
import { cn } from '@/utils/cn';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { navItems as modularNavItems } from '@/router/navItems';

const route = useRoute();
const authStore = useAuthStore();

const handleLogout = (): void => {
  authStore.logout();
  window.location.href = '/login';
};

const navItems = computed(() =>
  modularNavItems.filter((item) => !item.feature || authStore.hasPermission(item.feature, 'view'))
);

const isActive = (path: string): boolean => route.path.startsWith(path);
</script>

<template>
  <div class="flex h-screen w-full bg-gray-50">
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div class="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
        <span class="text-xl font-bold text-gray-800">Admin</span>
      </div>
      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="
            cn(
              'flex items-center px-4 py-2 rounded-md transition-colors',
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            )
          "
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header
        class="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 space-x-4"
      >
        <div class="flex items-center space-x-2 text-gray-600">
          <UserIcon class="w-5 h-5" />
          <span class="text-sm font-medium">{{ authStore.user?.name || 'User' }}</span>
        </div>
        <button
          @click="handleLogout"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          title="Sair"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </header>
      <div class="flex-1 flex flex-col min-h-0 p-6">
        <Breadcrumb />
        <RouterView />
      </div>
    </main>
  </div>
</template>
