import type {BlockGroup} from '~/utils/blocks'

export default function () {
    return useState<DragState>('dragState', () => ({}))
}

interface DragState {
    draggedBlocks?: BlockGroup
    offsetX?: number
    offsetY?: number
}
