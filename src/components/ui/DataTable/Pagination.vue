<script lang="ts">
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100];
</script>

<script setup lang="ts">
import { cn } from '@/utils/cn';
import { isPageInRange } from '@/utils/validation';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../DropdownMenu';
import type { PaginationProps } from './types';
import { computed } from 'vue';

const props = withDefaults(defineProps<PaginationProps>(), {
  totalPages: 0,
  pageSizeOptions: () => DEFAULT_PAGE_SIZE_OPTIONS
});

const handlePageChange = (page: number): void => {
  if (isPageInRange(page, props.totalPages)) {
    props.onPageChange(page);
  }
};

const showPagination = computed((): boolean => props.totalPages > 1 || !!props.onPageSizeChange);

const pageNumbers = computed((): (number | string)[] => {
  const pages = [];
  const delta = 1;
  const totalPages = props.totalPages;
  const currentPage = props.currentPage;

  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (
      (i === currentPage - delta - 1 && i > 0) ||
      (i === currentPage + delta + 1 && i < totalPages - 1)
    ) {
      pages.push('...');
    }
  }

  return pages.filter((v, i, a) => v !== '...' || a[i - 1] !== '...');
});

const handleSizeChange = (option: number): void => {
  props.onPageSizeChange?.(option);
  props.onPageChange(0);
};
</script>

<template>
  <div
    v-if="showPagination"
    class="flex flex-col gap-4 px-4 py-4 bg-white border-t border-gray-100 sm:px-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex justify-between flex-1 sm:hidden">
      <button
        @click="handlePageChange(currentPage - 1)"
        :disabled="currentPage === 0"
        class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <button
        @click="handlePageChange(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próximo
      </button>
    </div>

    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div class="flex items-center space-x-6">
        <p class="text-sm text-gray-500 whitespace-nowrap">
          <template v-if="totalItems !== undefined">
            Exibindo
            <span class="font-semibold text-gray-900">{{
              Math.min(currentPage * (pageSize ?? 0) + 1, totalItems)
            }}</span>
            até
            <span class="font-semibold text-gray-900">
              {{ Math.min((currentPage + 1) * (pageSize ?? 0), totalItems) }}
            </span>
            de <span class="font-semibold text-gray-900">{{ totalItems }}</span>
          </template>
          <template v-else>
            Página <span class="font-semibold text-gray-900">{{ currentPage + 1 }}</span> de
            <span class="font-semibold text-gray-900">{{ totalPages }}</span>
          </template>
        </p>

        <div v-if="onPageSizeChange && pageSize !== undefined" class="flex items-center space-x-2">
          <span class="text-xs font-medium text-gray-400 tracking-wider">Linhas:</span>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button
                class="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-white hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <span>{{ pageSize }}</span>
                <ChevronDown class="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="min-w-[80px]">
              <DropdownMenuItem
                v-for="option in pageSizeOptions"
                :key="option"
                @click="handleSizeChange(option)"
                :class="
                  cn(
                    'flex items-center justify-between',
                    pageSize === option && 'bg-indigo-50 text-indigo-700 font-semibold'
                  )
                "
              >
                {{ option }}
                <Check v-if="pageSize === option" class="w-3.5 h-3.5 ml-2" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <nav class="inline-flex items-center space-x-1" aria-label="Pagination">
        <button
          @click="handlePageChange(0)"
          :disabled="currentPage === 0"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Primeira página"
        >
          <ChevronsLeft class="w-5 h-5" />
        </button>

        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 0"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Anterior"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>

        <div class="flex items-center space-x-1 px-2">
          <template v-for="(page, index) in pageNumbers" :key="index">
            <span v-if="page === '...'" class="px-2 text-gray-400"> ... </span>
            <button
              v-else
              @click="handlePageChange(Number(page))"
              :class="
                cn(
                  'min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                  page === currentPage
                    ? 'bg-indigo-50 text-indigo-600 font-bold ring-1 ring-inset ring-indigo-500/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              "
            >
              {{ Number(page) + 1 }}
            </button>
          </template>
        </div>

        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Próximo"
        >
          <ChevronRight class="w-5 h-5" />
        </button>

        <button
          @click="handlePageChange(totalPages - 1)"
          :disabled="currentPage >= totalPages - 1"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Última página"
        >
          <ChevronsRight class="w-5 h-5" />
        </button>
      </nav>
    </div>
  </div>
</template>
