/**
 * Shared schedule helpers for doctor and room schedules
 */

/**
 * Subtract a leave interval from an availability interval
 * Returns an array of remaining availability segments
 */
export const subtractInterval = (availability, leave) => {
  const aStart = availability.start
  const aEnd = availability.end
  const lStart = leave.start
  const lEnd = leave.end

  // No overlap
  if (lEnd <= aStart || lStart >= aEnd) {
    return [availability]
  }

  // Fully covered
  if (lStart <= aStart && lEnd >= aEnd) {
    return []
  }

  const result = []

  // Trim start
  if (lStart > aStart) {
    result.push({ start: aStart, end: lStart })
  }

  // Trim end
  if (lEnd < aEnd) {
    result.push({ start: lEnd, end: aEnd })
  }

  return result
}

/**
 * Subtract multiple leave intervals from an availability interval
 * Returns an array of remaining availability segments
 */
export const subtractLeavesFromAvailability = (availability, leaves) => {
  let segments = [availability]

  for (const leave of leaves) {
    segments = segments.flatMap(segment =>
      subtractInterval(segment, leave)
    )
  }

  return segments
}

/**
 * Format time strings to HH:MM format
 */
export const formatTime = (timeString) => {
  return timeString.slice(0, 5)
}
