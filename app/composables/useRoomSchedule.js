import { WEEKDAY_NAMES } from '~/constants/WEEK_DAYS.js'

export const useRoomSchedule = () => {
  const supabase = useSupabaseClient()

  const getWeeklySchedule = async (roomId) => {
    const today = new Date().toISOString().split('T')[0]

    // 1. Fetch recurring availability for this room
    const { data: availability, error: availabilityError } = await supabase
      .from('recurring_availability')
      .select(`
        days_of_week,
        start_time,
        end_time,
        valid_to,
        doctors (
          id,
          fullname
        )
      `)
      .eq('room_id', roomId)
      .or(`valid_to.is.null,valid_to.gte.${today}`)

    if (availabilityError) {
      console.error('[useRoomSchedule] availability error', availabilityError)
      return {}
    }

    if (!availability?.length) return {}

    // 2. Build weekly schedule
    const schedule = {}

    for (const row of availability) {
      // days_of_week es un array de números [1, 2, 3] donde 1=Lunes, 7=Domingo
      const daysArray = row.days_of_week || []

      for (const dayNum of daysArray) {
        const dayName = WEEKDAY_NAMES[dayNum]

        if (!dayName) continue // Skip invalid day numbers

        if (!schedule[dayName]) {
          schedule[dayName] = []
        }

        // Por ahora sin filtrar por licencias - simplificado
        schedule[dayName].push({
          start_time: row.start_time,
          end_time: row.end_time,
          doctor_id: row.doctors?.id,
          doctor_cuil: row.doctors?.id,
          doctor_name: row.doctors?.fullname
        })
      }
    }

    return schedule
  }

  return {
    getWeeklySchedule
  }
}
