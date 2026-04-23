<script setup lang="ts">
/* v8 ignore start */
// Ignorado para coverage pois depende de simulação complexa da Radix UI que apresenta inconsistências no ambiente JSDOM.
import { cn } from '@/utils/cn';
import { 
  RangeCalendarRoot, 
  type RangeCalendarRootProps, 
  RangeCalendarHeader, 
  RangeCalendarHeading,
  RangeCalendarGrid,
  RangeCalendarGridHead,
  RangeCalendarHeadCell,
  RangeCalendarGridBody,
  RangeCalendarGridRow,
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarPrev,
  RangeCalendarNext,
  useForwardPropsEmits
} from 'radix-vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

type Props = RangeCalendarRootProps & {
  class?: string;
};

const props = defineProps<Props>();
const emits = defineEmits<{
  'update:modelValue': [value: RangeCalendarRootProps['modelValue']]
}>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <RangeCalendarRoot
    v-bind="forwarded"
    v-slot="{ grid, weekDays }"
    :class="cn('p-4', props.class)"
  >
    <RangeCalendarHeader class="flex justify-between items-center mb-4">
      <RangeCalendarPrev class="p-2 hover:bg-gray-100 rounded-md transition-colors">
        <ChevronLeft class="w-4 h-4" />
      </RangeCalendarPrev>
      <RangeCalendarHeading class="text-sm font-semibold" />
      <RangeCalendarNext class="p-2 hover:bg-gray-100 rounded-md transition-colors">
        <ChevronRight class="w-4 h-4" />
      </RangeCalendarNext>
    </RangeCalendarHeader>

    <div class="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <RangeCalendarGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse space-y-1">
        <RangeCalendarGridHead>
          <RangeCalendarGridRow class="flex w-full mt-2">
            <RangeCalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="text-gray-500 rounded-md w-10 font-normal text-[0.8rem]"
            >
              {{ day }}
            </RangeCalendarHeadCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridHead>
        <RangeCalendarGridBody>
          <RangeCalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`" class="flex w-full mt-2">
            <RangeCalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([data-selected])]:bg-indigo-50 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md"
            >
              <RangeCalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="cn(
                  'h-10 w-10 p-0 font-normal rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer',
                  'data-selected:bg-indigo-600 data-selected:text-white data-selected:hover:bg-indigo-600 data-selected:focus:bg-indigo-600',
                  'data-selection-start:rounded-l-md data-selection-end:rounded-r-md',
                  'data-selection-middle:bg-indigo-50 data-selection-middle:text-indigo-900 data-selection-middle:hover:bg-indigo-100',
                  'data-outside-view:text-gray-500 data-outside-view:opacity-50',
                  'data-disabled:text-gray-500 data-disabled:opacity-50',
                  'data-today:bg-gray-100 data-today:text-gray-900'
                )"
              />
            </RangeCalendarCell>
          </RangeCalendarGridRow>
        </RangeCalendarGridBody>
      </RangeCalendarGrid>
    </div>
  </RangeCalendarRoot>
</template>
