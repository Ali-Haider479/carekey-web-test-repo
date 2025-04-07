// React Imports
import { useRef, useEffect } from 'react'

// Third-party Imports
import { Map, Marker } from 'react-map-gl'
import type { MapRef } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Types Imports
import type { viewStateType } from './index'

// Style Imports
import './styles.css'

type Props = {
  viewState: viewStateType
  carIndex: number | false
  geojson: {
    type: string
    features: {
      type: string
      geometry: {
        type: string
        coordinates: [number, number] // Updated to match GeoJSON standard
      }
      properties: {
        id: string
        caregiverName: string
        clientName: string
      }
    }[]
  }
  mapboxAccessToken: string
}

const FleetMap = (props: Props) => {
  const { carIndex, viewState, geojson, mapboxAccessToken } = props

  const mapRef = useRef<MapRef>(null)

  useEffect(() => {
    // Only fly to the location when viewState changes, respecting the passed zoom
    mapRef.current?.flyTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom
    })
  }, [viewState])

  return (
    <div className='is-full bs-full rounded-lg border-2 p-0.5'>
      <Map
        mapboxAccessToken={mapboxAccessToken}
        ref={mapRef}
        initialViewState={viewState} // Set initialViewState to respect the passed viewState
        mapStyle='mapbox://styles/mapbox/light-v9'
        attributionControl={false}
      >
        {geojson.features.map((item, index) => (
          <Marker
            key={index}
            longitude={item.geometry.coordinates[0]} // Use coordinates array
            latitude={item.geometry.coordinates[1]} // Use coordinates array
            style={{ display: 'flex' }}
          >
            <i className='bx-target-lock text-gray-800' />
          </Marker>
        ))}
      </Map>
    </div>
  )
}

export default FleetMap
