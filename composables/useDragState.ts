import type { BlockGroup } from '~/utils/blocks'

interface DragState {
    draggedBlocks?: BlockGroup
    offsetX?: number
    offsetY?: number
}

export default function() {
  return useState<DragState>('dragState', () => ({}))
}
