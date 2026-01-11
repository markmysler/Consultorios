<template>
    <DefaultSection>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="currentDoctor" class="w-full flex flex-col items-center gap-6">
            <HeadingH2>{{ currentDoctor.fullname }}</HeadingH2>

            <div class="w-full max-w-lg flex flex-col items-center gap-5">
                <div v-for="day in weekSchedule" :key="day.name" class="w-full flex flex-col gap-2">
                    <HeadingH3 class="text-primary">{{ day.name }}</HeadingH3>

                    <div v-if="day.appointments.length === 0" class="text-gray-dark italic">
                        Sin horarios asignados
                    </div>

                    <div v-else class="flex flex-col gap-2">
                        <div v-for="appointment in day.appointments" :key="appointment.id"
                            class="w-full bg-gray-dark rounded-md shadow-md shadow-black/10 overflow-hidden">
                            <div class="flex text-xs lg:text-base text-primary font-bold">
                                <span class="w-1/3 bg-secondary rounded-br-md py-2 px-2.5 lg:px-4">Sector {{ appointment.sector
                                    }} {{ appointment.room }}</span>
                                <span class="w-2/3 py-2 px-3 lg:px-5">{{ appointment.time }}</span>
                            </div>
                            <div class="py-2 px-3 lg:px-5">
                                <p class="text-xs lg:text-base text-primary">
                                    Nombre de la agenda: "{{ appointment.agendaName }}"
                                </p>
                            </div>
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
import { useDoctors } from '~/composables/useDoctors.js'
import { useDoctorSchedule } from '~/composables/useDoctorSchedule.js'

const route = useRoute()
const { currentDoctor, loading, fetchDoctorById } = useDoctors()
const { getDoctorWeeklySchedule } = useDoctorSchedule()

const weekSchedule = ref([])
const scheduleLoading = ref(false)

const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchDoctorById(id)

        // Cargar agenda del profesional
        if (currentDoctor.value) {
            scheduleLoading.value = true
            const schedule = await getDoctorWeeklySchedule(id)

            // Transformar el schedule del composable al formato que espera el template
            weekSchedule.value = dayNames.map(dayName => {
                const daySchedule = schedule[dayName] || []
                return {
                    name: dayName,
                    appointments: daySchedule.map((slot, index) => ({
                        id: `${dayName}-${index}`,
                        sector: slot.floor_name,
                        room: slot.room_name,
                        time: `${slot.start_time} - ${slot.end_time}`,
                        agendaName: slot.room_name,
                        room_id: slot.room_id
                    }))
                }
            })
            scheduleLoading.value = false
        }
    } catch (err) {
        console.error('Error loading professional:', err)
        scheduleLoading.value = false
    }
})
</script>