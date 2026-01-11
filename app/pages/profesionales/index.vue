<template>
    <DefaultSection>
        <HeadingH1>Buscar por: Profesional</HeadingH1>

        <div class="w-full max-w-2xl space-y-6">
            <div>
                <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre, Apellido, CUIL
                </label>
                <div class="relative">
                    <Icon name="tabler:search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                        id="search"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Buscar profesional..."
                        class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-dark"
                    />
                </div>
            </div>

            <div>
                <button
                    @click="showSpecialty = !showSpecialty"
                    class="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-dark font-medium"
                >
                    <span>Especialidad</span>
                    <Icon :name="showSpecialty ? 'tabler:minus' : 'tabler:plus'" class="w-5 h-5 text-primary" />
                </button>

                <div v-if="showSpecialty" class="mt-3">
                    <select
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
            </div>

            <div>
                <button
                    @click="showShift = !showShift"
                    class="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-dark font-medium"
                >
                    <span>Turno</span>
                    <Icon :name="showShift ? 'tabler:minus' : 'tabler:plus'" class="w-5 h-5 text-primary" />
                </button>

                <div v-if="showShift" class="mt-3 flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="shiftMorning"
                            class="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span class="text-dark">Matutino</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            v-model="shiftEvening"
                            class="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span class="text-dark">Vespertino</span>
                    </label>
                </div>
            </div>

            <div>
                <button
                    @click="showSchedule = !showSchedule"
                    class="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg text-dark font-medium"
                >
                    <span>Especificar horario laboral</span>
                    <Icon :name="showSchedule ? 'tabler:minus' : 'tabler:plus'" class="w-5 h-5 text-primary" />
                </button>

                <div v-if="showSchedule" class="mt-3 space-y-3">
                    <div class="flex gap-3 items-center">
                        <label class="flex items-center gap-2">
                            <input
                                type="radio"
                                v-model="specifySchedule"
                                value="yes"
                                class="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span class="text-dark">Sí</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input
                                type="radio"
                                v-model="specifySchedule"
                                value="no"
                                class="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span class="text-dark">No</span>
                        </label>
                    </div>

                    <div v-if="specifySchedule === 'yes'" class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm text-gray-700 mb-1">Fecha</label>
                            <div class="relative">
                                <Icon name="tabler:calendar" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <input
                                    type="date"
                                    v-model="scheduleDate"
                                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-dark"
                                />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm text-gray-700 mb-1">Hora</label>
                            <div class="relative">
                                <Icon name="tabler:clock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <input
                                    type="time"
                                    v-model="scheduleTime"
                                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-dark"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ButtonPrimary @click="handleSearch" class="w-full">
                Buscar
            </ButtonPrimary>

            <div v-if="searchResults.length > 0" class="space-y-3 mt-8">
                <HeadingH2>Resultados</HeadingH2>

                <button
                    v-for="professional in searchResults"
                    :key="professional.id"
                    @click="handleProfessionalClick(professional.id)"
                    class="w-full bg-secondary hover:bg-primary hover:text-light text-primary rounded-lg p-4 transition duration-300 flex items-center justify-between"
                >
                    <div class="text-left">
                        <p class="font-bold">{{ professional.specialty }}</p>
                        <p class="font-medium">{{ professional.fullname }}</p>
                    </div>
                    <Icon name="tabler:chevron-right" class="w-6 h-6" />
                </button>
            </div>

            <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-8">
                <Icon name="tabler:user-search" class="w-16 h-16 mx-auto text-gray-dark" />
                <p class="text-dark text-lg mt-4">No se encontraron profesionales</p>
            </div>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useDoctors } from '~/composables/useDoctors.js'

const { doctors, fetchDoctors } = useDoctors()

const searchQuery = ref('')
const selectedSpecialty = ref('')
const shiftMorning = ref(false)
const shiftEvening = ref(false)
const specifySchedule = ref('no')
const scheduleDate = ref('')
const scheduleTime = ref('')

const showSpecialty = ref(false)
const showShift = ref(false)
const showSchedule = ref(false)

const searchResults = ref([])
const hasSearched = ref(false)

onMounted(async () => {
    try {
        await fetchDoctors()
    } catch (err) {
        console.error('Error loading doctors:', err)
    }
})

const handleSearch = async () => {
    hasSearched.value = true

    // TODO: Implementar búsqueda real con filtros
    // Por ahora, mostramos todos los profesionales si hay query de búsqueda
    if (searchQuery.value.trim()) {
        searchResults.value = doctors.value.filter(doctor =>
            doctor.fullname?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            doctor.cull?.includes(searchQuery.value)
        ).map(doctor => ({
            ...doctor,
            specialty: 'Pediatría' // TODO: Obtener especialidad real
        }))
    } else {
        searchResults.value = doctors.value.map(doctor => ({
            ...doctor,
            specialty: 'Pediatría' // TODO: Obtener especialidad real
        }))
    }
}

const handleProfessionalClick = (id) => {
    navigateTo(ROUTE_NAMES.PROFESSIONAL_DETAIL(id))
}
</script>
