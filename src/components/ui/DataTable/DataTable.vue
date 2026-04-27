<script setup lang="ts" generic="T">
import { cn } from '@/utils/cn';
import { getValueByPath } from '@/utils/getValueByPath';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-vue-next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import Pagination from './Pagination.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './TableAtoms';
import { type DataTableProps, type SortDirection } from './types';
import { computed } from 'vue';

const props = defineProps<DataTableProps<T>>();

const handleSort = (key: string): void => {
  if (!props.sorting?.onChange) return;

  let nextDirection: SortDirection = 'asc';

  if (props.sorting.value.orderBy === key) {
    if (props.sorting.value.orderDirection === 'asc') nextDirection = 'desc';
    else if (props.sorting.value.orderDirection === 'desc') nextDirection = undefined;
  }

  props.sorting.onChange({
    orderBy: nextDirection ? key : undefined,
    orderDirection: nextDirection
  });

  if (props.paginationProps?.onPageChange) {
    props.paginationProps.onPageChange(0);
  }
};

const computedTotalPages = computed((): number => {
  if (props.totalItems && props.paginationProps?.pageSize) {
    return Math.ceil(props.totalItems / props.paginationProps.pageSize);
  }
  return props.paginationProps?.totalPages || 0;
});
</script>

<template>
  <TooltipProvider>
    <div
      :class="
        cn(
          'relative flex flex-col h-fit max-h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm',
          props.class
        )
      "
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] transition-all animate-in fade-in"
      >
        <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
      <div class="flex-1 overflow-auto min-h-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                v-for="(col, idx) in headerMap"
                :key="idx"
                @click="col.sortable && handleSort(col.keyItem)"
                :class="
                  cn(
                    col.sortable &&
                      'cursor-pointer select-none hover:bg-gray-50 transition-colors group'
                  )
                "
              >
                <div class="flex items-center space-x-2">
                  <span>{{ col.title }}</span>
                  <span
                    v-if="col.sortable"
                    :class="
                      cn(
                        'transition-colors',
                        sorting?.value.orderBy === col.keyItem
                          ? 'text-indigo-600'
                          : 'text-gray-300 group-hover:text-gray-400'
                      )
                    "
                  >
                    <template v-if="sorting?.value.orderBy === col.keyItem">
                      <ArrowUp v-if="sorting.value.orderDirection === 'asc'" class="w-4 h-4" />
                      <ArrowDown v-else class="w-4 h-4" />
                    </template>
                    <ArrowUpDown v-else class="w-4 h-4" />
                  </span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="data.length > 0">
              <TableRow v-for="(item, rowIdx) in data" :key="rowIdx">
                <TableCell v-for="(col, colIdx) in headerMap" :key="colIdx">
                  <template v-if="col.truncate">
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <div class="max-w-[300px] truncate cursor-help">
                          <template v-if="col.parseItem">
                            <component
                              v-if="
                                typeof col.parseItem(getValueByPath(item, col.keyItem), item) !==
                                  'string' &&
                                typeof col.parseItem(getValueByPath(item, col.keyItem), item) !==
                                  'number'
                              "
                              :is="col.parseItem(getValueByPath(item, col.keyItem), item)"
                            />
                            <template v-else>
                              {{ col.parseItem(getValueByPath(item, col.keyItem), item) }}
                            </template>
                          </template>
                          <template v-else>{{ getValueByPath(item, col.keyItem) ?? '' }}</template>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div class="max-w-xs wrap-break-word">
                          <template v-if="col.parseItem">
                            <component
                              v-if="
                                typeof col.parseItem(getValueByPath(item, col.keyItem), item) !==
                                  'string' &&
                                typeof col.parseItem(getValueByPath(item, col.keyItem), item) !==
                                  'number'
                              "
                              :is="col.parseItem(getValueByPath(item, col.keyItem), item)"
                            />
                            <template v-else>
                              {{ col.parseItem(getValueByPath(item, col.keyItem), item) }}
                            </template>
                          </template>
                          <template v-else>{{ getValueByPath(item, col.keyItem) ?? '' }}</template>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </template>
                  <template v-else>
                    <template v-if="col.parseItem">
                      <component
                        v-if="
                          typeof col.parseItem(getValueByPath(item, col.keyItem), item) !==
                            'string' &&
                          typeof col.parseItem(getValueByPath(item, col.keyItem), item) !== 'number'
                        "
                        :is="col.parseItem(getValueByPath(item, col.keyItem), item)"
                      />
                      <template v-else>
                        {{ col.parseItem(getValueByPath(item, col.keyItem), item) }}
                      </template>
                    </template>
                    <template v-else>{{ getValueByPath(item, col.keyItem) ?? '' }}</template>
                  </template>
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell :colSpan="headerMap.length" class="h-24 text-center text-gray-500">
                Nenhum registro encontrado.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <Pagination
        v-if="paginationProps"
        v-bind="paginationProps"
        :totalItems="totalItems ?? paginationProps.totalItems"
        :totalPages="computedTotalPages"
      />
    </div>
  </TooltipProvider>
</template>
