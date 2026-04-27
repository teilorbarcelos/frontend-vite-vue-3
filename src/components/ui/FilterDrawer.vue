<script setup lang="ts">
import { ref, watch } from 'vue';
import { formatDateRange } from '@/utils/validation';
import type { DateRange } from '@/lib/types';
import { parseISO } from 'date-fns';
import { Filter } from 'lucide-vue-next';
import Button from './Button.vue';
import DateRangePicker from './DateRangePicker.vue';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from './Drawer';
import Input from './Input.vue';

interface VModelDate {
  from?: Date | undefined;
  to?: Date | undefined;
}

interface VModel extends VModelDate {
  values: Record<string, unknown>;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'text' | 'number';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
}

interface Props {
  isOpen: boolean;
  fields: FilterField[];
  initialValues?: Record<string, unknown>;
}

const props = withDefaults(defineProps<Props>(), {
  initialValues: () => ({})
});

const emit = defineEmits(['close', 'filter']);

const formValues = ref<Record<string, VModel>>({});

const initForm = (): void => {
  const values: Record<string, unknown> = { ...props.initialValues };

  props.fields.forEach((field) => {
    if (field.type === 'dateRange') {
      const start = props.initialValues?.[`${field.name}_start`];
      const end = props.initialValues?.[`${field.name}_end`];

      if (start || end) {
        values[field.name] = {
          from: start ? parseISO(start as string) : undefined,
          to: end ? parseISO(end as string) : undefined
        };
      }
    } else if (
      field.type === 'select' &&
      (values[field.name] === undefined || values[field.name] === null)
    ) {
      values[field.name] = '';
    }
  });

  formValues.value = values as Record<string, VModel>;
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) initForm();
  },
  { immediate: true }
);

const onSubmit = (): void => {
  const data = { ...formValues.value };
  const formattedData: Record<string, unknown> = { ...data };

  props.fields.forEach((field) => {
    if (field.type === 'dateRange' && data[field.name]) {
      const range = data[field.name] as DateRange | undefined;
      delete formattedData[field.name];

      if (range?.from) {
        const dates = formatDateRange(field.name, range.from, range.to);
        Object.assign(formattedData, dates);
      }
    }
  });

  const cleanData = Object.fromEntries(
    Object.entries(formattedData).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  );

  emit('filter', cleanData);
  emit('close');
};

const handleReset = (): void => {
  emit('filter', {});
  emit('close');
};

const handleOpenChange = (open: boolean): void => {
  if (!open) emit('close');
};
</script>

<template>
  <Drawer :open="isOpen" @update:open="handleOpenChange">
    <DrawerContent>
      <DrawerHeader>
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-indigo-600" />
          <DrawerTitle>Filtros Avançados</DrawerTitle>
        </div>
      </DrawerHeader>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <div v-for="field in fields" :key="field.name" class="space-y-2">
            <label :for="field.name" class="text-sm font-medium text-gray-700">
              {{ field.label }}
            </label>

            <DateRangePicker
              v-if="field.type === 'dateRange'"
              :id="field.name"
              v-model="formValues[field.name]"
            />

            <select
              v-else-if="field.type === 'select'"
              :id="field.name"
              v-model="formValues[field.name]"
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
            >
              <option value="">Todos</option>
              <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>

            <Input
              v-else
              :id="field.name"
              :type="field.type"
              :placeholder="field.placeholder"
              v-model="formValues[field.name] as unknown as string | number | undefined"
            />
          </div>
        </div>
      </div>

      <DrawerFooter>
        <Button variant="secondary" @click="handleReset" class="flex-1"> Limpar </Button>
        <Button @click="onSubmit" class="flex-1"> Aplicar </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
