<script setup lang="ts">

import type {SelectOption} from '~/utils/blocks'

const {options, value, placeholder} = defineProps<{options: SelectOption[], value?: string, placeholder?: string}>()

defineEmits(['changed'])

const selected = ref<SelectOption | undefined>(value ? options.find(option => option.value === value) : undefined)

</script>

<template>
    <div @mousedown.stop>
        <USelectMenu :model-value="selected" @change="$emit('changed', $event)" :options="options"
                     :placeholder="placeholder" by="value" value-attribute="value" :popper="{placement: 'bottom-start'}" />
    </div>
</template>

<style scoped lang="scss">
</style>
