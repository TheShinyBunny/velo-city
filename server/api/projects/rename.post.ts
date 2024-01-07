
export default defineEventHandler(async (event) => {
    const data = await readBody(event)
    return renameProject(data.projectId, data.name)
})
