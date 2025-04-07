import React, { useState, useMemo } from 'react'
import { Card } from '@mui/material'
import FleetMap from '../../logistics/fleet/FleetMap'

export type viewStateType = {
  longitude: number
  latitude: number
  zoom: number
}

const createGeoJSON = (timeLogData: any) => {
  return {
    type: 'FeatureCollection',
    features: timeLogData.map((log: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [log.startLocation.longitude, log.startLocation.latitude] // Updated to GeoJSON standard
      },
      properties: {
        id: log.id,
        caregiverName: `${log.caregiver.firstName} ${log.caregiver.lastName}`,
        clientName: `${log.client.firstName} ${log.client.lastName}`
      }
    }))
  }
}

const ActiveUserMapView = ({ timeLogData }: { timeLogData: any }) => {
  if (timeLogData.length) {
    const initialViewState = useMemo(() => {
      if (timeLogData?.[0]?.startLocation) {
        return {
          longitude: timeLogData[0].startLocation.longitude,
          latitude: timeLogData[0].startLocation.latitude,
          zoom: 13 // Default zoom for city-level visibility
        }
      }
      return {
        longitude: -96.0, // Center of USA
        latitude: 37.0, // Center of USA
        zoom: 3.5 // USA-wide view if no data
      }
    }, [timeLogData])

    const [expanded, setExpanded] = useState<number | false>(0)
    const [viewState, setViewState] = useState<viewStateType>(initialViewState)

    const geoJsonData = useMemo(() => createGeoJSON(timeLogData), [timeLogData])

    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
    console.log('GEO JSON data', geoJsonData)

    return (
      <div className='w-full h-80'>
        <FleetMap
          carIndex={expanded}
          viewState={viewState}
          geojson={geoJsonData}
          mapboxAccessToken={mapboxAccessToken}
        />
      </div>
    )
  }
  return null // Handle case when timeLogData is empty
}

export default ActiveUserMapView
