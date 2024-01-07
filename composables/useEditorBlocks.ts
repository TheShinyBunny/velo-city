import type {BlockGroup} from '~/utils/blocks'

export default function () {
    return useState<BlockGroup[]>(() => [])
}
