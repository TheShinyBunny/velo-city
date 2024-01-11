<script setup lang="ts">
import type {Ref} from 'vue'
import type {AccordionItem} from '#ui/types'

const categories = getCategories()
const openCategory = ref(-1)
const dragState = useDragState()

const accordionItems: Ref<AccordionItem[]> = computed(() => categories.map((category): AccordionItem => ({
    label: category.name
})))

function toggleCategory(index: number) {
    openCategory.value = openCategory.value === index ? -1 : index
}

function cancelDragging() {
    if (dragState.value.draggedBlocks) {
        dragState.value = {}
    }
}

</script>
<template>
    <div class="palette" @mouseup.left="cancelDragging()">
<!--        <EditorBlockCategory v-for="(cat, index) in categories" :category="cat"-->
<!--            :isOpen="index === openCategory" @selected="toggleCategory(index)" />-->
        <UAccordion :items="accordionItems">
            <template #item="{index, item}">
                <EditorBlockCategory :category="categories[index]" />
            </template>
        </UAccordion>
    </div>
</template>
<style scoped lang="scss">
.palette {
    @apply w-80 bg-gray-100 shadow-md border-r border-gray-200 overflow-auto;
}
</style>
