<template>
    <DefaultSection>
        <HeadingH1>Profesionales</HeadingH1>
        <ButtonPrimary @click="handleCreate">
            <Icon name="tabler:plus" class="w-5 h-5 mr-2" />
            Nuevo Profesional
        </ButtonPrimary>
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="doctors.length === 0" class="text-center py-12">
            <Icon name="tabler:users" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay profesionales disponibles</p>
        </div>

        <TableLayout v-else :data="doctors" :columns="tabla.columns"
            :empty-state-text="`No hay profesionales creados`" table-name="profesionales" :show-actions="true"
            :show-delete="true" @edit="handleEdit" @delete="handleDelete" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useDoctors } from '~/composables/useDoctors.js'

const { doctors, loading, fetchDoctors, deleteDoctor } = useDoctors()
const { success: showSuccess, error: showError } = useNotification()

const tabla = {
    columns: [
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'apellido',
            label: 'Apellido',
        },
        {
            key: 'especialidad',
            label: 'Especialidad',
        }
    ]
}

onMounted(async () => {
    try {
        await fetchDoctors()
    } catch (err) {
        console.error('Error loading doctors:', err)
    }
})

const handleCreate = () => {
    navigateTo(ROUTE_NAMES.ADMIN.CREATE_PROFESSIONAL)
}

const handleEdit = (doctor) => {
    navigateTo(ROUTE_NAMES.ADMIN.EDIT_PROFESSIONAL(doctor.id))
}

const handleDelete = async (doctor) => {
    try {
        await deleteDoctor(doctor.id)
        showSuccess('Profesional eliminado correctamente')
    } catch (err) {
        showError('Error al eliminar el profesional')
        console.error('Error deleting doctor:', err)
    }
}
</script>
