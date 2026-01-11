import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Get the authenticated user
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autenticado'
      })
    }

    // Check if the user is an admin
    const supabase = await serverSupabaseClient(event)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.sub)
      .single()
    if (profileError || profile?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para realizar esta acción 2'
      })
    }

    // Get request body
    const body = await readBody(event)
    const { fullname, email, password, cuil, specializations, subspecializations } = body

    // Validate required fields
    if (!fullname || !email || !password || !cuil) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan campos requeridos: fullname, email, password, cuil'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Formato de email inválido'
      })
    }

    // Validate password length
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    // Use service role client to create the user (bypasses RLS)
    const supabaseAdmin = await serverSupabaseServiceRole(event)

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        fullname
      }
    })

    if (authError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Error al crear el usuario: ${authError.message}`
      })
    }

    const userId = authData.user.id

    try {
      // 2. Create doctor record
      const { data: doctorData, error: doctorError } = await supabaseAdmin
        .from('doctors')
        .insert({
          fullname,
          cuil
        })
        .select('id')
        .single()

      if (doctorError) {
        throw new Error(`Error al crear el doctor: ${doctorError.message}`)
      }

      const doctorId = doctorData.id

      // 3. Create user_profile (role: doctor by default) with doctor_id
      const { error: profileInsertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: userId,
          role: 'doctor',
          doctor_id: doctorId
        })

      if (profileInsertError) {
        throw new Error(`Error al crear el perfil: ${profileInsertError.message}`)
      }

      // 4. Create doctor_specializations if provided
      if (specializations && Array.isArray(specializations) && specializations.length > 0) {
        const specializationsData = specializations.map(specId => ({
          doctor_id: doctorId,
          specialization_id: specId
        }))

        const { error: specError } = await supabaseAdmin
          .from('doctor_specializations')
          .insert(specializationsData)

        if (specError) {
          console.error('Error creating specializations:', specError)
          // Don't throw - continue even if specializations fail
        }
      }

      // 5. Create doctor_subspecializations if provided
      if (subspecializations && Array.isArray(subspecializations) && subspecializations.length > 0) {
        const subspecializationsData = subspecializations.map(subSpecId => ({
          doctor_id: doctorId,
          sub_specialization_id: subSpecId
        }))


        const { error: subSpecError } = await supabaseAdmin
          .from('doctor_sub_specializations')
          .insert(subspecializationsData)

        if (subSpecError) {
          console.error('Error creating subspecializations:', subSpecError)
          // Don't throw - continue even if subspecializations fail
        }
      }

      // Return success with created data
      return {
        success: true,
        data: {
          userId,
          doctorId,
          email,
          fullname
        }
      }

    } catch (error) {
      // If anything fails after user creation, delete the auth user to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw error
    }

  } catch (error) {
    console.error('Error in create-doctor-user:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor'
    })
  }
})
