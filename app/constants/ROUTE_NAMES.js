
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    SECTOR_DETAIL: (id) => `/sector/${id}`,
    PROFESSIONALS_SEARCH: '/profesionales',
    PROFESSIONAL_DETAIL: (id) => `/profesionales/${id}`,
    OFFICES_SEARCH: '/consultorios',
    OFFICE_DETAIL: (id) => `/consultorios/${id}`,
    // Admin
    ADMIN: {
        INDEX: '/admin',
        // Profesionales
        PROFESSIONALS: '/admin/profesionales',
        CREATE_PROFESSIONAL: '/admin/profesionales/create',
        CREATE_PROFESSIONAL_ACCOUNT: '/admin/profesionales/create-account',
        EDIT_PROFESSIONAL: (id) => `/admin/profesionales/edit/${id}`,
        // Consultorios
        OFFICES: '/admin/consultorios',
        CREATE_OFFICE: '/admin/consultorios/create',
        EDIT_OFFICE: (id) => `/admin/consultorios/edit/${id}`,
        // Sectores
        FLOORS: '/admin/sectores',
        CREATE_FLOOR: '/admin/sectores/create',
        EDIT_FLOOR: (id) => `/admin/sectores/edit/${id}`,
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