<script setup lang="ts">
import { RouterView } from 'vue-router';
import ToastProvider from '@/components/ui/Toast/ToastProvider.vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
</script>

<template>
  <ToastProvider>
    <RouterView />
    <VueQueryDevtools />
  </ToastProvider>
</template>
