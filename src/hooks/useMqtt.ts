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

  // Optionally retrieve tenantId from Redux for tenant-specific topics
  // const tenantId = useAppSelector(state => state.auth.user.tenant?.id)

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

        const clientId = `carekey-client-${Math.random().toString(16).substr(2, 8)}`
        console.log('Connecting to AWS IoT broker with presigned URL')

        clientRef.current = mqtt.connect(awsCredentials.url, {
          clientId,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000
        })

        clientRef.current.on('connect', () => {
          console.log('Layyah Successfully connected to AWS IoT MQTT broker')
          setIsConnected(true)

          // Subscribe to wildcard topic: carekey/chat/#
          const wildcardTopic = 'carekey/chat/#'
          if (!messageHandlers.current.has(wildcardTopic)) {
            messageHandlers.current.set(wildcardTopic, (message: string) => {
              console.log(`Layyah Received message on ${wildcardTopic}:`, message)
              // Add logic to handle chat messages, e.g., dispatch to Redux
              // dispatch({ type: 'ADD_CHAT_MESSAGE', payload: JSON.parse(message) });
            })
          }

          // Subscribe to wildcard topic
          clientRef.current?.subscribe(wildcardTopic, err => {
            if (err) {
              console.error(`Error subscribing to ${wildcardTopic}:`, err)
            } else {
              console.log(`Layyah Successfully subscribed to ${wildcardTopic}`)
            }
          })

          // Resubscribe to other topics
          messageHandlers.current.forEach((_, topic) => {
            if (topic !== wildcardTopic) {
              clientRef.current?.subscribe(topic, err => {
                if (err) {
                  console.error(`Error subscribing to ${topic}:`, err)
                } else {
                  console.log(`Layyah Successfully subscribed to ${topic}`)
                }
              })
            }
          })
        })

        clientRef.current.on('message', (topic, message) => {
          console.log("Connect Message", topic, message)
          // Handle exact topic match
          const exactHandler = messageHandlers.current.get(topic)
          if (exactHandler) {
            exactHandler(message.toString())
            return
          }

          // Handle wildcard match (carekey/chat/# or tenant-specific)
          const wildcardTopic = 'carekey/chat/#'
          const wildcardHandler = messageHandlers.current.get(wildcardTopic)
          if (wildcardHandler && topic.startsWith(wildcardTopic.replace('#', ''))) {
            wildcardHandler(message.toString())
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
  }, [config.username]) // Add tenantId to dependencies

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

  const unsubscribe = (topic: string) => {
    if (messageHandlers.current.has(topic)) {
      messageHandlers.current.delete(topic)
      if (clientRef.current?.connected) {
        clientRef.current.unsubscribe(topic, err => {
          if (err) {
            console.error('Unsubscribe error:', err)
          } else {
            console.log('Successfully unsubscribed from:', topic)
          }
        })
      }
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

  return { subscribe, unsubscribe, publish, isConnected }
}
