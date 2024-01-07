<script setup lang="ts">
const categories = getCategories()
const openCategory = ref(-1)
const dragState = useDragState()

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
        <EditorBlockCategory v-for="(cat, index) in categories" :category="cat"
            :isOpen="index === openCategory" @selected="toggleCategory(index)" />
    </div>
</template>
<style scoped lang="scss">
.palette {
    @apply w-80 bg-gray-100 shadow-md border-r border-gray-200 overflow-auto;
}
</style>
