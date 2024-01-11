<script setup lang="ts">
import type {BlockAction} from '~/utils/blocks'
import type {DropdownItem} from '#ui/types'
import type {Ref} from 'vue'

const {actions} = defineProps<{actions: BlockAction<any>[]}>()
const emit = defineEmits(['runAction'])

const items: Ref<DropdownItem[][]> = computed(() => [actions.map(action => ({
    label: action.label,
    click: () => {
        emit('runAction', action)
    }
}))])

</script>

<template>
    <UDropdown :items="items" :popper="{placement: 'bottom-start'}" class="absolute top-1 right-1">
        <UButton :padded="false" variant="soft" color="black" icon="i-mdi-dots-vertical" :ui="{rounded: 'rounded-full'}" />
    </UDropdown>
</template>

<style scoped lang="scss">

</style>
