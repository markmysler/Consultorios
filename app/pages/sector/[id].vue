<template>
    <DefaultSection>
        <div class="flex flex-col gap-1 text-center">
            <HeadingH2 v-if="currentFloor">Sector {{ currentFloor.name }}</HeadingH2>
        </div>

        <div class="w-full max-w-2xl space-y-6">
            <FormFieldsContainer>
                <FormDateField id="date" v-model="selectedDate" label="Seleccione una fecha" />
                <FormTimeField id="time" v-model="selectedTime" label="Seleccione un horario" />
            </FormFieldsContainer>
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>

            <div v-else class="flex flex-col gap-4">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
                    <NuxtLink v-for="room in floorRooms" :key="room.id" :to="ROUTE_NAMES.OFFICE_DETAIL(room.id)" :class="[
                        'flex items-center justify-center border-none font-bold text-sm lg:text-xl rounded-lg py-4 lg:py-6',
                        getRoomAvailabilityClass(room)
                    ]">
                        {{ room.name }}
                    </NuxtLink>
                </div>
                <p class="text-sm text-gray-700 mb-3 text-center">
                    Seleccione un consultorio para ver información detallada.
                </p>
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

const floorRooms = computed(() => {
    const floorId = route.params.id
    return rooms.value.filter(room => room.floor_id === floorId)
})

const checkDateTime = computed(() => {
    if (!selectedDate.value || !selectedTime.value) return new Date().toISOString()
    return `${selectedDate.value}T${selectedTime.value}:00`
})

const loadRoomsAvailability = async () => {
    await fetchRooms(checkDateTime.value)
}

onMounted(async () => {
    try {
        const id = route.params.id
        await fetchFloorById(id)
        await loadRoomsAvailability()
    } catch (err) {
        console.error('Error loading sector data:', err)
    }
})

watch([selectedDate, selectedTime], async () => {
    await loadRoomsAvailability()
})

const getRoomAvailabilityClass = (room) => {
    if (room.is_available) {
        return 'bg-success'
    } else {
        return 'bg-error'
    }
}
</script>