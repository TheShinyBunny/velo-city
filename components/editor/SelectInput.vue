<script setup lang="ts">

import type {SelectOption} from '~/utils/blocks'

const {options, value, placeholder, largeText} = defineProps<{options: SelectOption[], value?: string, placeholder?: string, largeText?: boolean}>()

defineEmits(['changed'])

const selected = ref<SelectOption | undefined>(value ? options.find(option => option.value === value) : undefined)

</script>

<template>
    <div @mousedown.stop>
        <USelectMenu :model-value="selected" @change="$emit('changed', $event)" :options="options" :ui="{size: {xl: 'text-lg'}, padding: {xl: 'py-1'}}"
                     :size="largeText ? 'xl' : 'md'" :ui-menu="{option: {size: largeText ? 'text-lg' : 'text-sm'}, height: 'max-h-70'}"
                     :trailing-icon="largeText ? '' : 'i-heroicons-chevron-down-20-solid'" :placeholder="placeholder"
                     by="value" value-attribute="value" :popper="{placement: 'bottom-start'}" />
    </div>
</template>

<style scoped lang="scss">
</style>
