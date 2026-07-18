export function kelvinToCelsius(k: number): number {
  return Math.round((k - 273.15) * 100) / 100
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32
}

export function metersToFeet(m: number): number {
  return m * 3.28084
}

export function barToPsi(bar: number): number {
  return bar * 14.5038
}

/** Great-circle distance in meters between two lat/lon points. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusM = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  return 2 * earthRadiusM * Math.asin(Math.sqrt(a))
}
