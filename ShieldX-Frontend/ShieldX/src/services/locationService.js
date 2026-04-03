const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

function toLocationOption(item) {
  const address = item?.address || {}
  const city = address.city || address.town || address.village || address.hamlet || ''
  const zoneParts = [address.suburb, address.neighbourhood, address.county, city].filter(Boolean)
  const zone = zoneParts.join('-').toUpperCase().replace(/\s+/g, '-') || 'DEFAULT-ZONE'

  return {
    label: item.display_name,
    city: city || 'Unknown City',
    zone,
    lat: Number(item.lat),
    lon: Number(item.lon),
  }
}

export async function searchLocations(query) {
  if (!query || query.trim().length < 3) {
    return []
  }

  const response = await fetch(
    `${NOMINATIM_BASE}/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query.trim())}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error('Unable to fetch location suggestions right now.')
  }

  const payload = await response.json()
  return payload.map(toLocationOption)
}

export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported in this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      () => reject(new Error('Could not access your current location. Allow location permission and retry.')),
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  })
}

export async function reverseGeocode(lat, lon) {
  const response = await fetch(
    `${NOMINATIM_BASE}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lon}`,
    {
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error('Unable to resolve your current location. Please try again.')
  }

  const payload = await response.json()
  return toLocationOption(payload)
}

export function openNavigationTarget(value) {
  const target = String(value || '').trim()
  if (!target) {
    return
  }
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(target)}`, '_blank', 'noopener,noreferrer')
}
