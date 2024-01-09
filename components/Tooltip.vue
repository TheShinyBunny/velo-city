<script setup lang="ts">
const {text} = defineProps<{text: string}>()
</script>

<template>
    <Popup popup-class="-left-1/2" :is-hover="true">
        <template v-slot:button><slot></slot></template>
        <p>{{text}}</p>
    </Popup>
</template>

<style scoped lang="scss">

</style>
