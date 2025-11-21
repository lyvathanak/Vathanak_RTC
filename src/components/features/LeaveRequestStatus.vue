<template>
  <div class="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 wrapper">
    <!-- Pending -->
    <div class="rounded-lg sm:rounded-xl border-t-4 border-[#FF7700] bg-white shadow-lg p-3 sm:p-4 text-center">
      <div class="text-lg sm:text-xl lg:text-2xl font-bold text-[#FF7700]">{{ pending }}</div>
      <div class="text-gray-700 mt-1 text-xs sm:text-sm">Pending</div>
    </div>

    <!-- Approved -->
    <div class="rounded-lg sm:rounded-xl border-t-4 border-[#10B981] bg-white shadow-lg p-3 sm:p-4 text-center">
      <div class="text-lg sm:text-xl lg:text-2xl font-bold text-[#10B981]">{{ approved }}</div>
      <div class="text-gray-700 mt-1 text-xs sm:text-sm">Approved</div>
    </div>

    <!-- Rejected -->
    <div class="rounded-lg sm:rounded-xl border-t-4 border-[#FF4040] bg-white shadow-lg p-3 sm:p-4 text-center">
      <div class="text-lg sm:text-xl lg:text-2xl font-bold text-[#FF4040]">{{ rejected }}</div>
      <div class="text-gray-700 mt-1 text-xs sm:text-sm">Rejected</div>
    </div>

    <!-- Total -->
    <div class="rounded-lg sm:rounded-xl border-t-4 border-[#235AA6] bg-white shadow-lg p-3 sm:p-4 text-center">
      <div class="text-lg sm:text-xl lg:text-2xl font-bold text-[#235AA6]">{{ total }}</div>
      <div class="text-gray-700 mt-1 text-xs sm:text-sm">Total Request</div>
    </div>
  </div>
</template>


<script setup>
defineProps({
	pending: { type: Number, default: 0 },
	approved: { type: Number, default: 0 },
	rejected: { type: Number, default: 0 },
	total: { type: Number, default: 0 }
});
</script>
