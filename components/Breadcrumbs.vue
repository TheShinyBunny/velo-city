<script setup lang="ts">
interface Page {
    link?: string
    label: string
}

const {pages} = defineProps<{pages: Page[]}>()
</script>
<template>
    <div class="breadcrumbs">
        <template v-for="(page, index) in pages">
            <NuxtLink :class="{'underline': page.link}" :to="page.link">{{ page.label }}</NuxtLink>
            <Icon v-if="index < pages.length - 1" name="bi:chevron-right" />
        </template>
    </div>
</template>
<style scoped lang="scss">
.breadcrumbs {
    @apply flex justify-start gap-2 items-center;
}
</style>
