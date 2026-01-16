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
                    <span class="min-w-[8.25rem] md:min-w-52 flex-shrink-0 bg-secondary py-2 lg:py-4 px-3 whitespace-nowrap">{{ professional.specialty }}</span>
                    <span class="flex-1 bg-gray-dark py-2 lg:py-4 px-3 whitespace-nowrap overflow-hidden text-ellipsis">{{ professional.fullname }}</span>
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
const { shifts, fetchShifts } = useShifts()

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

const shiftOptions = computed(() => {
    if (!shifts.value || shifts.value.length === 0) {
        return []
    }
    return shifts.value.map(shift => ({
        value: shift.id,
        label: shift.name
    }))
})

onMounted(async () => {
    try {
        await Promise.all([fetchDoctors(), fetchSpecializations(), fetchShifts()])
    } catch (err) {
        console.error('Error loading data:', err)
    }
})

const handleSearch = async () => {
    hasSearched.value = true
    const supabase = useSupabaseClient()

    const getSpecialtyName = (doctor) => {
        if (doctor.doctor_specializations && doctor.doctor_specializations.length > 0) {
            const firstSpec = doctor.doctor_specializations[0]
            return firstSpec.specializations?.name || 'Sin especialidad'
        }
        return 'Sin especialidad'
    }

    // Prepare filter parameters
    const filters = {
        p_search_query: searchQuery.value.trim() || null,
        p_specialty_id: selectedSpecialty.value || null,
        p_shift_ids: (selectedShifts.value && selectedShifts.value.length > 0) ? selectedShifts.value : null,
        p_day_of_week: null,
        p_time: null,
        p_date: null
    }

    // Add schedule filters ONLY if BOTH date and time are specified
    if (specifySchedule.value === 'yes' && scheduleDate.value && scheduleTime.value) {
        const date = new Date(scheduleDate.value)
        // Convert JS day (0=Sun, 1=Mon, ..., 6=Sat) to DB day (1=Mon, ..., 7=Sun)
        filters.p_day_of_week = date.getDay() + 1
        filters.p_time = scheduleTime.value
        filters.p_date = scheduleDate.value // Pass date for leave request checking
    }
    // Call the Postgres function
    const { data, error } = await supabase.rpc('search_doctors', filters)

    if (error) {
        console.error('Error searching doctors:', error)
        searchResults.value = []
        return
    }

    searchResults.value = (data || []).map(doctor => ({
        ...doctor,
        specialty: getSpecialtyName(doctor)
    }))
}

const handleProfessionalClick = (id) => {
    navigateTo(ROUTE_NAMES.PROFESSIONAL_DETAIL(id))
}
</script>
