<script setup lang="ts">
import { type BlockPiece, type Property } from '~/utils/blocks'

const { piece } = defineProps<{piece: BlockPiece<any>}>()
defineEmits(['changeSelection'])

</script>
<template>
  <div v-if="piece === '\n'" class="basis-full" />
  <p v-if="typeof piece === 'string'" draggable="false">
    {{ piece }}
  </p>
  <div v-else-if="isGroup(piece)" />
  <EditorSelectInput
    v-else-if="isSelectionPiece(piece)"
    :value="piece.value"
    :options="piece.options"
    :large-text="piece.largeLabels"
    :placeholder="piece.placeholder"
    @contextmenu.stop
    @changed="$emit('changeSelection', $event)"
  />
  <EditorExpressionSlot v-else :property="piece as Property" @contextmenu.stop />
</template>
