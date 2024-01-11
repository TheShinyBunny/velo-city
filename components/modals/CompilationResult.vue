<script setup lang="ts">
const {open, results} = defineProps<{open: boolean, results: string}>()
defineEmits(['update:open'])
</script>

<template>
    <UModal :model-value="open" @update:model-value="$emit('update:open', $event)" :ui="{strategy: 'override', width: 'sm:min-w-3xl'}">
        <UCard>
            <div class="flex justify-between">
                <h2 class="text-3xl mb-2">Your Code is Ready!</h2>
                <UButton color="black" variant="link" icon="i-mdi-close" @click="$emit('update:open', false)" />
            </div>
            <p>
                Paste the following code in your page's Velo Code section
                <UTooltip text="Show Me Where">
                    <UIcon class="cursor-pointer" name="i-mdi-help-circle-outline" />
                </UTooltip>
            </p>
            <pre class="border border-gray-400 rounded-md font-mono p-3 mt-3 h-80 overflow-auto">{{results}}</pre>
            <div class="centered-items mt-3">
                <UButton size="lg" color="black" @click="$emit('update:open', false)">Close</UButton>
            </div>
        </UCard>
    </UModal>
</template>

<style scoped lang="scss">

</style>
