
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    // Admin
    ADMIN: {
        INDEX: '/admin',

        // Profesionales
        PROFESSIONALS: '/admin/profesionales',
        CREATE_PROFESSIONAL: '/admin/profesionales/create',
        EDIT_PROFESSIONAL: (id) => `/admin/profesionales/edit/${id}`,

        // Consultorios
        OFFICES: '/admin/consultorios',
        CREATE_OFFICE: '/admin/consultorios/create',
        EDIT_OFFICE: (id) => `/admin/consultorios/edit/${id}`,

        // Pisos
        FLOORS: '/admin/pisos',
        CREATE_FLOOR: '/admin/pisos/create',
        EDIT_FLOOR: (id) => `/admin/pisos/edit/${id}`,

        // Licencias
        LICENSES: '/admin/licencias',
        CREATE_LICENSE: '/admin/licencias/create',
        EDIT_LICENSE: (id) => `/admin/licencias/edit/${id}`,

        // Horarios
        SCHEDULES: '/admin/horarios',
        CREATE_SCHEDULE: '/admin/horarios/create',
        EDIT_SCHEDULE: (id) => `/admin/horarios/edit/${id}`,
    }
};