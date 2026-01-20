<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField
                v-model="formData.name"
                label="Nombre del Sector"
                id="name"
                placeholder="Ingrese el nombre del sector (ej: A, B, C)"
                required
                :error="errors.name"
            />

            <FormTextField
                v-model.number="formData.display_order"
                label="Orden de Visualización"
                id="display_order"
                placeholder="Ingrese el orden (ej: 0, 1, 2)"
                required
                type="number"
                :error="errors.display_order"
            />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 lg:gap-8 mt-3">
            <ButtonSecondary @click="$emit('cancel')" type="button">
                Cancelar
            </ButtonSecondary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Sector' : 'Crear Sector') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
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

const formData = reactive({
    name: '',
    display_order: 0
})

const errors = reactive({
    name: '',
    display_order: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            name: props.initialData.name || '',
            display_order: props.initialData.display_order ?? 0
        })
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.name.trim()) {
        errors.name = 'El nombre del sector es requerido'
        isValid = false
    } else if (formData.name.trim().length < 1) {
        errors.name = 'El nombre debe tener al menos 1 carácter'
        isValid = false
    }

    if (formData.display_order === '' || formData.display_order === null || formData.display_order === undefined) {
        errors.display_order = 'El orden de visualización es requerido'
        isValid = false
    } else if (typeof formData.display_order !== 'number' || formData.display_order < 0) {
        errors.display_order = 'El orden debe ser un número mayor o igual a 0'
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
        const floorData = {
            name: formData.name.trim(),
            display_order: formData.display_order
        }

        emit('submit', floorData)
    } catch (error) {
        console.error('Error in form submission:', error)
    } finally {
        submitting.value = false
    }
}
</script>