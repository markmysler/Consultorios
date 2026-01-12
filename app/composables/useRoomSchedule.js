import { WEEKDAY_NAMES } from '~/constants/WEEK_DAYS.js'

export const useRoomSchedule = () => {
  const supabase = useSupabaseClient()

  const getWeeklySchedule = async (roomId) => {
    const today = new Date().toISOString().split('T')[0]

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

    const schedule = {}

    for (const row of availability) {
      const daysArray = row.days_of_week || []

      for (const dayNum of daysArray) {
        const dayName = WEEKDAY_NAMES[dayNum]

        if (!dayName) continue

        if (!schedule[dayName]) {
          schedule[dayName] = []
        }

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
