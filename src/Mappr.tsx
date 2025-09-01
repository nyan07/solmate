import React from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import { useGeolocation } from './hooks/useGeolocation'
import { useNearbyPlaces } from './places/hooks/useNearbyPlaces'

const containerStyle = {
  width: '100vw',
  height: '100vh',
}

function Mappr() {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const { data: places } = useNearbyPlaces(location);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  return isLoaded && places && location ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={new google.maps.LatLng(location.lat, location.lng)}
      zoom={14}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
      }}
    >
      {places.map((place) => (
        <Marker key={place.id} position={place.location} onClick={() => navigate('/places/1')} />
      ))}
    </GoogleMap>
  ) : (
    <></>
  )
}

export default React.memo(Mappr)
