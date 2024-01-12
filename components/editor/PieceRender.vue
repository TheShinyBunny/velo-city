<script setup lang="ts">
import {type BlockPiece, type Property} from '~/utils/blocks'
const {piece} = defineProps<{piece: BlockPiece<any>}>()
defineEmits(['changeSelection'])

</script>
<template>
    <div v-if="piece === '\n'" class="basis-full"></div>
    <p v-if="typeof piece === 'string'" draggable="false">{{ piece }}</p>
    <div v-else-if="isGroup(piece)"></div>
    <EditorSelectInput v-else-if="isSelectionPiece(piece)" :value="piece.value" :options="piece.options" :large-text="piece.largeLabels"
                       @changed="$emit('changeSelection', $event)" :placeholder="piece.placeholder" />
    <EditorExpressionSlot v-else :property="piece as Property" />
</template>
