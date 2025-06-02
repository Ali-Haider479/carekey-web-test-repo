'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'
import EvvActiveUserTable from './EvvActiveUserTable'
import ActiveUserMapView from './ActiveUserMapView'
import api from '@/utils/api'
import { useEffect, useState } from 'react'
import Radar from 'radar-sdk-js'

Radar.initialize(process.env.NEXT_PUBLIC_RADAR_TEST_PUBLISHABLE_KEY || '')

const createGeoJSON = (timeLogData: any) => {
  return {
    type: 'FeatureCollection',
    features: timeLogData.map((log: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [log.startLocation.longitude, log.startLocation.latitude]
      },
      properties: {
        id: log.id,
        caregiverName: `${log.caregiver.firstName} ${log.caregiver.lastName}`,
        clientName: `${log.client.firstName} ${log.client.lastName}`,
        address: null // Placeholder for reverse geocoded address
      }
    }))
  }
}

const EvvActiveUser = () => {
  const [timeLogData, setTimeLogData] = useState<any>([])
  const [payPeriod, setPayperiod] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [formattedAddress, setFormattedAddress] = useState<any>(null)

  // Initial data fetch
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const response = await api.get(`/time-log/active-timelogs`)
      setTimeLogData(response.data)
      setPayperiod(response?.data[0]?.payPeriodHistory)
      setIsLoading(false)

      // Initialize GeoJSON data
      const initialGeoJson = createGeoJSON(response.data)
      setGeoJsonData(initialGeoJson)
      fetchAddresses(initialGeoJson)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setIsLoading(false)
    }
  }

  // Fetch addresses for GeoJSON features
  const fetchAddresses = async (geoJson: any) => {
    const updatedFeatures = await Promise.all(
      geoJson.features.map(async (feature: any) => {
        try {
          const { coordinates } = feature.geometry
          const longitude = coordinates[0]
          const latitude = coordinates[1]
          const result = await Radar.reverseGeocode({
            latitude,
            longitude,
            layers: ['address', 'county']
          })
          console.log('RESULT ====>> ', result)
          if (result.addresses && result.addresses.length > 0) {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                address: result.addresses[0]
              }
            }
          }
          return feature
        } catch (err) {
          console.error('Error reverse geocoding:', err)
          return feature
        }
      })
    )
    const updatedGeoJson = { ...geoJson, features: updatedFeatures }
    setGeoJsonData(updatedGeoJson)
    setFormattedAddress(updatedGeoJson)
  }

  useEffect(() => {
    if (formattedAddress !== null || undefined) {
      console.log(
        'Setting formatted address in timelog data: ',
        formattedAddress?.features[0]?.properties?.address?.formattedAddress
      )
      setTimeLogData({
        ...timeLogData,
        formattedAddress: formattedAddress?.features[0]?.properties?.address?.formattedAddress
      })
    }
  }, [])

  useEffect(() => {
    if (timeLogData.length) {
      const initialGeoJson = createGeoJSON(timeLogData)
      setGeoJsonData(initialGeoJson)
      fetchAddresses(initialGeoJson)
    }
  }, [timeLogData])

  return (
    <Grid container spacing={6}>
      {timeLogData.length ? (
        <Grid size={{ xs: 12 }}>
          <ActiveUserMapView
            timeLogData={timeLogData?.filter(
              (data: any) =>
                !data.isCommunityVisit && // Existing condition
                data.startLocation != null // New condition to filter out null or undefined startLocation
            )}
            geoJsonData={geoJsonData}
            formattedAddress={formattedAddress}
          />
        </Grid>
      ) : (
        ''
      )}
      <Grid size={{ xs: 12 }}>
        <EvvActiveUserTable
          timeLogData={timeLogData}
          isLoading={isLoading}
          payPeriod={payPeriod}
          fetchInitialData={fetchInitialData}
          formattedAddress={formattedAddress}
        />
      </Grid>
    </Grid>
  )
}

export default EvvActiveUser
