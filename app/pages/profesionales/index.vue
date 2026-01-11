<template>
    <DefaultSection>
        <HeadingH2>Buscar por: Profesional</HeadingH2>

        <FormLayout @submit.prevent="handleSearch">
            <FormFieldsContainer>
                <FormTextField v-model="searchQuery" label="Nombre" placeholder="Buscar profesional..." id="search" />

                <FormSelect v-model="selectedSpecialty" label="Especialidad" placeholder="Seleccione una especialidad"
                    id="specialty" :options="specialtyOptions" clearable />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormCheckboxGroupField v-model="selectedShifts" label="Turno" id="shifts" :options="shiftOptions" />

                <div class="flex flex-col gap-2">
                    <FormLabel>Especificar horario laboral</FormLabel>
                    <div class="flex gap-4">
                        <FormLabel class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="specifySchedule" value="yes"
                                class="w-4 h-4 text-primary focus:ring-primary border-gray-300" />
                            <span class="text-dark">Sí</span>
                        </FormLabel>
                        <FormLabel class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" v-model="specifySchedule" value="no"
                                class="w-4 h-4 text-primary focus:ring-primary border-gray-300" />
                            <span class="text-dark">No</span>
                        </FormLabel>
                    </div>
                </div>
            </FormFieldsContainer>

            <FormFieldsContainer v-if="specifySchedule === 'yes'">
                <FormDateField v-model="scheduleDate" label="Fecha" id="schedule-date" />

                <FormTimeField v-model="scheduleTime" label="Hora" id="schedule-time" />
            </FormFieldsContainer>

            <ButtonPrimary type="submit">
                Buscar
            </ButtonPrimary>
        </FormLayout>

        <div v-if="searchResults.length > 0" class="w-full max-w-md lg:max-w-[56.25rem] flex flex-col gap-6 mt-8">
            <HeadingH2 class="text-center">Resultados</HeadingH2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
                <button v-for="professional in searchResults" :key="professional.id"
                    @click="handleProfessionalClick(professional.id)"
                    class="w-full flex items-center font-bold text-xs md:text-xl text-primary rounded-md shadow-md shadow-black/10 overflow-hidden">
                    <span class="w-1/3 bg-secondary py-2 lg:py-4 px-3">{{ professional.specialty }}</span>
                    <span class="w-2/3 bg-gray-dark py-2 lg:py-4 px-3">{{ professional.fullname }}</span>
                </button>
            </div>
        </div>

        <div v-else-if="hasSearched && searchResults.length === 0" class="w-full max-w-2xl text-center py-8">
            <Icon name="tabler:user-search" class="w-16 h-16 mx-auto text-gray-dark" />
            <p class="text-dark text-lg mt-4">No se encontraron profesionales</p>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useDoctors } from '~/composables/useDoctors.js'
import { useSpecializations } from '~/composables/useSpecializations.js'

const { doctors, fetchDoctors } = useDoctors()
const { specializations, fetchSpecializations } = useSpecializations()

const searchQuery = ref('')
const selectedSpecialty = ref('')
const selectedShifts = ref([])
const specifySchedule = ref('no')
const scheduleDate = ref('')
const scheduleTime = ref('')

const searchResults = ref([])
const hasSearched = ref(false)

const specialtyOptions = computed(() => {
    return specializations.value.map(spec => ({
        value: spec.id,
        label: spec.name
    }))
})

const shiftOptions = [
    { value: 'morning', label: 'Matutino' },
    { value: 'evening', label: 'Vespertino' }
]

onMounted(async () => {
    try {
        await Promise.all([fetchDoctors(), fetchSpecializations()])
    } catch (err) {
        console.error('Error loading doctors:', err)
    }
})

const handleSearch = async () => {
    hasSearched.value = true

    // Función helper para obtener la primera especialización o texto por defecto
    const getSpecialtyName = (doctor) => {
        if (doctor.doctor_specializations && doctor.doctor_specializations.length > 0) {
            const firstSpec = doctor.doctor_specializations[0]
            return firstSpec.specializations?.name || 'Sin especialidad'
        }
        return 'Sin especialidad'
    }

    // TODO: Implementar búsqueda real con filtros
    // Por ahora, mostramos todos los profesionales si hay query de búsqueda
    if (searchQuery.value.trim()) {
        searchResults.value = doctors.value.filter(doctor =>
            doctor.fullname?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            doctor.cuil?.includes(searchQuery.value)
        ).map(doctor => ({
            ...doctor,
            specialty: getSpecialtyName(doctor)
        }))
    } else {
        searchResults.value = doctors.value.map(doctor => ({
            ...doctor,
            specialty: getSpecialtyName(doctor)
        }))
    }
}

const handleProfessionalClick = (id) => {
    navigateTo(ROUTE_NAMES.PROFESSIONAL_DETAIL(id))
}
</script>
