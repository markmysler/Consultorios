export const useDoctorSchedule = () => {
  const supabase = useSupabaseClient()

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  const getDoctorWeeklySchedule = async (doctorId) => {
    const today = new Date().toISOString().split('T')[0]

    // 1. Fetch recurring availability
    const { data: availability, error: availError } = await supabase
      .from('recurring_availability')
      .select(`
        days_of_week,
        start_time,
        end_time,
        valid_to,
        rooms ( id, name, floors ( id, name ) )
      `)
      .eq('doctor_id', doctorId)
      .or(`valid_to.is.null,valid_to.gte.${today}`)

    if (availError) {
      console.error('Error fetching availability:', availError)
      return {}
    }

    if (!availability || availability.length === 0) {
      return {}
    }

    const schedule = {}

    for (const row of availability) {
      // days_of_week es un array de números [1, 2, 3]
      const daysArray = row.days_of_week || []

      for (const dayNum of daysArray) {
        const dayName = dayNames[dayNum]

        if (!schedule[dayName]) {
          schedule[dayName] = []
        }

        // Por ahora sin filtrar por licencias - simplificado
        schedule[dayName].push({
          start_time: row.start_time,
          end_time: row.end_time,
          room_id: row.rooms?.id,
          room_name: row.rooms?.name,
          floor_id: row.rooms?.floors?.id,
          floor_name: row.rooms?.floors?.name
        })
      }
    }

    return schedule
  }

  return {
    getDoctorWeeklySchedule
  }
}
