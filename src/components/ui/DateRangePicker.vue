<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";
import { RangeCalendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/utils/cn";
import { CalendarDate, type DateValue } from '@internationalized/date';

interface Props {
  class?: string;
  modelValue?: { from?: Date; to?: Date };
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecione um período",
});

const emit = defineEmits(['update:modelValue']);

const toCalendarDate = (date?: Date) => {
  if (!date) return undefined;
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

const toDate = (dateValue?: DateValue) => {
  if (!dateValue) return undefined;
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day);
};

const internalValue = ref<any>(
  props.modelValue?.from ? {
    start: toCalendarDate(props.modelValue.from),
    ...(props.modelValue.to ? { end: toCalendarDate(props.modelValue.to) } : {})
  } : undefined
);

watch(() => props.modelValue, (newVal) => {
  if (!newVal?.from) {
    internalValue.value = undefined;
    return;
  }
  
  internalValue.value = {
    start: toCalendarDate(newVal.from),
    ...(newVal.to ? { end: toCalendarDate(newVal.to) } : {})
  };
}, { deep: true });

const handleUpdate = (val: any) => {
  const from = toDate(val?.start);
  const to = toDate(val?.end);
  
  emit('update:modelValue', {
    from,
    to: to || from,
  });
};

const formattedDate = computed(() => {
  if (!props.modelValue?.from) return props.placeholder;
  
  const fromStr = format(props.modelValue.from, "dd/MM/yyyy", { locale: ptBR });
  if (!props.modelValue.to) return fromStr;
  
  const toStr = format(props.modelValue.to, "dd/MM/yyyy", { locale: ptBR });
  return `${fromStr} - ${toStr}`;
});
</script>

<template>
  <div :class="cn('grid gap-2', props.class)">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="cn(
            'w-full justify-start text-left font-normal h-10 border-gray-200 rounded-xl px-3',
            !modelValue?.from && 'text-gray-500'
          )"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          <span>{{ formattedDate }}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0 rounded-xl overflow-hidden" align="start">
        <RangeCalendar
          v-model="internalValue"
          @update:model-value="handleUpdate"
          initial-focus
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
