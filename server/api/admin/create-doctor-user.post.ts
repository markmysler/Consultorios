import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { fullname, cuil, email, shifts, password, specializations, subspecializations } = body

  // Validate required fields
  if (!fullname || !cuil || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Faltan campos requeridos: fullname, cuil, email, password'
    })
  }

  if (!shifts || shifts.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debe seleccionar al menos un turno'
    })
  }

  try {
    // Get the service role client for admin operations
    const supabaseAdmin = serverSupabaseServiceRole(event)

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        fullname,
        role: 'doctor'
      }
    })

    if (authError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Error al crear usuario de autenticación: ${authError.message}`
      })
    }

    const userId = authData.user.id

    // 2. Create the user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        role: 'doctor'
      } as any)

    if (profileError) {
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw createError({
        statusCode: 500,
        statusMessage: `Error al crear perfil de usuario: ${profileError.message}`
      })
    }

    // 3. Create the doctor record
    const { data: doctorData, error: doctorError } = await supabaseAdmin
      .from('doctors')
      .insert({
        id: userId,
        fullname,
        cuil
      } as any)
      .select()
      .single()

    if (doctorError) {
      // Rollback: delete user profile and auth user
      await supabaseAdmin.from('user_profiles').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw createError({
        statusCode: 500,
        statusMessage: `Error al crear registro de doctor: ${doctorError.message}`
      })
    }

    const doctorId = doctorData["id"]

    // 4. Create doctor_shifts relationships
    if (shifts && shifts.length > 0) {
      const shiftsData = shifts.map((shiftId: string) => ({
        doctor_id: doctorId,
        shift_id: shiftId
      }))

      const { error: shiftsError } = await supabaseAdmin
        .from('doctor_shifts')
        .insert(shiftsData)

      if (shiftsError) {
        // Rollback: delete doctor, user profile, and auth user
        await supabaseAdmin.from('doctors').delete().eq('id', doctorId)
        await supabaseAdmin.from('user_profiles').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw createError({
          statusCode: 500,
          statusMessage: `Error al crear turnos del doctor: ${shiftsError.message}`
        })
      }
    }

    // 5. Create doctor_specializations relationships (optional)
    if (specializations && specializations.length > 0) {
      const specializationsData = specializations.map((specId: string) => ({
        doctor_id: doctorId,
        specialization_id: specId
      }))

      const { error: specsError } = await supabaseAdmin
        .from('doctor_specializations')
        .insert(specializationsData)

      if (specsError) {
        // Rollback everything
        await supabaseAdmin.from('doctor_shifts').delete().eq('doctor_id', doctorId)
        await supabaseAdmin.from('doctors').delete().eq('id', doctorId)
        await supabaseAdmin.from('user_profiles').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw createError({
          statusCode: 500,
          statusMessage: `Error al crear especializaciones del doctor: ${specsError.message}`
        })
      }
    }

    // 6. Create doctor_sub_specializations relationships (optional)
    if (subspecializations && subspecializations.length > 0) {
      const subspecializationsData = subspecializations.map((subSpecId: string) => ({
        doctor_id: doctorId,
        sub_specialization_id: subSpecId
      }))

      const { error: subSpecsError } = await supabaseAdmin
        .from('doctor_sub_specializations')
        .insert(subspecializationsData)

      if (subSpecsError) {
        // Rollback everything
        await supabaseAdmin.from('doctor_specializations').delete().eq('doctor_id', doctorId)
        await supabaseAdmin.from('doctor_shifts').delete().eq('doctor_id', doctorId)
        await supabaseAdmin.from('doctors').delete().eq('id', doctorId)
        await supabaseAdmin.from('user_profiles').delete().eq('id', userId)
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw createError({
          statusCode: 500,
          statusMessage: `Error al crear subespecializaciones del doctor: ${subSpecsError.message}`
        })
      }
    }

    // Return success response
    return {
      success: true,
      data: {
        userId,
        doctorId,
        email,
        fullname
      }
    }
  } catch (error: any) {
    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Otherwise, create a generic error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor'
    })
  }
})
