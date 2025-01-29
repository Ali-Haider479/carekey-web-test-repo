// hooks/useMqttClient.ts
import { useEffect, useRef, useState } from 'react'
import mqtt, { MqttClient, IClientOptions } from 'mqtt'

interface MqttConfig {
  username: string
}

export const useMqttClient = (config: MqttConfig) => {
  const clientRef = useRef<MqttClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messageHandlers = useRef<Map<string, (message: string) => void>>(new Map())

  useEffect(() => {
    const connect = () => {
      const url = `${process.env.NEXT_PUBLIC_MQTT_PROTOCOL}://${process.env.NEXT_PUBLIC_MQTT_HOST}:${process.env.NEXT_PUBLIC_MQTT_PORT}${process.env.NEXT_PUBLIC_MQTT_PATH}`
      const clientId = `carekey-${Math.random().toString(16).substr(2, 8)}`

      const options: IClientOptions = {
        clientId,
        username: config.username,
        password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
        keepalive: 30,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
        clean: true,
        rejectUnauthorized: false,
        protocolVersion: 4,
        protocol: 'wss'
      }

      try {
        if (clientRef.current?.connected) {
          clientRef.current.end(true)
        }

        console.log('Connecting to MQTT broker:', url)
        clientRef.current = mqtt.connect(url, options)

        clientRef.current.on('connect', () => {
          console.log('Successfully connected to MQTT broker')
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
          console.error('MQTT Error:', err)
          setIsConnected(false)
        })

        clientRef.current.on('offline', () => {
          console.log('MQTT client offline')
          setIsConnected(false)
        })

        clientRef.current.on('disconnect', () => {
          console.log('MQTT client disconnected')
          setIsConnected(false)
        })
      } catch (error) {
        console.error('MQTT connection error:', error)
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
      console.warn('Cannot publish: MQTT client not connected')
    }
  }

  return { subscribe, publish, isConnected }
}
