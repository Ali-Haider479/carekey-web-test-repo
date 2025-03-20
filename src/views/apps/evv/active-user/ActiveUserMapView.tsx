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
        longitude: log.startLocation.longitude,
        latitude: log.startLocation.latitude
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
    // Calculate initial view state based on first location in timeLogData
    const initialViewState = useMemo(
      () => ({
        longitude: timeLogData?.[0].startLocation?.longitude || -73.999024,
        latitude: timeLogData?.[0].startLocation?.latitude || 40.75249842,
        zoom: 12.5
      }),
      [timeLogData]
    )

    const [expanded, setExpanded] = useState<number | false>(0)
    const [viewState, setViewState] = useState<viewStateType>(initialViewState)

    const geoJsonData = useMemo(() => createGeoJSON(timeLogData), [timeLogData])

    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
    console.log('GEO JSO data', geoJsonData)
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
}

export default ActiveUserMapView
