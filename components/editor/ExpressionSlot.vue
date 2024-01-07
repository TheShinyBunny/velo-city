<script setup lang="ts">
import type {Block, Property, SelectOption, SlotAttachment} from '~/utils/blocks'
import {asSingleType, getTypeKey, type NumberType} from '~/utils/types'

const {property} = defineProps<{property: Property}>()
const isTemplate = inject('isTemplate', false)
const stringVal = ref<string>('')
const isLiteral = ref(false)
const isStringLike = ref(false)
const singleType = asSingleType(property.type)
const typeKey = getTypeKey(singleType)
const placeholder = ref<HTMLElement>()

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
const mousePos = useMousePos()
const attach = useAttachTarget()

const {markModified} = inject('projectActions')

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
    delete property.value
}

function isDraggingNearSlot() {
    if (!dragState.value.draggedBlocks) return false
    if (!placeholder.value) return false
    const rect = placeholder.value!.getBoundingClientRect();
    return isBetween(rect.top, mousePos.value.y - dragState.value.offsetY, rect.bottom)
        && isBetween(rect.left, mousePos.value.x - dragState.value.offsetX, rect.right)
}

function isBetween(min: number, value: number, max: number) {
    return min <= value && max >= value;
}

const canAttach = computed(() => !isTemplate && !property.value && isDraggingNearSlot())

let lastAttachment: SlotAttachment

watch(canAttach, (state) => {
    if (state) {
        lastAttachment = {
            type: 'slot',
            property
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
    <EditorBlockRender v-if="property.value && !isLiteral" :block="property.value" @start-dragging="startDragging($event)"
                       @update-block="updateBlockInSlot($event)" />
    <span v-else ref="placeholder" class="relative input-container" :class="{'cursor-text': isStringLike}" @mousedown.stop>
        <EditorSelectInput v-if="property.type === 'boolean'" :value="stringVal || 'true'" :options="booleanOptions"
                           @changed="setPropertyValue($event)" />
        <EditorSelectInput v-else-if="typeKey === 'enum'" :value="stringVal" :options="property.type['options']"
                           @changed="setPropertyValue($event)" :placeholder="property.label" />
        <input v-else-if="property.type === 'color'" :value="stringVal" type="color" class="input !p-0 color-input"
               @input="setPropertyValue($event.target.value)" />
        <span v-else class="input text-black" :contenteditable="isStringLike && !isTemplate"
              :class="{placeholder: !stringVal?.length, 'can-attach': canAttach}"
              :data-label="property.label" @input="validateInput($event)" >
            {{stringVal}}
        </span>
        <span class="right-icon" v-if="stringVal.length && typeKey === 'number' && singleType['suffix']">{{singleType['suffix']}}</span>
        <Icon class="right-icon" v-else-if="stringVal.length && typeKey === 'number'" name="mdi:pound" />
    </span>
</template>
<style scoped lang="scss">
.placeholder:before {
    @apply text-gray-400;
    content: attr(data-label);
}

.can-attach {
    @apply bg-gray-200 border-gray-600;
}

.color-input {
    @apply translate-y-1;
}

.color-input::-webkit-color-swatch {
    @apply rounded-md;
}

.color-input::-webkit-color-swatch-wrapper {
    @apply p-0;
}

.input-container:has(.right-icon) .input {
    @apply pr-6;
}

.right-icon {
    @apply absolute right-2 text-gray-400 bottom-1;
}
</style>
