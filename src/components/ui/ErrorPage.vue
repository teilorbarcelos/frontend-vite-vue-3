<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, Home, RotateCcw } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import Button from './Button.vue';

interface Props {
  error?: any;
}

const props = defineProps<Props>();
const router = useRouter();

const errorMessage = computed(() => {
  if (props.error instanceof Error) return props.error.message;
  if (typeof props.error === 'string') return props.error;
  return 'An unexpected error occurred.';
});

const errorStatus = computed(() => {
  return props.error?.status || '404';
});

const handleReload = () => {
  window.location.reload();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div
      class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      <div class="p-8 text-center">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6"
        >
          <AlertCircle class="w-8 h-8" />
        </div>

        <h1 class="text-4xl font-extrabold text-gray-900 mb-2">{{ errorStatus }}</h1>
        <p class="text-lg font-medium text-gray-600 mb-6">Oops! Something went wrong.</p>

        <div class="bg-gray-50 rounded-lg p-4 mb-8 text-left border border-gray-200">
          <p class="text-sm font-mono text-gray-700 wrap-break-word leading-relaxed">
            {{ errorMessage }}
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <Button @click="handleReload" class="w-full flex items-center justify-center gap-2 h-11">
            <RotateCcw class="w-4 h-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            @click="router.push('/')"
            class="w-full flex items-center justify-center gap-2 h-11"
          >
            <Home class="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <div class="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
        <p class="text-xs text-gray-500 italic">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  </div>
</template>
