<script setup lang="ts">
const {size, color, type} = defineProps({
    size: {type: Number, required: true},
    color: {type: String, default: 'blue-500'},
    type: {type: String, default: 'ease'}
})
</script>
<template>
    <div class="grid place-items-center h-full">
        <div class="spinner" :style="{width: `${size}rem`, height: `${size}rem`, borderWidth: `${size * 2}px`}"
             :class="[`border-${color}`, type]"></div>
    </div>
</template>
<style scoped lang="scss">

.spinner {
    @apply border-t-transparent rounded-full;
    animation: rotate 1s ease-in-out infinite;

    &.ease {
        animation-timing-function: ease-in-out;
    }

    &.linear {
        animation-timing-function: linear;
    }
}

@keyframes rotate {
    from {transform: rotate(0deg)}
    to {transform: rotate(360deg)}
}
</style>
