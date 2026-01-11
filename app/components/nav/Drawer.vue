<template>
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="isOpen" @click="$emit('close')" class="fixed inset-0 z-60"></div>
    </Transition>

    <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
        <nav v-if="isOpen"
            class="w-[65%] max-w-80 h-full flex flex-col justify-between gap-4 fixed top-0 left-0 z-50 bg-secondary shadow-xl shadow-black/25 transform overflow-y-auto py-4 px-3">
            <div class="flex flex-col gap-4">
                <button @click="$emit('close')" class="flex justify-center items-center self-end" aria-label="Cerrar menú">
                    <Icon name="tabler:x" class="w-6 h-6 text-primary" />
                </button>

                <NuxtLink :to="ROUTE_NAMES.HOME"
                    class="flex items-center gap-3 text-primary px-3"
                    @click="$emit('close')">
                    <Icon name="tabler:building" class="w-5 h-5" />
                    <span class="font-medium">Sectores</span>
                </NuxtLink>

                <NuxtLink :to="ROUTE_NAMES.PROFESSIONALS_SEARCH"
                    class="flex items-center gap-3 text-primary px-3"
                    @click="$emit('close')">
                    <Icon name="tabler:users" class="w-5 h-5" />
                    <span class="font-medium">Profesionales</span>
                </NuxtLink>

                <NuxtLink :to="ROUTE_NAMES.OFFICES_SEARCH"
                    class="flex items-center gap-3 text-primary px-3"
                    @click="$emit('close')">
                    <Icon name="tabler:door" class="w-5 h-5" />
                    <span class="font-medium">Consultorios</span>
                </NuxtLink>

                <!-- TODO: Add role check middleware to show only for admin users -->
                <NuxtLink :to="ROUTE_NAMES.ADMIN.INDEX"
                    class="flex items-center gap-3 text-primary px-3"
                    @click="$emit('close')">
                    <Icon name="tabler:settings" class="w-5 h-5" />
                    <span class="font-medium">Administración</span>
                </NuxtLink>
            </div>

            <div class="flex flex-col gap-3">
                <p v-if="user" class="text-sm text-primary px-3">
                    Sesión iniciada como <span class="font-medium">{{ user.email }}</span>
                </p>
                
                <button @click="handleSignOut" :disabled="loggingOut"
                    class="h-12 flex items-center gap-3 bg-primary rounded-xl text-light font-light py-3 px-6">
                    <Icon v-if="!loggingOut" name="tabler:logout" class="w-5 h-5" />
                    <Icon v-else name="tabler:loader-2" class="w-5 h-5 animate-spin" />
                    <span class="font-medium">
                        {{ loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión' }}
                    </span>
                </button>
            </div>
        </nav>
    </Transition>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const { user } = useAuth()

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close']);

const loggingOut = ref(false)
const router = useRouter()

async function handleSignOut() {
    if (loggingOut.value) return;

    loggingOut.value = true;

    try {
        const supabase = useSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        localStorage.removeItem('lastLoginEmail');

        emit('close');

        router.push(ROUTE_NAMES.LOGIN);
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    } finally {
        loggingOut.value = false;
    }
}

onMounted(() => {
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape' && props.isOpen) {
            emit('close')
        }
    }

    document.addEventListener('keydown', handleEscapeKey)

    onUnmounted(() => {
        document.removeEventListener('keydown', handleEscapeKey)
    })
})

watch(() => props.isOpen, (isOpen) => {
    if (import.meta.client) {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }
})

onUnmounted(() => {
    if (import.meta.client) {
        document.body.style.overflow = ''
    }
})
</script>