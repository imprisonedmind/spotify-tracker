// lib/utils/formatters.ts

/**
 * Formats a number into a compact string (e.g., 1000 -> 1K, 1500000 -> 1.5M).
 * Gracefully handles non-numeric input.
 * @param num - The number to format.
 * @returns A formatted string or the original input if invalid.
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === null || num === undefined || typeof num !== "number") {
    return "0" // Or handle as needed, e.g., return '' or '-'
  }

  if (Math.abs(num) < 1000) {
    return num.toString()
  }

  const units = ["K", "M", "B", "T"] // Kilo, Million, Billion, Trillion
  let unitIndex = -1
  let formattedNum = num

  while (Math.abs(formattedNum) >= 1000 && unitIndex < units.length - 1) {
    formattedNum /= 1000
    unitIndex++
  }

  // Format to one decimal place if needed, remove trailing .0
  const value = formattedNum.toFixed(1).replace(/\.0$/, "")
  return `${value}${units[unitIndex]}`
}

/**
 * Formats milliseconds into a MM:SS duration string.
 * @param ms - Duration in milliseconds.
 * @returns A formatted duration string (e.g., "03:45").
 */
export function formatDuration(ms: number | undefined | null): string {
  if (ms === null || ms === undefined || typeof ms !== "number" || ms < 0) {
    return "0:00"
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // Pad seconds with leading zero if necessary
  const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString()

  return `${minutes}:${paddedSeconds}`
}