import { WEEKDAYS } from '~/constants/WEEK_DAYS'
import { subtractLeavesFromAvailability, formatTime } from '~/utils/scheduleHelpers'

export const useDoctorSchedule = () => {
  const supabase = useSupabaseClient()

  const getDoctorWeeklySchedule = async (doctorId) => {
    // 1. Fetch recurring availability
    const { data: availability } = await supabase
      .from('recurring_availability')
      .select(`
        weekday,
        start_time,
        end_time,
        room:rooms ( id, name )
      `)
      .eq('doctor_id', doctorId)

    // 2. Fetch leave intervals
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('start_datetime, end_datetime')
      .eq('doctor_id', doctorId)

    const schedule = {}

    for (const row of availability) {
      const dayName = WEEKDAYS[row.weekday]

      const baseInterval = {
        start: row.start_time,
        end: row.end_time
      }

      // Leaves that affect this weekday
      const relevantLeaves = leaves
        .map(l => ({
          start: l.start_datetime,
          end: l.end_datetime
        }))
        .filter(l => {
          return new Date(l.start).getDay() === row.weekday ||
                 new Date(l.end).getDay() === row.weekday
        })

      const finalIntervals = subtractLeavesFromAvailability(
        baseInterval,
        relevantLeaves
      )

      if (!finalIntervals.length) continue

      if (!schedule[dayName]) {
        schedule[dayName] = []
      }

      for (const interval of finalIntervals) {
        schedule[dayName].push({
          start_time: formatTime(interval.start),
          end_time: formatTime(interval.end),
          room_id: row.room.id,
          room_name: row.room.name
        })
      }
    }

    return schedule
  }

  return {
    getDoctorWeeklySchedule
  }
}
