export const courseKeys = {
    all: ['courses'] as const,
    lists: () => [...courseKeys.all, 'list'] as const,
    list: (filters: string) => [...courseKeys.lists(), { filters }] as const,
    details: () => [...courseKeys.all, 'detail'] as const,
    detail: (id: number) => [...courseKeys.details(), id] as const,
    teacherCourses: () => [...courseKeys.all, 'teacher'] as const,
}


export const userKeys = {
    all: ['users'] as const,
    current: () => [...userKeys.all, 'current'] as const,
    byId: (id: number) => [...userKeys.all, id] as const,
}