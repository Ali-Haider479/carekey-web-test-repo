import React, { useState, useMemo, useEffect } from 'react'
import Radar from 'radar-sdk-js'
import 'radar-sdk-js/dist/radar.css'

Radar.initialize(process.env.NEXT_PUBLIC_RADAR_TEST_PUBLISHABLE_KEY || '')

export type viewStateType = {
  longitude: number
  latitude: number
  zoom: number
}

const ActiveUserMapView = ({
  timeLogData,
  geoJsonData,
  formattedAddress
}: {
  timeLogData: any
  geoJsonData: any
  formattedAddress: any
}) => {
  if (timeLogData.length) {
    if (!timeLogData?.length || !timeLogData[0]?.startLocation) {
      return null
    }

    const initialViewState = useMemo(
      () => ({
        longitude: timeLogData[0].startLocation.longitude,
        latitude: timeLogData[0].startLocation.latitude,
        zoom: 13
      }),
      [timeLogData]
    )

    const [expanded, setExpanded] = useState(0)
    const [viewState, setViewState] = useState(initialViewState)
    const [map, setMap] = useState<any>(null)

    useEffect(() => {
      // Initialize Radar map with attribution control disabled
      const radarMap = Radar.ui.map({
        container: 'map',
        style: 'radar-default-v1',
        center: [initialViewState.longitude, initialViewState.latitude], // Use initialViewState directly
        zoom: initialViewState.zoom,
        attributionControl: false
      })

      // Wait for map to fully load before adding markers
      radarMap.on('load', () => {
        // Force resize to ensure proper layout calculation
        setTimeout(() => {
          radarMap.resize()
          // Add markers for each coordinate
          geoJsonData.features.forEach((feature: any, index: number) => {
            const { coordinates } = feature.geometry
            const { caregiverName, clientName, address } = feature.properties
            const popupText = `${caregiverName} for ${clientName} ${address ? `Address: ${address.formattedAddress}` : ''}`

            // Validate coordinates
            if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
              console.warn('Invalid coordinates for feature:', feature)
              return
            }

            console.log(`coordinates ${index}---->`, coordinates)

            // Create marker with fixed positioning
            Radar.ui
              .marker({
                popup: {
                  html: `<div style="color: rgba(0,0,0,0.7); padding: 1.5px;">${popupText}</div>`, // Popup content
                  closeOnClick: true,
                  offset: 10
                }
              })
              .setLngLat([Number(coordinates[0]), Number(coordinates[1])])
              .addTo(radarMap)
          })

          // Log map center and bounds for debugging
          console.log('Map Center:', radarMap.getCenter())
          console.log('Map Bounds:', radarMap.getBounds())
          console.log('GeoJSON Data:', geoJsonData)
          // Additional debugging
          console.log('Map dimensions:', radarMap.getContainer().offsetWidth, 'x', radarMap.getContainer().offsetHeight)
        }, 100) // Short delay allows layout stabilization
      })

      setMap(radarMap)

      // Update view state on map move
      radarMap.on('moveend', () => {
        const center = radarMap.getCenter()
        setViewState({
          longitude: center.lng,
          latitude: center.lat,
          zoom: radarMap.getZoom()
        })
      })

      radarMap.fitToMarkers({ padding: 20 })

      // Cleanup on unmount
      return () => {
        radarMap.remove()
      }
    }, [geoJsonData, initialViewState])

    console.log('GEO JSON data with addresses', geoJsonData)

    return (
      <div
        id='map'
        style={{
          width: '100%',
          height: '40vh',
          position: 'relative', // Changed to relative for proper marker containment
          overflow: 'hidden', // Prevent markers from overflowing
          borderRadius: '4px'
        }}
      />
    )
  }
  return null // Handle case when timeLogData is empty
}

export default ActiveUserMapView
