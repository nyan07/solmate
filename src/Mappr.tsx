import React from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'

const containerStyle = {
  width: '100vw',
  height: '100vh',
}

// Centro de Berlim
const center = {
  lat: 52.5200,
  lng: 13.4050,
}

function generateRandomPins(center, count: number, radius = 0.005) {
  return Array.from({ length: count }, () => ({
    lat: center.lat + Math.random() * radius * 3, 
    lng: center.lng + (Math.random() - 0.5) * radius * 2,
  }))
}

const pins = generateRandomPins(center, 6)

function Mappr() {
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
      }}
    >
      {pins.map((pin, index) => (
        <Marker key={index} position={pin} onClick={() => navigate('/places/1')} />
      ))}
    </GoogleMap>
  ) : (
    <></>
  )
}

export default React.memo(Mappr)
