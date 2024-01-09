<script setup lang="ts">
const {open, results} = defineProps<{open: boolean, results: string}>()
defineEmits(['update:open'])
</script>

<template>
    <Modal class="modal-lg" :open="open" @update:open="$emit('update:open', $event)">
        <h2 class="text-2xl text-center">Your Code is Ready!</h2>
        <p>
            Paste the following code in your Page's Code section
            <Tooltip text="Show Me Where">
                <Icon class="cursor-pointer text-primary" name="mdi:help-circle-outline" />
            </Tooltip>
        </p>
        <pre class="border border-gray-400 rounded-md font-mono p-3 mt-3 h-80 overflow-auto">{{results}}</pre>
        <div class="centered-items">
            <button class="btn btn-secondary" @click="$emit('update:open', false)">Close</button>
        </div>
    </Modal>
</template>

<style scoped lang="scss">

</style>
