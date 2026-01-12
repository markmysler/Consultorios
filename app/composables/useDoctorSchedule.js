import { WEEKDAY_NAMES } from '~/constants/WEEK_DAYS.js'

export const useDoctorSchedule = () => {
  const supabase = useSupabaseClient()

  const getDoctorWeeklySchedule = async (doctorId) => {
    const today = new Date().toISOString().split('T')[0]

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
