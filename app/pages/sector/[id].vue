<template>
    <DefaultSection>
        <HeadingH1>Consultorio {{ selectedRoom?.name || '' }}</HeadingH1>
        <p v-if="currentFloor" class="text-primary font-medium text-lg">Sector {{ currentFloor.name }}</p>

        <div class="w-full max-w-2xl space-y-6">
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

            <div>
                <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                    Seleccione un horario
                </label>
                <div class="relative">
                    <Icon name="tabler:clock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                        id="time"
                        v-model="selectedTime"
                        type="time"
                        class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                    />
                </div>
            </div>

            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>

            <div v-else>
                <p class="text-sm text-gray-700 mb-3 text-center">
                    Seleccione un consultorio para ver información detallada.
                </p>

                <div class="grid grid-cols-5 gap-2 lg:gap-3">
                    <button
                        v-for="room in floorRooms"
                        :key="room.id"
                        @click="handleRoomClick(room)"
                        :class="[
                            'font-bold text-sm lg:text-base rounded-lg py-4 lg:py-6 transition duration-300 border-2',
                            getRoomAvailabilityClass(room)
                        ]"
                    >
                        {{ room.name }}
                    </button>
                </div>
            </div>

            <div v-if="selectedRoom && selectedDate && selectedTime" class="bg-secondary rounded-xl p-6 space-y-4">
                <div class="flex items-center justify-between">
                    <HeadingH2>{{ selectedRoom.name }}</HeadingH2>
                    <button @click="selectedRoom = null" class="text-primary hover:text-primary/80">
                        <Icon name="tabler:x" class="w-6 h-6" />
                    </button>
                </div>

                <div class="space-y-3">
                    <div v-if="roomAvailability?.status === 'available'" class="bg-success/20 border-l-4 border-success rounded p-4">
                        <p class="text-success font-bold flex items-center gap-2">
                            <Icon name="tabler:circle-check" class="w-5 h-5" />
                            LIBRE
                        </p>
                        <p class="text-dark mt-2">
                            {{ formatTime(selectedTime) }}
                        </p>
                    </div>

                    <div v-else class="bg-error/20 border-l-4 border-error rounded p-4">
                        <p class="text-dark font-medium mb-2">
                            {{ roomAvailability?.doctorName || 'Profesional' }}
                        </p>
                        <p class="text-dark">
                            {{ formatTime(roomAvailability?.startTime) }} - {{ formatTime(roomAvailability?.endTime) }}
                        </p>
                        <p class="text-sm text-dark/70 mt-1">
                            Nombre de la agenda: "{{ roomAvailability?.agendaName || 'XXX' }}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useFloors } from '~/composables/useFloors.js'
import { useRooms } from '~/composables/useRooms.js'

const route = useRoute()
const { currentFloor, fetchFloorById } = useFloors()
const { rooms, loading, fetchRooms } = useRooms()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedTime = ref('12:00')
const selectedRoom = ref(null)
const roomAvailability = ref(null)

const floorRooms = computed(() => {
    const floorId = parseInt(route.params.id)
    return rooms.value.filter(room => room.floor_id === floorId)
})

onMounted(async () => {
    try {
        const id = route.params.id
        await Promise.all([
            fetchFloorById(id),
            fetchRooms()
        ])
    } catch (err) {
        console.error('Error loading sector data:', err)
    }
})

// Simulación de disponibilidad - reemplazar con llamada real al composable
const getRoomAvailabilityClass = (room) => {
    // TODO: Integrar con composable real de disponibilidad
    const isAvailable = Math.random() > 0.5

    if (isAvailable) {
        return 'bg-success hover:bg-success/80 text-light border-success'
    } else {
        return 'bg-error hover:bg-error/80 text-light border-error'
    }
}

const handleRoomClick = async (room) => {
    selectedRoom.value = room

    // TODO: Llamar al composable real para obtener disponibilidad
    // Simulación temporal
    const isAvailable = Math.random() > 0.5

    if (isAvailable) {
        roomAvailability.value = {
            status: 'available'
        }
    } else {
        roomAvailability.value = {
            status: 'occupied',
            doctorName: 'Juan Pérez',
            startTime: '09:30',
            endTime: '13:00',
            agendaName: 'XXX'
        }
    }
}

const formatTime = (time) => {
    if (!time) return ''
    return `${time}hs`
}
</script>