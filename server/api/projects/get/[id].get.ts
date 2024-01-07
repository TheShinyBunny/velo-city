
export default defineEventHandler(async (event) => {
    const projectId = event.context.params?.id
    if (!projectId) throw createError({status: 400, message: 'Missing project ID'})
    return getProject(projectId)
})
