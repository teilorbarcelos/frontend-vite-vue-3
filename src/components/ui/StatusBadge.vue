<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  active: boolean;
  feature: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['click']);

const authStore = useAuthStore();
const canActivate = computed(() => authStore.hasPermission(props.feature, 'activate'));

const handleClick = () => {
  if (canActivate.value) {
    emit('click');
  }
};
</script>

<template>
  <button
    @click="handleClick"
    :disabled="!canActivate"
    type="button"
    :class="cn(
      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all',
      active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      canActivate 
        ? ['cursor-pointer hover:ring-2 hover:ring-offset-1', active ? 'hover:ring-green-300' : 'hover:ring-red-300']
        : 'cursor-not-allowed opacity-70'
    )"
  >
    {{ active ? 'Ativo' : 'Inativo' }}
  </button>
</template>
