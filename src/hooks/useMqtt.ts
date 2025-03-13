// hooks/useMqttClient.ts
import { useEffect, useRef, useState } from 'react'
import mqtt, { MqttClient } from 'mqtt'

interface MqttConfig {
  username: string
}

interface AwsCredentials {
  url: string
}

export const useMqttClient = (config: MqttConfig) => {
  const clientRef = useRef<MqttClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messageHandlers = useRef<Map<string, (message: string) => void>>(new Map())

  useEffect(() => {
    const connect = async () => {
      try {
        // Fetch presigned URL from your backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mqtt/credentials`)
        console.log('MQTT PRESIGNED URL RESPONSE', response)

        if (!response.ok) {
          throw new Error('Failed to fetch AWS IoT credentials')
        }

        const awsCredentials: AwsCredentials = await response.json()

        // The clientId is important and should be unique for each client
        const clientId = `carekey-client-${Math.random().toString(16).substr(2, 8)}`

        console.log('Connecting to AWS IoT broker with presigned URL')

        // Connect using the presigned URL directly
        clientRef.current = mqtt.connect(awsCredentials.url, {
          clientId,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000
        })

        clientRef.current.on('connect', () => {
          console.log('Successfully connected to AWS IoT MQTT broker')
          setIsConnected(true)

          // Resubscribe to all topics
          messageHandlers.current.forEach((_, topic) => {
            clientRef.current?.subscribe(topic)
          })
        })

        clientRef.current.on('message', (topic, message) => {
          const handler = messageHandlers.current.get(topic)
          if (handler) {
            handler(message.toString())
          }
        })

        clientRef.current.on('error', err => {
          console.error('AWS IoT MQTT Error:', err)
          setIsConnected(false)
        })

        clientRef.current.on('offline', () => {
          console.log('AWS IoT MQTT client offline')
          setIsConnected(false)
        })

        clientRef.current.on('disconnect', () => {
          console.log('AWS IoT MQTT client disconnected')
          setIsConnected(false)
        })
      } catch (error) {
        console.error('AWS IoT MQTT connection error:', error)
        setIsConnected(false)
      }
    }

    connect()

    return () => {
      if (clientRef.current?.connected) {
        messageHandlers.current.clear()
        clientRef.current.end(true)
      }
    }
  }, [config.username])

  const subscribe = (topic: string, callback: (message: string) => void) => {
    if (!topic || !callback) return

    console.log('Subscribing to topic:', topic)
    messageHandlers.current.set(topic, callback)

    if (clientRef.current?.connected) {
      clientRef.current.subscribe(topic, err => {
        if (err) {
          console.error('Subscribe error:', err)
        } else {
          console.log('Successfully subscribed to:', topic)
        }
      })
    }
  }

  const publish = (topic: string, message: string) => {
    if (!topic || !message) return

    console.log('Publishing to topic:', topic, 'Message:', message)

    if (clientRef.current?.connected) {
      clientRef.current.publish(topic, message, { qos: 1, retain: false }, err => {
        if (err) {
          console.error('Publish error:', err)
        } else {
          console.log('Successfully published message')
        }
      })
    } else {
      console.warn('Cannot publish: AWS IoT MQTT client not connected')
    }
  }

  return { subscribe, publish, isConnected }
}
