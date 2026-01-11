<template>
    <DefaultSection>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="currentDoctor" class="w-full max-w-4xl space-y-6">
            <div class="text-center space-y-3">
                <HeadingH1>{{ currentDoctor.fullname }}</HeadingH1>
                <div class="flex gap-2 justify-center flex-wrap">
                    <span class="px-4 py-2 bg-secondary text-primary rounded-full text-sm font-medium">
                        Pediatría
                    </span>
                    <span class="px-4 py-2 bg-secondary text-primary rounded-full text-sm font-medium">
                        Oftalmología
                    </span>
                </div>
            </div>

            <div class="space-y-4">
                <div v-for="day in weekSchedule" :key="day.name" class="space-y-2">
                    <h3 class="font-bold text-lg text-dark">{{ day.name }}</h3>

                    <div v-if="day.appointments.length === 0" class="text-gray-dark italic">
                        Sin horarios asignados
                    </div>

                    <div v-else class="space-y-2">
                        <div
                            v-for="appointment in day.appointments"
                            :key="appointment.id"
                            class="bg-secondary rounded-lg p-4 flex items-center justify-between"
                        >
                            <div class="flex-1">
                                <p class="font-bold text-primary">{{ appointment.sector }}</p>
                                <p class="text-dark font-medium">{{ appointment.time }}</p>
                                <p class="text-sm text-dark/70">
                                    Nombre de la agenda: "{{ appointment.agendaName }}"
                                </p>
                            </div>

                            <button
                                @click="handleEditAppointment(appointment)"
                                class="text-terciary hover:text-terciary/80 transition"
                            >
                                <Icon name="tabler:edit" class="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <Icon name="tabler:user-off" class="w-16 h-16 mx-auto text-gray-dark" />
            <p class="text-dark text-lg mt-4">Profesional no encontrado</p>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useDoctors } from '~/composables/useDoctors.js'

const route = useRoute()
const { currentDoctor, loading, fetchDoctorById } = useDoctors()

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchDoctorById(id)
        // TODO: Cargar agenda del profesional
    } catch (err) {
        console.error('Error loading professional:', err)
    }
})

// TODO: Obtener agenda real del composable
const weekSchedule = ref([
    {
        name: 'Lunes',
        appointments: [
            {
                id: 1,
                sector: 'Sector A 23',
                time: '07:00hs - 09:30hs',
                agendaName: 'XXX'
            },
            {
                id: 2,
                sector: 'Oncología 11',
                time: '11:00hs - 16:30hs',
                agendaName: 'XXX'
            }
        ]
    },
    {
        name: 'Martes',
        appointments: [
            {
                id: 3,
                sector: 'Sector B 02',
                time: '13:00hs - 16:30hs',
                agendaName: 'XXX'
            }
        ]
    },
    {
        name: 'Miércoles',
        appointments: [
            {
                id: 4,
                sector: 'Sector C 14',
                time: '11:30hs - 16:30hs',
                agendaName: 'XXX'
            }
        ]
    },
    {
        name: 'Jueves',
        appointments: [
            {
                id: 5,
                sector: 'Infectología 20',
                time: '09:00hs - 12:30hs',
                agendaName: 'XXX'
            },
            {
                id: 6,
                sector: 'Sector A 07',
                time: '16:00hs - 19:00hs',
                agendaName: 'XXX'
            }
        ]
    },
    {
        name: 'Viernes',
        appointments: [
            {
                id: 7,
                sector: 'Sector C 12',
                time: '10:30hs - 17:30hs',
                agendaName: 'XXX'
            }
        ]
    },
    {
        name: 'Sábado',
        appointments: []
    },
    {
        name: 'Domingo',
        appointments: []
    }
])

const handleEditAppointment = (appointment) => {
    // TODO: Implementar edición de cita
    console.log('Edit appointment:', appointment)
}
</script>