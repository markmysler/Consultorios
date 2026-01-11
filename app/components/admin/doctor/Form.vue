<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.fullname" label="Nombre Completo" id="fullname"
                placeholder="Ingrese el nombre completo" required :error="errors.fullname" />
            <FormTextField v-model="formData.cuil" label="CUIL" id="cuil" placeholder="Ingrese el CUIL" required
                :error="errors.cuil" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 lg:gap-8 mt-3">
            <ButtonSecondary @click="$emit('cancel')" type="button">
                Cancelar
            </ButtonSecondary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Profesional' :
                'Crear Profesional') }}
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
    cuil: '',
    fullname: ''
})

const errors = reactive({
    cuil: '',
    fullname: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            cuil: props.initialData.cuil || '',
            fullname: props.initialData.fullname || ''
        })
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.cuil.trim()) {
        errors.cuil = 'El CUIL es requerido'
        isValid = false
    } else if (formData.cuil.trim().length < 8) {
        errors.cuil = 'El CUIL debe tener al menos 8 caracteres'
        isValid = false
    }

    if (!formData.fullname.trim()) {
        errors.fullname = 'El nombre completo es requerido'
        isValid = false
    } else if (formData.fullname.trim().length < 3) {
        errors.fullname = 'El nombre debe tener al menos 3 caracteres'
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
        const doctorData = {
            cuil: formData.cuil.trim(),
            fullname: formData.fullname.trim()
        }

        emit('submit', doctorData)
    } catch (error) {
        console.error('Error in form submission:', error)
    } finally {
        submitting.value = false
    }
}
</script>