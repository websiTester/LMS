const ROLE_DASHBOARD: Record<string, string> = {
    admin: "/admin/dashboard",
    teacher: "/teacher/dashboard",
    student: "/student/dashboard"
}


export const getDashboardByRole = (role: string) => {
    return ROLE_DASHBOARD[role] ?? '/';
}