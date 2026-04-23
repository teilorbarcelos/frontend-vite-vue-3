import { cn } from '@/utils/cn';
import { defineComponent, h } from 'vue';

export const Table = defineComponent({
  name: 'Table',
  props: { class: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h('table', { class: cn('w-full caption-bottom text-sm', props.class) }, slots.default?.());
  }
});

export const TableHeader = defineComponent({
  name: 'TableHeader',
  props: { class: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h(
        'thead',
        {
          class: cn(
            'sticky top-0 z-10 bg-gray-50 shadow-[0_1px_0_0_rgba(229,231,235,1)]',
            props.class
          )
        },
        slots.default?.()
      );
  }
});

export const TableBody = defineComponent({
  name: 'TableBody',
  props: { class: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h(
        'tbody',
        { class: cn('[&_tr:last-child]:border-0 bg-white', props.class) },
        slots.default?.()
      );
  }
});

export const TableRow = defineComponent({
  name: 'TableRow',
  props: { class: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h(
        'tr',
        {
          class: cn(
            'border-b border-gray-200 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100',
            props.class
          )
        },
        slots.default?.()
      );
  }
});

export const TableHead = defineComponent({
  name: 'TableHead',
  props: { class: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h(
        'th',
        {
          class: cn(
            'h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0',
            props.class
          )
        },
        slots.default?.()
      );
  }
});

export const TableCell = defineComponent({
  name: 'TableCell',
  props: { class: { type: String, default: '' } },
  setup(props, { slots }) {
    return () =>
      h(
        'td',
        { class: cn('p-4 align-middle text-gray-900 [&:has([role=checkbox])]:pr-0', props.class) },
        slots.default?.()
      );
  }
});
