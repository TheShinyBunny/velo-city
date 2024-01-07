import type {AttachTarget} from '~/utils/blocks'

export default function () {
    return useState<AttachTarget | undefined>()
}
