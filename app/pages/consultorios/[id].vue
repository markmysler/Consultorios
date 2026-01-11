<template>
    <DefaultSection>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="currentRoom" class="w-full max-w-2xl space-y-6">
            <div class="flex flex-col gap-1 text-center">
                <HeadingH2>Consultorio {{ currentRoom.name }}</HeadingH2>
                <p v-if="currentFloor" class="lg:text-xl text-primary font-bold">
                    Sector {{ currentFloor.name }}
                </p>
            </div>

            <FormDateField v-model="selectedDate" label="Seleccione una fecha" id="date" />

            <div class="space-y-3">
                <div v-if="daySchedule.length === 0" class="text-center py-8 text-gray-dark italic">
                    No hay horarios asignados para esta fecha
                </div>

                <div v-else>
                    <div
                        v-for="slot in daySchedule"
                        :key="slot.id"
                        :class="[
                            'rounded-lg p-4 border-l-4',
                            slot.available
                                ? 'bg-success/20 border-success'
                                : 'bg-error/20 border-error'
                        ]"
                    >
                        <div v-if="slot.available">
                            <p class="text-success font-bold flex items-center gap-2">
                                <Icon name="tabler:circle-check" class="w-5 h-5" />
                                LIBRE
                            </p>
                            <p class="text-dark mt-2">{{ slot.time }}</p>
                        </div>

                        <div v-else>
                            <p class="text-dark font-bold">{{ slot.doctorName }}</p>
                            <p class="text-dark mt-1">{{ slot.time }}</p>
                            <p class="text-sm text-dark/70 mt-1">
                                Nombre de la agenda: "{{ slot.agendaName }}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <Icon name="tabler:door-off" class="w-16 h-16 mx-auto text-gray-dark" />
            <p class="text-dark text-lg mt-4">Consultorio no encontrado</p>
        </div>
    </DefaultSection>
</template>

<script setup>
import { useRooms } from '~/composables/useRooms.js'
import { useFloors } from '~/composables/useFloors.js'
import { useRoomSchedule } from '~/composables/useRoomSchedule.js'

const route = useRoute()
const { currentRoom, loading, fetchRoomById } = useRooms()
const { currentFloor, fetchFloorById } = useFloors()
const { getWeeklySchedule } = useRoomSchedule()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const weeklySchedule = ref({})
const daySchedule = ref([])
const scheduleLoading = ref(false)

const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const updateDaySchedule = (date) => {
    const dayOfWeek = new Date(date).getDay()
    const dayName = dayNames[dayOfWeek]
    const schedule = weeklySchedule.value[dayName] || []

    daySchedule.value = schedule.map((slot, index) => ({
        id: index,
        available: false, // Todos los slots tienen un doctor asignado
        doctorName: slot.doctor_name,
        time: `${slot.start_time} - ${slot.end_time}`,
        agendaName: slot.doctor_name,
        doctor_cuil: slot.doctor_cuil
    }))
}

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchRoomById(id)

        // Cargar el piso asociado
        if (currentRoom.value?.floor_id) {
            await fetchFloorById(currentRoom.value.floor_id)
        }

        // Cargar agenda del consultorio
        scheduleLoading.value = true
        weeklySchedule.value = await getWeeklySchedule(id)
        updateDaySchedule(selectedDate.value)
        scheduleLoading.value = false
    } catch (err) {
        console.error('Error loading room:', err)
        scheduleLoading.value = false
    }
})

// Watch selectedDate para actualizar la agenda
watch(selectedDate, async (newDate) => {
    updateDaySchedule(newDate)
})
</script>