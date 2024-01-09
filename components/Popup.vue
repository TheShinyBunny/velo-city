<script setup lang="ts">
const {popupClass, isHover} = defineProps<{popupClass: string, isHover?: boolean}>()

const hovered = ref(false)

</script>

<template>
    <Popover v-slot="{ open }" class="relative inline-block" @mouseenter="hovered = true" @mouseleave="hovered = false">
        <PopoverButton>
            <slot name="button"></slot>
        </PopoverButton>
        <transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="translate-y-1 opacity-0"
                    enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="translate-y-0 opacity-100"
                    leave-to-class="translate-y-1 opacity-0">
            <PopoverPanel v-if="!isHover || hovered" class="absolute z-10 transform w-max" :class="popupClass" :static="isHover">
                <div class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 bg-white py-2 px-4">
                    <slot></slot>
                </div>
            </PopoverPanel>
        </transition>
    </Popover>
</template>

<style scoped lang="scss">

</style>
