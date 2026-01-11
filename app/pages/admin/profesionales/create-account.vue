<template>
    <DefaultSection>
        <HeadingH2>Crear Cuenta de Profesional</HeadingH2>

        <FormLayout @submit.prevent="handleSubmit">
            <FormFieldsContainer>
                <FormTextField 
                    v-model="formData.fullname" 
                    label="Nombre Completo" 
                    id="fullname"
                    placeholder="Ingrese el nombre completo" 
                    required 
                    :error="errors.fullname" 
                />
                
                <FormTextField 
                    v-model="formData.cuil" 
                    label="CUIL" 
                    id="cuil" 
                    placeholder="Ingrese el CUIL" 
                    required
                    :error="errors.cuil" 
                />

                <FormEmailField 
                    v-model="formData.email" 
                    label="Email" 
                    id="email"
                    placeholder="profesional@ejemplo.com" 
                    required 
                    :error="errors.email" 
                />

                <FormPasswordField 
                    v-model="formData.password" 
                    label="Contraseña" 
                    id="password"
                    placeholder="Mínimo 6 caracteres" 
                    required 
                    :error="errors.password" 
                />

                <FormPasswordField 
                    v-model="formData.confirmPassword" 
                    label="Confirmar Contraseña" 
                    id="confirmPassword"
                    placeholder="Repita la contraseña" 
                    required 
                    :error="errors.confirmPassword" 
                />

                <div class="w-full">
                    <FormLabel for="specializations">Especializaciones (Opcional)</FormLabel>
                    <select 
                        id="specializations"
                        v-model="formData.specializations"
                        multiple
                        class="w-full min-h-[100px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option 
                            v-for="spec in specializations" 
                            :key="spec.id" 
                            :value="spec.id"
                        >
                            {{ spec.name }}
                        </option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">Mantén presionado Ctrl/Cmd para seleccionar múltiples opciones</p>
                </div>

                <div v-if="filteredSubspecializations.length > 0" class="w-full">
                    <FormLabel for="subspecializations">Sub-especializaciones (Opcional)</FormLabel>
                    <select 
                        id="subspecializations"
                        v-model="formData.subspecializations"
                        multiple
                        class="w-full min-h-[100px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option 
                            v-for="subspec in filteredSubspecializations" 
                            :key="subspec.id" 
                            :value="subspec.id"
                        >
                            {{ subspec.name }}
                        </option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">Mantén presionado Ctrl/Cmd para seleccionar múltiples opciones</p>
                </div>
            </FormFieldsContainer>

            <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                    <Icon name="tabler:info-circle" class="inline w-4 h-4 mr-1" />
                    Esta funcionalidad crea una cuenta de usuario y un registro de profesional asociado. 
                    El usuario podrá iniciar sesión con el email y contraseña proporcionados.
                </p>
            </div>

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
    password: '',
    confirmPassword: '',
    specializations: [],
    subspecializations: []
})

const errors = reactive({
    fullname: '',
    cuil: '',
    email: '',
    password: '',
    confirmPassword: ''
})

// Fetch specializations and sub-specializations on mount
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

// Filter subspecializations based on selected specializations
const filteredSubspecializations = computed(() => {
    if (!formData.specializations || formData.specializations.length === 0) {
        return []
    }
    return subSpecializations.value.filter(subspec => 
        formData.specializations.includes(subspec.specialization_id)
    )
})

// Clear subspecializations when specializations change
watch(() => formData.specializations, (newSpecs, oldSpecs) => {
    if (newSpecs.length === 0) {
        formData.subspecializations = []
    } else {
        // Remove subspecializations that are no longer valid
        formData.subspecializations = formData.subspecializations.filter(subId => {
            const subspec = subspecializations.value.find(s => s.id === subId)
            return subspec && newSpecs.includes(subspec.specialization_id)
        })
    }
})

const validateForm = () => {
    // Reset errors
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    // Validate fullname
    if (!formData.fullname.trim()) {
        errors.fullname = 'El nombre completo es requerido'
        isValid = false
    } else if (formData.fullname.trim().length < 3) {
        errors.fullname = 'El nombre debe tener al menos 3 caracteres'
        isValid = false
    }

    // Validate CUIL
    if (!formData.cuil.trim()) {
        errors.cuil = 'El CUIL es requerido'
        isValid = false
    } else if (formData.cuil.trim().length < 8) {
        errors.cuil = 'El CUIL debe tener al menos 8 caracteres'
        isValid = false
    }

    // Validate email
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

    // Validate password
    if (!formData.password) {
        errors.password = 'La contraseña es requerida'
        isValid = false
    } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres'
        isValid = false
    }

    // Validate password confirmation
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
        
        // Redirect to professionals list
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
