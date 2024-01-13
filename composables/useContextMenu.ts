interface ContextMenuState {
    isOpen: boolean
    element: { getBoundingClientRect: () => {} }
}

export default function() {
  return useState<ContextMenuState>('contextMenu', () => ({
    isOpen: false,
    element: { getBoundingClientRect: () => ({}) }
  }))
}
