<template>
    <DefaultSection>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="currentRoom" class="w-full max-w-2xl space-y-6">
            <div class="text-center">
                <HeadingH1>Consultorio {{ currentRoom.name }}</HeadingH1>
                <p v-if="currentFloor" class="text-primary font-medium text-lg">
                    Sector {{ currentFloor.name }}
                </p>
            </div>

            <div>
                <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
                    Seleccione una fecha
                </label>
                <div class="relative">
                    <Icon name="tabler:calendar" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                        id="date"
                        v-model="selectedDate"
                        type="date"
                        class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                    />
                </div>
            </div>

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
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRooms } from '~/composables/useRooms.js'
import { useFloors } from '~/composables/useFloors.js'

const route = useRoute()
const { currentRoom, loading, fetchRoomById } = useRooms()
const { currentFloor, fetchFloorById } = useFloors()

const selectedDate = ref(new Date().toISOString().split('T')[0])

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchRoomById(id)

        // Cargar el piso asociado
        if (currentRoom.value?.floor_id) {
            await fetchFloorById(currentRoom.value.floor_id)
        }

        // TODO: Cargar agenda del consultorio
    } catch (err) {
        console.error('Error loading room:', err)
    }
})

// TODO: Obtener agenda real del composable basado en selectedDate
const daySchedule = ref([
    {
        id: 1,
        available: true,
        time: '07:00hs - 09:30hs'
    },
    {
        id: 2,
        available: false,
        doctorName: 'Juan Pérez',
        time: '09:30hs - 13:00hs',
        agendaName: 'XXX'
    },
    {
        id: 3,
        available: false,
        doctorName: 'Alejandra Cruz',
        time: '13:00hs - 16:00hs',
        agendaName: 'XXX'
    },
    {
        id: 4,
        available: true,
        time: '16:00hs - 20:00hs'
    }
])

// Watch selectedDate para actualizar la agenda
watch(selectedDate, async (newDate) => {
    // TODO: Cargar agenda para la nueva fecha
    console.log('Date changed to:', newDate)
})
</script>