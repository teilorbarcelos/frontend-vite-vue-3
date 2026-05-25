<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TimeSeriesStat } from '../services/dashboard.service';
import { useElementSize } from '../hooks/useElementSize';

const props = defineProps<{
  data: TimeSeriesStat[];
}>();

const containerRef = ref<HTMLElement | null>(null);
const { width, height } = useElementSize(containerRef);

const formatDateLabel = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formattedData = computed(() => {
  return props.data.map((item) => ({
    ...item,
    formattedDate: formatDateLabel(item.date)
  }));
});

// Chart geometry
const padding = { top: 20, right: 20, bottom: 60, left: 40 };

const chartWidth = computed(() => width.value - padding.left - padding.right);
const chartHeight = computed(() => height.value - padding.top - padding.bottom);

const maxValue = computed(() => {
  const max = Math.max(...props.data.map((d) => d.count), 0);
  return max === 0 ? 10 : Math.ceil(max * 1.15); // Add some padding on top
});

// Simple helper to format ticks
const yTicks = computed(() => {
  const max = maxValue.value;
  return [0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max];
});

const bars = computed(() => {
  if (formattedData.value.length === 0) return [];
  const count = formattedData.value.length;
  const spacing = chartWidth.value / count;
  const barWidth = Math.max(2, spacing * 0.6);

  return formattedData.value.map((item, index) => {
    const x = padding.left + index * spacing + (spacing - barWidth) / 2;
    const barHeight = (item.count / maxValue.value) * chartHeight.value;
    const y = padding.top + chartHeight.value - barHeight;

    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      item,
      index
    };
  });
});

// Tooltip state
const activeIndex = ref<number | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const handleMouseMove = (event: MouseEvent, index: number): void => {
  const parentRect = (event.currentTarget as SVGElement).parentElement?.getBoundingClientRect();
  if (parentRect) {
    tooltipPosition.value = {
      x: event.clientX - parentRect.left + 10,
      y: event.clientY - parentRect.top - 40
    };
  }
  activeIndex.value = index;
};

const handleMouseLeave = (): void => {
  activeIndex.value = null;
};
</script>

<template>
  <div class="col-span-full rounded-xl border border-gray-200 bg-white shadow-sm relative">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="font-semibold text-gray-900 leading-none tracking-tight">Criação de Produtos</h3>
      <p class="text-sm text-gray-500">Volume de produtos cadastrados por dia.</p>
    </div>
    <div class="p-6 pt-0">
      <div ref="containerRef" class="h-[300px] w-full relative">
        <svg
          :viewBox="`0 0 ${width} ${height}`"
          width="100%"
          height="100%"
          class="overflow-visible select-none"
        >
          <!-- Grid lines -->
          <line
            v-for="tick in yTicks"
            :key="`grid-${tick}`"
            :x1="padding.left"
            :y1="padding.top + chartHeight - (tick / maxValue) * chartHeight"
            :x2="width - padding.right"
            :y2="padding.top + chartHeight - (tick / maxValue) * chartHeight"
            stroke="#f0f0f0"
            stroke-dasharray="3 3"
          />

          <!-- Y Axis Labels -->
          <text
            v-for="tick in yTicks"
            :key="`y-label-${tick}`"
            :x="padding.left - 8"
            :y="padding.top + chartHeight - (tick / maxValue) * chartHeight + 4"
            text-anchor="end"
            class="text-[10px] fill-gray-500 font-sans"
          >
            {{ tick }}
          </text>

          <!-- X Axis Labels -->
          <g v-for="(bar, index) in bars" :key="`x-label-${index}`">
            <text
              :x="bar.x + bar.width / 2"
              :y="padding.top + chartHeight + 15"
              text-anchor="end"
              :transform="`rotate(-45, ${bar.x + bar.width / 2}, ${padding.top + chartHeight + 15})`"
              class="text-[10px] fill-gray-500 font-sans"
            >
              {{ bar.item.formattedDate }}
            </text>
          </g>

          <!-- Bars -->
          <rect
            v-for="bar in bars"
            :key="`bar-${bar.index}`"
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="Math.max(1, bar.height)"
            fill="#6366f1"
            rx="4"
            ry="4"
            class="transition-all duration-300 cursor-pointer hover:fill-indigo-700"
            @mousemove="handleMouseMove($event, bar.index)"
            @mouseleave="handleMouseLeave"
          />
        </svg>

        <!-- Tooltip overlay -->
        <div
          v-if="activeIndex !== null && formattedData[activeIndex]"
          class="absolute z-10 p-2 bg-white border border-gray-200 rounded-lg shadow-md text-xs pointer-events-none"
          :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }"
        >
          <p class="font-semibold text-gray-900">{{ formattedData[activeIndex].formattedDate }}</p>
          <p class="text-indigo-600">Quant: {{ formattedData[activeIndex].count }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
