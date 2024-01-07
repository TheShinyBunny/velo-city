export default defineEventHandler(async (event) => {
    const userId = event.context.params?.user
    if (!userId) throw createError({status: 400, message: 'Missing user ID'})
    return getUserProjects(userId)
})
