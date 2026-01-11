<template>
    <DefaultSection>
        <HeadingH1>Buscar por: Consultorio</HeadingH1>

        <div class="w-full max-w-2xl space-y-6">
            <div>
                <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de agenda
                </label>
                <div class="relative">
                    <Icon name="tabler:search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                        id="search"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar consultorio..."
                        class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                    />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="sector" class="block text-sm font-medium text-gray-700 mb-2">
                        Sector
                    </label>
                    <select
                        id="sector"
                        v-model="selectedSector"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                    >
                        <option value="">Todos</option>
                        <option v-for="floor in floors" :key="floor.id" :value="floor.id">
                            {{ floor.name }}
                        </option>
                    </select>
                </div>

                <div>
                    <label for="number" class="block text-sm font-medium text-gray-700 mb-2">
                        Número
                    </label>
                    <select
                        id="number"
                        v-model="selectedNumber"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                    >
                        <option value="">Todos</option>
                        <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                            {{ room.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div>
                <label for="specialty" class="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad
                </label>
                <select
                    id="specialty"
                    v-model="selectedSpecialty"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                >
                    <option value="">Seleccione una especialidad</option>
                    <option value="pediatria">Pediatría</option>
                    <option value="cardiologia">Cardiología</option>
                    <option value="oftalmologia">Oftalmología</option>
                    <option value="traumatologia">Traumatología</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                </label>
                <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="filterOccupied"
                            class="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span class="text-dark">Ocupado</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="filterAvailable"
                            class="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span class="text-dark">Libre</span>
                    </label>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                    </label>
                    <div class="relative">
                        <Icon name="tabler:calendar" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <input
                            id="date"
                            type="date"
                            v-model="filterDate"
                            class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-dark"
                        />
                    </div>
                </div>
                <div>
                    <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                        Hora
                    </label>
                    <div class="relative">
                        <Icon name="tabler:clock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <input
                            id="time"
                            type="time"
                            v-model="filterTime"
                            class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-dark"
                        />
                    </div>
                </div>
            </div>

            <ButtonPrimary @click="handleSearch" class="w-full">
                Buscar
            </ButtonPrimary>

            <div v-if="searchResults.length > 0" class="space-y-3 mt-8">
                <HeadingH2>Resultados</HeadingH2>

                <button
                    v-for="office in searchResults"
                    :key="office.id"
                    @click="handleOfficeClick(office.id)"
                    class="w-full bg-secondary hover:bg-primary hover:text-light text-primary rounded-lg p-4 transition duration-300 flex items-center justify-between"
                >
                    <div class="text-left">
                        <p class="font-bold">{{ office.sector }}</p>
                        <p class="font-medium">{{ office.name }}</p>
                    </div>
                    <Icon name="tabler:chevron-right" class="w-6 h-6" />
                </button>
            </div>

            <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-8">
                <Icon name="tabler:door-off" class="w-16 h-16 mx-auto text-gray-dark" />
                <p class="text-dark text-lg mt-4">No se encontraron consultorios</p>
            </div>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRooms } from '~/composables/useRooms.js'
import { useFloors } from '~/composables/useFloors.js'

const { rooms, fetchRooms } = useRooms()
const { floors, fetchFloors } = useFloors()

const searchQuery = ref('')
const selectedSector = ref('')
const selectedNumber = ref('')
const selectedSpecialty = ref('')
const filterOccupied = ref(false)
const filterAvailable = ref(false)
const filterDate = ref('')
const filterTime = ref('')

const searchResults = ref([])
const hasSearched = ref(false)

const availableRooms = computed(() => {
    if (!selectedSector.value) return rooms.value
    return rooms.value.filter(room => room.floor_id === selectedSector.value)
})

onMounted(async () => {
    try {
        await Promise.all([fetchRooms(), fetchFloors()])
    } catch (err) {
        console.error('Error loading data:', err)
    }
})

const handleSearch = async () => {
    hasSearched.value = true

    // TODO: Implementar búsqueda real con filtros
    let results = [...rooms.value]

    // Filtrar por query de búsqueda
    if (searchQuery.value.trim()) {
        results = results.filter(room =>
            room.name?.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }

    // Filtrar por sector
    if (selectedSector.value) {
        results = results.filter(room => room.floor_id === selectedSector.value)
    }

    // Filtrar por número específico
    if (selectedNumber.value) {
        results = results.filter(room => room.id === selectedNumber.value)
    }

    // Mapear con datos del sector
    searchResults.value = results.map(room => {
        const floor = floors.value.find(f => f.id === room.floor_id)
        return {
            ...room,
            sector: floor ? `Sector ${floor.name}` : 'Sector desconocido'
        }
    })
}

const handleOfficeClick = (id) => {
    navigateTo(ROUTE_NAMES.OFFICE_DETAIL(id))
}
</script>