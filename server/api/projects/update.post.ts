import {updateProject} from '../../utils/projects'

export default defineEventHandler(async (event) => {
    const data = await readBody(event)
    return updateProject(data.projectId, data.structure)
})
