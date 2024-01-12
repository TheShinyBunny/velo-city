
export default function () {
    return useState<ContextMenuState>('contextMenu', () => ({
        isOpen: false,
        element: {getBoundingClientRect: () => ({})}
    }))
}

interface ContextMenuState {
    isOpen: boolean
    element: { getBoundingClientRect: () => {} }
}
