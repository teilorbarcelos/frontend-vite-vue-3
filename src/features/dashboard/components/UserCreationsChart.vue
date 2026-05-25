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

const points = computed(() => {
  if (formattedData.value.length === 0) return [];
  const count = formattedData.value.length;
  const spacing = chartWidth.value / (count > 1 ? count - 1 : 1);

  return formattedData.value.map((item, index) => {
    const x = padding.left + index * spacing;
    const y = padding.top + chartHeight.value - (item.count / maxValue.value) * chartHeight.value;
    return { x, y, item, index };
  });
});

// Line path
const linePath = computed(() => {
  if (points.value.length === 0) return '';
  return points.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
});

// Fill path (polygon closed at the bottom)
const fillPath = computed(() => {
  if (points.value.length === 0) return '';
  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  return `${linePath.value} L ${last.x} ${padding.top + chartHeight.value} L ${first.x} ${padding.top + chartHeight.value} Z`;
});

// Tooltip state
const activeIndex = ref<number | null>(null);
const tooltipPosition = ref({ x: 0, y: 0 });

const handleMouseMove = (event: MouseEvent): void => {
  if (points.value.length === 0) return;
  const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
  const mouseX = event.clientX - rect.left;

  // Convert mouseX to SVG coordinate space
  const svgX = (mouseX / rect.width) * width.value;

  // Find closest point by X coordinate
  let closestIndex = 0;
  let minDiff = Infinity;

  points.value.forEach((p, idx) => {
    const diff = Math.abs(p.x - svgX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = idx;
    }
  });

  const activePoint = points.value[closestIndex];

  // Position tooltip relative to container
  const parentRect = (event.currentTarget as SVGElement).parentElement?.getBoundingClientRect();
  if (parentRect) {
    const scaleX = rect.width / width.value;
    const scaleY = rect.height / height.value;

    tooltipPosition.value = {
      x: activePoint.x * scaleX + 10,
      y: activePoint.y * scaleY - 40
    };
  }

  activeIndex.value = closestIndex;
};

const handleMouseLeave = (): void => {
  activeIndex.value = null;
};
</script>

<template>
  <div class="col-span-4 rounded-xl border border-gray-200 bg-white shadow-sm relative">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="font-semibold text-gray-900 leading-none tracking-tight">Criação de Usuários</h3>
      <p class="text-sm text-gray-500">Evolução diária de registros no período.</p>
    </div>
    <div class="p-6 pt-0">
      <div ref="containerRef" class="h-[300px] w-full relative">
        <svg
          :viewBox="`0 0 ${width} ${height}`"
          width="100%"
          height="100%"
          class="overflow-visible select-none"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <defs>
            <linearGradient id="colorUsersVue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stop-color="#4f46e5" stop-opacity="0.2" />
              <stop offset="95%" stop-color="#4f46e5" stop-opacity="0" />
            </linearGradient>
          </defs>

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
          <text
            v-for="p in points"
            :key="`x-label-${p.index}`"
            :x="p.x"
            :y="padding.top + chartHeight + 15"
            text-anchor="end"
            :transform="`rotate(-45, ${p.x}, ${padding.top + chartHeight + 15})`"
            class="text-[10px] fill-gray-500 font-sans"
          >
            {{ p.item.formattedDate }}
          </text>

          <!-- Fill Area -->
          <path
            v-if="fillPath"
            :d="fillPath"
            fill="url(#colorUsersVue)"
            class="transition-all duration-300"
          />

          <!-- Stroke Line -->
          <path
            v-if="linePath"
            :d="linePath"
            fill="none"
            stroke="#4f46e5"
            stroke-width="2"
            class="transition-all duration-300"
          />

          <!-- Data Points / Dots -->
          <circle
            v-for="p in points"
            :key="`dot-${p.index}`"
            :cx="p.x"
            :cy="p.y"
            :r="activeIndex === p.index ? 6 : 4"
            :fill="activeIndex === p.index ? '#4f46e5' : '#ffffff'"
            stroke="#4f46e5"
            stroke-width="2"
            class="transition-all duration-150"
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
