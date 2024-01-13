<script setup lang="ts">
import type {Block, Property, SelectOption, SlotAttachment} from '~/utils/blocks'
import {type NumberType} from '~/utils/types'
import {useMouse} from '@vueuse/core'

const {property} = defineProps<{property: Property}>()
const isTemplate = inject('isTemplate', false)
const currentBlock: { get: () => Block, set: (block: Block) => void } = inject('currentBlock')!
const stringVal = ref<string>('')
const isLiteral = ref(false)
const isStringLike = ref(false)
const singleType = asSingleType(property.type)
const typeKey = getTypeKey(singleType)
const placeholder = ref<HTMLElement>()
const tooltip = ref('')

onMounted(() => {
    if (property.value?.type === 'literal') {
        isLiteral.value = true
        stringVal.value = property.value.data.value
    }
    if (stringTypes.includes(typeKey)) {
        isStringLike.value = true
    }
})

const dragState = useDragState()
const mousePos = useMouse({type: 'page'})
const attach = useAttachTarget()

const {markModified}: {markModified: () => void} = inject('projectActions')!

const booleanOptions: SelectOption[] = [
    {
        label: 'True',
        value: 'true'
    },
    {
        label: 'False',
        value: 'false'
    }
]

function setPropertyValue(value: string) {
    stringVal.value = value
    if (!property.value) {
        isLiteral.value = true
        property.value = {type: 'literal', data: {value}} as Block
    } else if (value.length > 0) {
        property.value.data.value = value
    } else {
        isLiteral.value = false
        delete property.value
    }
    markModified()
}

function startDragging(event: MouseEvent) {
    let rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dragState.value = {
        draggedBlocks: {blocks: [property.value!]},
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
    }
    const block = property.value!
    delete property.value
    if (property.onAttachedBlockChange) {
        currentBlock.set(property.onAttachedBlockChange(property, currentBlock.get(), block))
    }
}

function isDraggingNearSlot() {
    if (!dragState.value.draggedBlocks) return false
    if (!placeholder.value) return false
    if (dragState.value.draggedBlocks.blocks.length > 1) return false
    if (!isExpression(getBlockTypeNow(dragState.value.draggedBlocks.blocks![0])!)) return false
    const rect = placeholder.value!.getBoundingClientRect();
    const isNear = isBetween(rect.top, mousePos.y.value - dragState.value.offsetY!, rect.bottom)
        && isBetween(rect.left, mousePos.x.value - dragState.value.offsetX!, rect.right)
    tooltip.value = ''
    if (!isNear) return false
    if (property.canAttachBlock) {
        const message = property.canAttachBlock(property, dragState.value.draggedBlocks!.blocks[0])
        if (message) {
            tooltip.value = message
            return false
        }
    } else if (typeKey !== 'any') {
        const resultType = getResultType(dragState.value.draggedBlocks!.blocks[0])
        if (!canAssignTypes(resultType, property.type)) {
            tooltip.value = 'A block that returns ' + getTypeName(resultType) + ' cannot be inserted to a slot accepting ' + getTypeName(property.type)
            return false
        }
    }
    tooltip.value = ''
    return true
}

function isBetween(min: number, value: number, max: number) {
    return min <= value && max >= value;
}

const canAttach = computed(() => !isTemplate && (!property.value || property.value.type === 'literal') && isDraggingNearSlot())

let lastAttachment: SlotAttachment

watch(canAttach, (state) => {
    if (state) {
        lastAttachment = {
            type: 'slot',
            property,
            parent: currentBlock.get(),
            updateParent: (newParent) => currentBlock.set(newParent)
        }
        attach.value = lastAttachment
    } else if (attach.value && lastAttachment && lastAttachment.property == (attach.value as SlotAttachment).property) {
        attach.value = undefined
    }
})

function updateBlockInSlot(newBlock: Block) {
    property.value = newBlock
    markModified()
}

function validateInput(event: InputEvent) {
    const element = event.target as HTMLElement
    if (typeKey === 'number') {
        if (!element.innerText.match(/^-?(\d*\.)?\d*$/)) {
            if (!(singleType as NumberType).integer || element.innerText.match(/\./g)) {
                element.innerText = stringVal.value
                return
            }
        }
    }
    setPropertyValue(element.innerText)
}

</script>
<template>
    <EditorBlockRender v-if="property.value && !isLiteral" :block="property.value!" @start-dragging="startDragging($event)"
                       @update-block="updateBlockInSlot($event)" />
    <UPopover v-else :open="!!tooltip.length" :popper="{placement: 'top'}" :ui="{container: tooltip.length ? '' : 'hidden'}">
        <span ref="placeholder" class="relative input-container" :class="{'cursor-text': isStringLike}" @click.stop @mousedown.left.stop @contextmenu.stop>
            <EditorSelectInput v-if="property.type === 'boolean'" :value="stringVal || 'true'" :options="booleanOptions"
                               @changed="setPropertyValue($event)" />
            <EditorSelectInput v-else-if="typeKey === 'enum'" :value="stringVal" :options="property.type['options']"
                               @changed="setPropertyValue($event)" :placeholder="property.label" />
            <UInput v-else-if="property.type === 'color'" :model-value="stringVal" type="color" class="cursor-pointer"
                    @update:model-value="setPropertyValue($event)" :padded="false" input-class="color-input" />
            <span v-else class="input text-black" :contenteditable="isStringLike && !isTemplate" spellcheck="false"
                  :class="{placeholder: !stringVal?.length, 'can-attach': canAttach}"
                  :data-label="property.label" @input="validateInput($event)" >
                {{stringVal}}
            </span>
            <span class="right-icon" v-if="stringVal.length && typeKey === 'number' && singleType['suffix']">{{singleType['suffix']}}</span>
            <UIcon class="right-icon" v-else-if="stringVal.length && typeKey === 'number'" name="mdi:pound" />
        </span>
        <template #panel>
            <p class="text-black max-w-60 m-2">{{tooltip}}</p>
        </template>
    </UPopover>
</template>
<style scoped lang="scss">
.placeholder:before {
    @apply text-gray-400;
    content: attr(data-label);
}

.can-attach {
    @apply bg-gray-200 border-gray-600;
}

:deep(.color-input) {
    @apply w-12 cursor-pointer;

    &::-webkit-color-swatch {
        @apply rounded-md;
    }

    &::-webkit-color-swatch-wrapper {
        @apply p-0;
    }
}

.input-container:has(.right-icon) .input {
    @apply pr-6;
}

.right-icon {
    @apply absolute right-2 text-gray-400 bottom-1;
}
</style>
