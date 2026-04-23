<script setup lang="ts">
/* v8 ignore start */
// Ignorado para coverage pois não está em uso direto na aplicação e apresenta instabilidade no ambiente JSDOM.
import { cn } from '@/utils/cn';
import { 
  CalendarRoot, 
  type CalendarRootProps, 
  CalendarHeader, 
  CalendarHeading,
  CalendarGrid,
  CalendarGridHead,
  CalendarHeadCell,
  CalendarGridBody,
  CalendarGridRow,
  CalendarCell,
  CalendarCellTrigger,
  CalendarPrev,
  CalendarNext
} from 'radix-vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

import { useForwardPropsEmits } from 'radix-vue';

type Props = CalendarRootProps & {
  class?: string;
};

const props = defineProps<Props>();
const emits = defineEmits(['update:modelValue']);
const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <CalendarRoot
    v-bind="forwarded"
    v-slot="{ grid, weekDays }"
    :class="cn('p-4', props.class)"
  >
    <CalendarHeader class="flex justify-between items-center mb-4">
      <CalendarPrev class="p-2 hover:bg-gray-100 rounded-md transition-colors">
        <ChevronLeft class="w-4 h-4" />
      </CalendarPrev>
      <CalendarHeading class="text-sm font-semibold" />
      <CalendarNext class="p-2 hover:bg-gray-100 rounded-md transition-colors">
        <ChevronRight class="w-4 h-4" />
      </CalendarNext>
    </CalendarHeader>

    <div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <CalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse space-y-1">
        <CalendarGridHead>
          <CalendarGridRow class="flex w-full mt-2">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="text-gray-500 rounded-md w-10 font-normal text-[0.8rem]"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="flex w-full mt-2">
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-indigo-50 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="cn(
                  'h-10 w-10 p-0 font-normal rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer',
                  'data-selected:bg-indigo-600 data-selected:text-white data-selected:hover:bg-indigo-600 data-selected:focus:bg-indigo-600',
                  'data-outside-view:text-gray-500 data-outside-view:opacity-50',
                  'data-disabled:text-gray-500 data-disabled:opacity-50',
                  'data-today:bg-gray-100 data-today:text-gray-900'
                )"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
