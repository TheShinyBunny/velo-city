export default function () {
    return useState<{x: number, y: number}>(() => ({x: 0, y: 0}))
}