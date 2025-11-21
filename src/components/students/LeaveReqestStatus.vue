<template>
  <div class="flex flex-wrap justify-center text-center gap-8 mb-6">
    <!-- Total -->
    <div
      class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-6 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-blue-500 shadow-[0px_4px_4px_#00000040]">
      <div class="font-normal text-blue text-base">Total Request</div>
      <div class="font-bold text-blue-500 text-xl">{{ stats.total }}</div>
    </div>

    <!-- Approved -->
    <div
      class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-6 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-green-500 shadow-[0px_4px_4px_#00000040]">
      <div class="font-normal text-blue text-base">Approved</div>
      <div class="font-bold text-green-500 text-xl">{{ stats.approved }}</div>
    </div>

    <!-- Rejected -->
    <div
      class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-6 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-red-500 shadow-[0px_4px_4px_#00000040]">
      <div class="font-normal text-blue text-base">Rejected</div>
      <div class="font-bold text-red-500 text-xl">{{ stats.rejected }}</div>
    </div>

    <!-- Pending -->
    <div
      class="flex flex-col w-[250px] items-center justify-center gap-2.5 px-[50px] py-6 bg-white rounded-[10px] max-sm:w-40 border-t-[3px] border-yellow-500 shadow-[0px_4px_4px_#00000040]">
      <div class="font-normal text-blue text-base">Pending</div>
      <div class="font-bold text-yellow-500 text-xl">{{ stats.pending }}</div>
    </div>
  </div>
</template>
 
<script setup> 
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

 