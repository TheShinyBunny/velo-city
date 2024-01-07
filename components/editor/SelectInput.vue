<script setup lang="ts">

import type {SelectOption} from '~/utils/blocks'

const {options, value, placeholder} = defineProps<{options: SelectOption[], value?: string, placeholder?: string}>()

defineEmits(['changed'])

const selected = ref<SelectOption | undefined>(value ? options.find(option => option.value === value) : undefined)

</script>

<template>
    <Listbox v-model="selected" @update:model-value="$emit('changed', $event.value)" class="min-w-20" v-slot="{ open }">
        <div class="relative">
            <ListboxButton class="select-button">
                <span :class="[selected ? 'text-black' : 'text-gray-400']">{{ selected ? selected.label : placeholder }}</span>
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <Icon :name="open ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                        class="h-5 w-5 text-gray-400"/>
                </span>
            </ListboxButton>
            <transition
                enter-active-class="transition duration-100 ease-out origin-top-left"
                enter-from-class="transform scale-0 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-out origin-top-left"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-0 opacity-0">
                <ListboxOptions class="select-dropdown">
                    <ListboxOption
                        v-slot="{ active, selected }"
                        v-for="option in options"
                        :key="option.value"
                        :disabled="option.disabled || false"
                        :value="option" as="template">
                        <li :class="['select-option', option.disabled ? 'bg-gray-300 !cursor-default' :  selected ? 'bg-blue-300 bg-opacity-50 text-gray-800' : active ? 'bg-gray-100 text-gray-900' : 'text-gray-700']">
                            <span :class="[selected ? 'font-medium' : 'font-normal','block truncate',]">{{ option.label }}</span>
                        </li>
                    </ListboxOption>
                </ListboxOptions>
            </transition>
        </div>
    </Listbox>
</template>

<style scoped lang="scss">
.select-button {
    @apply relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 shadow-md focus:outline-none
    focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2
    focus-visible:ring-offset-orange-300 sm:text-sm;
}

.select-dropdown {
    @apply absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1
    ring-black/5 focus:outline-none sm:text-sm;
}

.select-option {
    @apply relative cursor-pointer select-none py-2 pl-3 pr-4;
}
</style>
