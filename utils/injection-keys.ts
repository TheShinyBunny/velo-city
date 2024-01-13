import type { InjectionKey } from 'vue'
import type { Block, BlockGroup } from '~/utils/blocks'

export const projectActions = Symbol() as InjectionKey<{
    markModified: () => void,
    saveProject: () => void,
    duplicateDragged: () => void
}>

export const isInsideTemplate = Symbol() as InjectionKey<boolean>

export const parentGroup = Symbol() as InjectionKey<BlockGroup>

export const currentBlock = Symbol() as InjectionKey<{
    get: () => Block
    set: (block: Block) => void
}>
