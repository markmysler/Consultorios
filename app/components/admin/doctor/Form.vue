<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.fullname" label="Nombre Completo" id="fullname"
                placeholder="Ingrese el nombre completo" required :error="errors.fullname" />
            <FormEmailField v-model="formData.email" label="Email" id="email" placeholder="profesional@ejemplo.com"
                required :error="errors.email" :disabled="isEditing" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.cuil" label="CUIL" id="cuil" placeholder="Ingrese el CUIL" required
                :error="errors.cuil" />
            <FormSelect v-model="formData.turno" label="Turno" id="turno"
                placeholder="Seleccione un turno" required :error="errors.turno"
                :options="[
                    { value: 'Matutino', label: 'Matutino' },
                    { value: 'Vespertino', label: 'Vespertino' }
                ]" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSelectMultiple v-model="formData.specializations" label="Especializaciones (Opcional)"
                id="specializations" placeholder="Seleccione especializaciones" :options="specializationOptions"
                :loading="!specializations.length" />

            <FormSelectMultiple v-model="formData.subspecializations" label="Sub-especializaciones (Opcional)"
                id="subspecializations" placeholder="Seleccione sub-especializaciones"
                :options="filteredSubspecializationOptions" :loading="false" />
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
const { specializations, fetchSpecializations } = useSpecializations()
const { subSpecializations, fetchSubSpecializations } = useSubSpecializations()

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
    fullname: '',
    email: '',
    turno: '',
    specializations: [],
    subspecializations: []
})

const errors = reactive({
    cuil: '',
    fullname: '',
    email: '',
    turno: ''
})

onMounted(async () => {
    try {
        await Promise.all([
            fetchSpecializations(),
            fetchSubSpecializations()
        ])
    } catch (err) {
        console.error('Error loading specializations:', err)
    }

    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            cuil: props.initialData.cuil || '',
            fullname: props.initialData.fullname || '',
            email: props.initialData.email || '',
            turno: props.initialData.shift ? (props.initialData.shift.charAt(0).toUpperCase() + props.initialData.shift.slice(1)) : '',
            specializations: props.initialData.doctor_specializations?.map(ds => ds.specialization_id) || [],
            subspecializations: props.initialData.doctor_sub_specializations?.map(dss => dss.sub_specialization_id) || []
        })
    }
})

const specializationOptions = computed(() => {
    return specializations.value.map(spec => ({
        value: spec.id.toString(),
        label: spec.name
    }))
})

const filteredSubspecializationOptions = computed(() => {
    if (!formData.specializations || formData.specializations.length === 0) {
        return []
    }

    const selectedSpecIds = formData.specializations

    const filtered = subSpecializations.value.filter(subspec => {
        return selectedSpecIds.includes(subspec.specialization_id)
    })

    return filtered.map(subspec => ({
        value: subspec.id.toString(),
        label: subspec.name
    }))
})

watch(() => formData.specializations, (newSpecs) => {
    if (newSpecs.length === 0) {
        formData.subspecializations = []
    } else {
        formData.subspecializations = formData.subspecializations.filter(subId => {
            const subspec = subSpecializations.value.find(s => s.id.toString() === subId)
            return subspec && newSpecs.includes(subspec.specialization_id)
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

    if (!props.isEditing && !formData.email.trim()) {
        errors.email = 'El email es requerido'
        isValid = false
    } else if (!props.isEditing) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            errors.email = 'Formato de email inválido'
            isValid = false
        }
    }

    if (!formData.turno) {
        errors.turno = 'El turno es requerido'
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
            fullname: formData.fullname.trim(),
            shift: formData.turno.toLowerCase(),
            specializations: formData.specializations.length > 0 ? formData.specializations : undefined,
            subspecializations: formData.subspecializations.length > 0 ? formData.subspecializations : undefined
        }

        if (!props.isEditing && formData.email) {
            doctorData.email = formData.email.trim().toLowerCase()
        }

        emit('submit', doctorData)
    } catch (error) {
        console.error('Error in form submission:', error)
    } finally {
        submitting.value = false
    }
}
</script>