// @ts-expect-error
import { getServerSession } from "#auth"

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event)
    if (!session) throw createError({status: 401})
    const project = await readBody(event)
    project.creatorId = session.user.id
    return createProject(project)
})
