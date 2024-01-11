<script setup lang="ts">
const {open, results} = defineProps<{open: boolean, results: string}>()
defineEmits(['update:open'])

const copied = ref(false)

function copyCode() {
    copied.value = true
    navigator.clipboard.writeText(results)
    setTimeout(() => {
        copied.value = false
    }, 1500)
}

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
            <ClientOnly>
                <highlightjs class="border border-gray-400 rounded-md mt-3 h-96 overflow-auto" language="javascript" :code="results"/>
            </ClientOnly>
            <div class="centered-items mt-3">
                <UButton size="lg" color="primary" @click="copyCode()" :disabled="copied" :icon="copied ? 'i-mdi-check' : 'i-mdi-clipboard-outline'">
                    {{copied ? 'Copied!' : 'Copy Code'}}
                </UButton>
                <UButton size="lg" color="black" @click="$emit('update:open', false)">Close</UButton>
            </div>
        </UCard>
    </UModal>
</template>

<style scoped lang="scss">

</style>
