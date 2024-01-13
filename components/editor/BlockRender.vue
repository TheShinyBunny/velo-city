<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import type { Block, BlockGroup, BlockPiece } from '~/utils/blocks'
import { currentBlock, isInsideTemplate } from '~/utils/injection-keys'

const props = defineProps<{block: Block}>()
const isTemplate = inject(isInsideTemplate, false)
const emit = defineEmits(['startDragging', 'attachChanged', 'updateBlock'])

let type = await getBlockType(props.block)
const groups = ref<BlockPiece<any>[][]>([])
const renderedBlock = ref<Block>(props.block)
provide(currentBlock, {
  get: () => renderedBlock.value,
  set: (newBlock: Block) => emit('updateBlock', newBlock)
})

onMounted(() => {
  updateRender()
})

watch(() => props.block, () => {
  updateRender()
})

async function updateRender() {
  if (!type) {
    type = await getType('error')
    renderedBlock.value = { type: 'error', data: 'Unknown Block Type ' + props.block.type } as Block
  }

  const rendered = type.render(renderedBlock.value.data)
  const groupsBuilder: BlockPiece<any>[][] = [[]]
  for (const p of rendered) {
    if (!p) {
      if (renderedBlock.value.type !== 'error') {
        type = await getType('error')
        renderedBlock.value = { type: 'error', data: 'Error loading ' + props.block.type } as Block
        await updateRender()
      }
      return
    }
    if (isGroup(p)) {
      groupsBuilder.push([p])
    } else {
      let last = groupsBuilder.at(-1)!
      if (last.length && isGroup(last[0])) {
        last = []
        groupsBuilder.push(last)
      }
      last.push(p)
    }
  }
  groups.value = groupsBuilder
}

function updateGroup(index: number, newGroup: BlockGroup) {
  const group = groups.value[index]
  if (isGroup(group[0])) {
    (group[0] as BlockGroup).blocks = newGroup.blocks
  }
}

const dragState = useDragState()
const mousePos = useMouse({ type: 'page' })

const blockElement = ref<HTMLElement>()

const epsilon = 12
function isBlockEdgeAround(isBottom: boolean) {
  if (!dragState.value.draggedBlocks) { return false }
  if (!blockElement.value) { return false }
  const rect = blockElement.value!.getBoundingClientRect()
  const offsetY = isBottom ? rect.bottom : rect.top
  return isBetween(offsetY - epsilon, mousePos.y.value - dragState.value.offsetY!, offsetY + epsilon) &&
        isBetween(rect.left, mousePos.x.value - dragState.value.offsetX!, rect.right)
}

function isBetween(min: number, value: number, max: number) {
  return min <= value && max >= value
}

const canAttachTop = computed(() => !isTemplate && canConnectTop(type) && isBlockEdgeAround(false))
const canAttachBottom = computed(() => !isTemplate && canConnectBottom(type) && isBlockEdgeAround(true))

watch([canAttachTop, canAttachBottom], e => emit('attachChanged', e))

</script>
<template>
  <div ref="blockElement" class="block-wrapper" draggable="false">
    <EditorPieceGroup
      v-for="(group, index) in groups"
      :block="block"
      :type="type"
      :pieces="group"
      :is-first="index === 0"
      :is-last="index === groups.length - 1"
      @update-block="$emit('updateBlock', $event)"
      @start-dragging="$emit('startDragging', $event)"
      @group-changed="updateGroup(index, $event)"
    />
    <div v-if="canAttachTop" class="drop-zone above" />
    <div v-if="canAttachBottom" class="drop-zone below" />
  </div>
</template>
<style scoped lang="scss">
.block-wrapper {
    @apply relative pointer-events-none;
}

</style>
