import { useState } from 'react'
import { Card, SectionHeader, Button, Badge } from '../components'
import PageHeader from '../components/PageHeader'
import s from './screens.module.css'

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Medication Reminder',
      message: 'Take Dipirona at 08:00 AM',
      time: 'Today',
      type: 'reminder',
      unread: true
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Dipirona has only 3 units left',
      time: 'Yesterday',
      type: 'warning',
      unread: true
    },
    {
      id: 3,
      title: 'Refill Reminder',
      message: 'Time to refill Amoxicillin',
      time: '2 days ago',
      type: 'info',
      unread: false
    }
  ])

  function markAllAsRead() {
    setNotifications(prev =>
      prev.map(item => ({
        ...item,
        unread: false
      }))
    )
  }

  function getIcon(type) {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'reminder':
        return '💊'
      default:
        return '🔔'
    }
  }

  return (
    <div className={s.page}>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your reminders"
      />

      <div className={s.content}>
        <Card>
          <SectionHeader title="Recent Notifications" />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid var(--slate-200)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start'
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    flexShrink: 0
                  }}
                >
                  {getIcon(notification.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 15
                      }}
                    >
                      {notification.title}
                    </p>

                    {notification.unread && (
                      <Badge variant="success">
                        New
                      </Badge>
                    )}
                  </div>

                  <p
                    style={{
                      color: 'var(--slate-500)',
                      marginTop: 4
                    }}
                  >
                    {notification.message}
                  </p>

                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--slate-400)',
                      marginTop: 8
                    }}
                  >
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={markAllAsRead}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: 16
            }}
          >
            Mark all as read
          </Button>
        </Card>
      </div>
    </div>
  )
}