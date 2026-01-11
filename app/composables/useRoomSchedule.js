import { WEEKDAYS } from '~/constants/WEEK_DAYS'
import { subtractLeavesFromAvailability, formatTime } from '~/utils/scheduleHelpers'

export const useRoomSchedule = () => {
  const supabase = useSupabaseClient()

  /* -----------------------------------------
   * Main API
   * --------------------------------------- */
  const getWeeklySchedule = async (roomId) => {
    /**
     * 1️⃣ Fetch recurring availability for this room
     */
    const { data: availability, error: availabilityError } = await supabase
      .from('recurring_availability')
      .select(`
        weekday,
        start_time,
        end_time,
        doctor:doctors (
          cuil,
          fullname
        )
      `)
      .eq('room_id', roomId)

    if (availabilityError) {
      console.error('[useRoomSchedule] availability error', availabilityError)
      return {}
    }

    if (!availability?.length) return {}

    /**
     * 2️⃣ Fetch leaves for involved doctors
     */
    const doctorCuils = [
      ...new Set(availability.map(a => a.doctor.cuil))
    ]

    const { data: leaves, error: leaveError } = await supabase
      .from('leave_requests')
      .select('doctor_id, start_datetime, end_datetime')
      .in('doctor_id', doctorCuils)

    if (leaveError) {
      console.error('[useRoomSchedule] leave error', leaveError)
      return {}
    }

    /**
     * 3️⃣ Build weekly schedule
     */
    const schedule = {}

    for (const row of availability) {
      const dayName = WEEKDAYS[row.weekday]

      const baseInterval = {
        start: row.start_time,
        end: row.end_time
      }

      // Leaves affecting this doctor on this weekday
      const relevantLeaves = leaves
        .filter(l => l.doctor_id === row.doctor.cuil)
        .map(l => ({
          start: l.start_datetime,
          end: l.end_datetime
        }))
        .filter(l => {
          const startDay = new Date(l.start).getDay()
          const endDay = new Date(l.end).getDay()
          return startDay === row.weekday || endDay === row.weekday
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
          doctor_id: row.doctor.cuil,
          doctor_cuil: row.doctor.cuil,
          doctor_name: row.doctor.fullname
        })
      }
    }

    return schedule
  }

  return {
    getWeeklySchedule
  }
}
