<script setup lang="ts">
import type {BlockAction} from '~/utils/blocks'

const {actions} = defineProps<{actions: BlockAction<any>[]}>()
defineEmits(['runAction'])

</script>

<template>
    <Menu as="div" class="relative">
        <MenuButton class="menu-button-round">
            <Icon name="mdi:dots-vertical" />
        </MenuButton>
        <Transition enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0">
            <MenuItems class="menu-items right">
                <div class="p-1">
                    <MenuItem v-for="action in actions" v-slot="{ active }">
                        <button :class="[active && 'menu-item-active', 'group menu-item']" @click="$emit('runAction', action)">
                            {{action.label}}
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </Transition>
    </Menu>
</template>

<style scoped lang="scss">

</style>
