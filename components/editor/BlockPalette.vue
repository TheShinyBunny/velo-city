<script setup lang="ts">
const categories = getCategories()
const dragState = useDragState()

function cancelDragging() {
  if (dragState.value.draggedBlocks) {
    dragState.value = {}
  }
}

</script>
<template>
  <div class="palette" @mouseup.left="cancelDragging()">
    <UAccordion :items="categories">
      <template #item="{item}">
        <EditorBlockCategory :category="item" />
      </template>
    </UAccordion>
  </div>
</template>
<style scoped lang="scss">
.palette {
    @apply w-80 bg-gray-100 shadow-md border-r border-gray-200 overflow-auto;
}
</style>
