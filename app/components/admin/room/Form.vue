<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField
                v-model="formData.name"
                label="Nombre del Consultorio"
                id="name"
                placeholder="Ingrese el nombre del consultorio"
                required
                :error="errors.name"
            />

            <FormSelect
                v-model="formData.floor_id"
                label="Sector"
                placeholder="Seleccione un sector"
                :options="floorOptions"
                :error="errors.floor_id"
                :loading="floorsLoading"
                required
            />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 lg:gap-8 mt-3">
            <ButtonSecondary @click="$emit('cancel')" type="button">
                Cancelar
            </ButtonSecondary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Consultorio' : 'Crear Consultorio') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useFloors } from '~/composables/useFloors.js'

const { error: showValidationError } = useNotification()

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit', 'cancel'])

const submitting = ref(false)

const { floors, loading: floorsLoading, fetchFloors } = useFloors()

const formData = reactive({
    name: '',
    floor_id: null
})

const errors = reactive({
    name: '',
    floor_id: ''
})

const floorOptions = computed(() => {
    return floors.value.map(floor => ({
        value: floor.id,
        label: floor.name
    }))
})

onMounted(async () => {
    await fetchFloors()

    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            name: props.initialData.name || '',
            floor_id: props.initialData.floor_id || null
        })
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.name.trim()) {
        errors.name = 'El nombre del consultorio es requerido'
        isValid = false
    } else if (formData.name.trim().length < 1) {
        errors.name = 'El nombre debe tener al menos 1 carácter'
        isValid = false
    }

    if (!formData.floor_id) {
        errors.floor_id = 'Debe seleccionar un sector'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        showValidationError('Por favor, completa todos los campos requeridos', {
            title: 'Validación incompleta'
        })
        return
    }

    submitting.value = true

    try {
        const roomData = {
            name: formData.name.trim(),
            floor_id: formData.floor_id
        }

        emit('submit', roomData)
    } catch (error) {
        console.error('Error in form submission:', error)
    } finally {
        submitting.value = false
    }
}
</script>