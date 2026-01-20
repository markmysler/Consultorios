export const subtractInterval = (availability, leave) => {
  const aStart = availability.start
  const aEnd = availability.end
  const lStart = leave.start
  const lEnd = leave.end

  if (lEnd <= aStart || lStart >= aEnd) {
    return [availability]
  }

  if (lStart <= aStart && lEnd >= aEnd) {
    return []
  }

  const result = []

  if (lStart > aStart) {
    result.push({ start: aStart, end: lStart })
  }

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
