<template>
    <DefaultSection>
        <HeadingH2>Buscar por: Consultorio</HeadingH2>

        <FormLayout @submit.prevent="handleSearch">
            <FormTextField v-model="searchQuery" label="Nombre de agenda" placeholder="Buscar consultorio..."
                id="search" />

            <FormFieldsContainer>
                <FormSelect v-model="selectedSector" label="Sector" placeholder="Todos" id="sector"
                    :options="floorOptions" clearable />

                <FormSelect v-model="selectedNumber" label="Número" placeholder="Todos" id="number"
                    :options="roomOptions" clearable />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <div class="flex flex-col gap-2">
                    <FormSelect v-model="selectedSpecialty" label="Especialidad"
                        placeholder="Seleccione una especialidad" id="specialty" :options="specialtyOptions"
                        :disabled="isAvailableFree" clearable />
                    <p v-if="isAvailableFree" class="text-sm text-dark/70">
                        Si eliges buscar por un consultorio libre, no puedes elegir buscar por una especialidad.
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <FormLabel>Disponibilidad</FormLabel>
                    <div class="flex gap-4">
                        <FormLabel class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="selectedAvailability" value="occupied"
                                :disabled="!!selectedSpecialty"
                                class="w-4 h-4 text-primary focus:ring-primary border-gray-300" />
                            <span class="text-dark">Ocupado</span>
                        </FormLabel>
                        <FormLabel class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="selectedAvailability" value="available"
                                :disabled="!!selectedSpecialty"
                                class="w-4 h-4 text-primary focus:ring-primary border-gray-300" />
                            <span class="text-dark">Libre</span>
                        </FormLabel>
                    </div>
                    <p v-if="selectedSpecialty" class="text-sm text-dark/70">
                        Si eliges buscar por una especialidad, no puedes elegir buscar por un consultorio libre.
                    </p>
                </div>
            </FormFieldsContainer>
            <FormFieldsContainer>
                <FormDateField v-model="filterDate" label="Fecha" id="date" />

                <FormTimeField v-model="filterTime" label="Hora" id="time" />
            </FormFieldsContainer>

            <ButtonPrimary type="submit">
                Buscar
            </ButtonPrimary>
        </FormLayout>

        <div v-if="searchResults.length > 0" class="w-full max-w-md lg:max-w-[56.25rem] flex flex-col gap-6 mt-8">
            <HeadingH2 class="text-center">Resultados</HeadingH2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
                <button v-for="office in searchResults" :key="office.id" @click="handleOfficeClick(office.id)"
                    class="w-full flex items-center font-bold text-xs md:text-xl text-primary rounded-md shadow-md shadow-black/10 overflow-hidden">
                    <span class="min-w-[8.25rem] md:min-w-52 flex-shrink-0 bg-secondary py-2 lg:py-4 px-3 whitespace-nowrap">{{ office.sector }}</span>
                    <span class="flex-1 bg-gray-dark py-2 lg:py-4 px-3 whitespace-nowrap overflow-hidden text-ellipsis">Consultorio {{ office.name }}</span>
                </button>
            </div>
        </div>

        <div v-else-if="hasSearched && searchResults.length === 0" class="w-full max-w-2xl text-center py-8">
            <Icon name="tabler:door-off" class="w-16 h-16 mx-auto text-gray-dark" />
            <p class="text-dark text-lg mt-4">No se encontraron consultorios</p>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useRooms } from '~/composables/useRooms.js'
import { useFloors } from '~/composables/useFloors.js'
import { useSpecializations } from '~/composables/useSpecializations.js'

const { rooms, fetchRooms } = useRooms()
const { floors, fetchFloors } = useFloors()
const { specializations, fetchSpecializations } = useSpecializations()

const searchQuery = ref('')
const selectedSector = ref('')
const selectedNumber = ref('')
const selectedSpecialty = ref('')
const selectedAvailability = ref('')
const filterDate = ref('')
const filterTime = ref('')

const searchResults = ref([])
const hasSearched = ref(false)

const isAvailableFree = computed(() => {
    return selectedAvailability.value === 'available'
})

// Watcher para auto-seleccionar "Ocupado" cuando se elige especialidad
watch(selectedSpecialty, (newValue) => {
    if (newValue) {
        selectedAvailability.value = 'occupied'
    }
})

// Watcher para limpiar especialidad cuando se marca "Libre"
watch(selectedAvailability, (newValue) => {
    if (newValue === 'available') {
        selectedSpecialty.value = ''
    }
})

const floorOptions = computed(() => {
    return floors.value.map(floor => ({
        value: floor.id,
        label: `Sector ${floor.name}`
    }))
})

const roomOptions = computed(() => {
    const availableRooms = selectedSector.value
        ? rooms.value.filter(room => room.floor_id === selectedSector.value)
        : rooms.value

    return availableRooms.map(room => ({
        value: room.id,
        label: room.name
    }))
})

const specialtyOptions = computed(() => {
    return specializations.value.map(spec => ({
        value: spec.id,
        label: spec.name
    }))
})

onMounted(async () => {
    try {
        await Promise.all([fetchRooms(), fetchFloors(), fetchSpecializations()])
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
        const sectorName = floor ? floor.name : 'desconocido'
        const displaySector = sectorName.length <= 3 ? `Sector ${sectorName}` : sectorName
        return {
            ...room,
            sector: displaySector
        }
    })
}

const handleOfficeClick = (id) => {
    navigateTo(ROUTE_NAMES.OFFICE_DETAIL(id))
}
</script>