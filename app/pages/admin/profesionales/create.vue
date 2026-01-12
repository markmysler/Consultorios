<template>
    <DefaultSection>
        <HeadingH2>Crear Cuenta de Profesional</HeadingH2>
        <FormLayout @submit.prevent="handleSubmit">
            <div class="w-full flex flex-col">
                <p class="text-sm lg:text-base">Esta funcionalidad crea una cuenta de usuario y un registro de profesional asociado. El usuario podrá
                    iniciar sesión con el email y contraseña proporcionados.</p>
            </div>
            <FormFieldsContainer>
                <FormTextField v-model="formData.fullname" label="Nombre Completo" id="fullname"
                    placeholder="Ingrese el nombre completo" required :error="errors.fullname" />

                <FormEmailField v-model="formData.email" label="Email" id="email" placeholder="profesional@ejemplo.com"
                    required :error="errors.email" />
            </FormFieldsContainer>

            <FormFieldsContainer>
                <FormPasswordField v-model="formData.password" label="Contraseña" id="password"
                    placeholder="Escriba una contraseña" required :error="errors.password" />

                <FormPasswordField v-model="formData.confirmPassword" label="Confirmar Contraseña" id="confirmPassword"
                    placeholder="Repita la contraseña" required :error="errors.confirmPassword" />
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
            <div class="w-full flex flex-col lg:flex-row items-center gap-5 lg:gap-8 mt-6">
                <ButtonSecondary @click="handleCancel" type="button">
                    Cancelar
                </ButtonSecondary>

                <ButtonPrimary type="submit" :disabled="submitting">
                    <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                    {{ submitting ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </ButtonPrimary>
            </div>
        </FormLayout>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

definePageMeta({
    middleware: 'admin'
})

const { success: showSuccess, error: showError } = useNotification()
const router = useRouter()

const { specializations, fetchSpecializations } = useSpecializations()
const { subSpecializations, fetchSubSpecializations } = useSubSpecializations()

const submitting = ref(false)

const formData = reactive({
    fullname: '',
    cuil: '',
    email: '',
    turno: '',
    password: '',
    confirmPassword: '',
    specializations: [],
    subspecializations: []
})

const errors = reactive({
    fullname: '',
    cuil: '',
    email: '',
    turno: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.fullname.trim()) {
        errors.fullname = 'El nombre completo es requerido'
        isValid = false
    } else if (formData.fullname.trim().length < 3) {
        errors.fullname = 'El nombre debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!formData.cuil.trim()) {
        errors.cuil = 'El CUIL es requerido'
        isValid = false
    } else if (formData.cuil.trim().length < 8) {
        errors.cuil = 'El CUIL debe tener al menos 8 caracteres'
        isValid = false
    }

    if (!formData.email.trim()) {
        errors.email = 'El email es requerido'
        isValid = false
    } else {
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

    if (!formData.password) {
        errors.password = 'La contraseña es requerida'
        isValid = false
    } else if (formData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres'
        isValid = false
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'La contraseña debe contener al menos una letra mayúscula'
        isValid = false
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'La contraseña debe contener al menos una letra minúscula'
        isValid = false
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'La contraseña debe contener al menos un número'
        isValid = false
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        errors.password = 'La contraseña debe contener al menos un carácter especial'
        isValid = false
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Debe confirmar la contraseña'
        isValid = false
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        showError('Por favor, completa todos los campos correctamente', {
            title: 'Validación incompleta'
        })
        return
    }

    submitting.value = true

    try {
        const { data, error } = await $fetch('/api/admin/create-doctor-user', {
            method: 'POST',
            body: {
                fullname: formData.fullname.trim(),
                cuil: formData.cuil.trim(),
                email: formData.email.trim().toLowerCase(),
                shift: formData.turno.toLowerCase(),
                password: formData.password,
                specializations: formData.specializations.length > 0 ? formData.specializations : undefined,
                subspecializations: formData.subspecializations.length > 0 ? formData.subspecializations : undefined
            }
        })

        if (error) {
            throw new Error(error)
        }

        showSuccess('Cuenta de profesional creada exitosamente', {
            title: 'Éxito'
        })

        router.push(ROUTE_NAMES.ADMIN.PROFESSIONALS)
    } catch (err) {
        console.error('Error creating doctor user:', err)
        showError(err.data?.statusMessage || err.message || 'Error al crear la cuenta del profesional', {
            title: 'Error',
            duration: 5000
        })
    } finally {
        submitting.value = false
    }
}

const handleCancel = () => {
    router.push(ROUTE_NAMES.ADMIN.PROFESSIONALS)
}
</script>
