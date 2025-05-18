<template>
    <!-- <n-scrollbar class="w-full h-full" :style><slot /> </n-scrollbar> -->
    <div class="w-full h-full" :style><slot /></div>
</template>

<script setup>
    const style = { background: window.DARK?"#101014":"inherit", overflowY:'auto' }
</script>
