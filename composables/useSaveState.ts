export enum SaveStatus {
    SAVED = 'Saved',
    MODIFIED = 'Modified',
    SAVING = 'Saving'
}

export default function () {
    return useState<SaveStatus>(() => SaveStatus.SAVED)
}
