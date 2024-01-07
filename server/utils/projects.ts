
export function getUserProjects(userId: string) {
    return prisma.project.findMany({
        where: {
            creatorId: userId
        },
        select: {
            createdAt: true,
            name: true,
            id: true
        }
    })
}

export function createProject(project: any) {
    return prisma.project.create({
        data: project
    })
}

export function getProject(id: string) {
    return prisma.project.findUnique({
        where: {
            id: id
        }
    })
}

export function renameProject(id: string, name: string) {
    return prisma.project.update({
        where: {id},
        data: {name}
    })
}

export function updateProject(id: string, structure: any[]) {
    return prisma.project.update({
        where: {id},
        data: {
            structure: [...structure]
        }
    })
}

export function deleteProject(id: string) {
    return prisma.project.delete({
        where: {id}
    })
}
