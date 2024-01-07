<script setup lang="ts">
const {open} = defineProps<{open: boolean}>()
defineEmits(['update:open'])

</script>
<template>
    <TransitionRoot appear :show="open" as="template">
        <Dialog as="div" @close="$emit('update:open', false)" class="relative z-10">
            <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
                leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black bg-opacity-25" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-y-auto">
                <div class="modal-wrapper">
                    <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel class="modal-content">
                            <slot />
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
<style scoped lang="scss">

.modal-wrapper {
    @apply flex min-h-full items-center justify-center p-4 text-center;
}

.modal-content {
    @apply w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all;
}
</style>