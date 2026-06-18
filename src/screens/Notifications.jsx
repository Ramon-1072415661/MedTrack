import { useState, useEffect, useCallback } from 'react'
import { Card, SectionHeader, Button, Badge } from '../components'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import { fetchMedicamentos, fetchTodayLogs } from '../services/medicamentoService'
import { SCREENS } from '../config/screens'
import s from './screens.module.css'

// Verifica se um horário já passou (ex: "08:00" → verdadeiro se já são 08:01)
function hourPassed(timeStr) {
  if (!timeStr) return false
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)
}

// Gera lista de notificações baseada nos medicamentos e logs do dia
function buildNotifications(medications, todayLogs) {
  const notifications = []
  const now = new Date()

  for (const med of medications) {
    if (!med.active) continue

    const takenToday = todayLogs.some(l => l.med_id === med.id && l.was_taken)

    // ── Lembretes de horário ──────────────────────────────────────────────────
    if (med.frequency === 'daily') {
      const times = med.scheduleTimes ?? ['08:00']
      for (const t of times) {
        if (hourPassed(t) && !takenToday) {
          notifications.push({
            id: `reminder-${med.id}-${t}`,
            type: 'reminder',
            title: 'Lembrete de medicamento',
            message: `Está na hora de tomar ${med.name} (${t})`,
            medId: med.id,
            medName: med.name,
            unread: true,
            urgent: true,
          })
        }
      }
    }

    if (med.frequency === 'hourly' && !takenToday) {
      notifications.push({
        id: `reminder-${med.id}-hourly`,
        type: 'reminder',
        title: 'Lembrete de medicamento',
        message: `${med.name} deve ser tomado a cada ${med.intervalHours}h`,
        medId: med.id,
        medName: med.name,
        unread: true,
        urgent: false,
      })
    }

    // ── Não tomou até meio-dia ────────────────────────────────────────────────
    if (!takenToday && now.getHours() >= 12) {
      const alreadyHasReminder = notifications.some(n => n.id.startsWith(`reminder-${med.id}`))
      if (!alreadyHasReminder) {
        notifications.push({
          id: `missed-${med.id}`,
          type: 'warning',
          title: 'Medicamento não confirmado',
          message: `Você ainda não confirmou que tomou ${med.name} hoje`,
          medId: med.id,
          medName: med.name,
          unread: true,
          urgent: true,
        })
      }
    }

    // ── Estoque baixo ─────────────────────────────────────────────────────────
    // Líquido: alerta ao chegar em 1 frasco (stock <= containerMl)
    // Cápsula: alerta ao chegar em 3 unidades
    const isLowStock = med.doseType === 'liquid' && med.containerMl
      ? (med.quantMl ?? parseFloat(med.quantity) * parseFloat(med.containerMl)) <= parseFloat(med.containerMl)
      : parseInt(med.quantity) <= 3 && parseInt(med.quantity) > 0

    const stockLabel = med.doseType === 'liquid' && med.containerMl
      ? (() => {
          const frascos = ((med.quantMl ?? parseFloat(med.quantity) * parseFloat(med.containerMl)) / parseFloat(med.containerMl)).toFixed(1).replace('.', ',')
          return `apenas ${frascos} frasco${frascos !== '1,0' ? 's' : ''}`
        })()
      : `apenas ${med.quantity} unidade${parseInt(med.quantity) !== 1 ? 's' : ''}`

    // ── Estoque zerado ───────────────────────────────────────────────────────
    const stockZero = med.doseType === 'liquid'
      ? parseInt(med.quantity) === 0
      : parseInt(med.quantity) === 0

    if (stockZero) {
      notifications.push({
        id: `out-of-stock-${med.id}`,
        type: 'warning',
        title: 'Estoque esgotado',
        message: `${med.name} não tem mais unidades. Adicione estoque no Inventário para continuar o tratamento.`,
        medId: med.id,
        medName: med.name,
        unread: true,
        urgent: true,
      })
    }

    if (!stockZero && isLowStock) {
      notifications.push({
        id: `stock-${med.id}`,
        type: 'stock',
        title: 'Estoque baixo',
        message: `${med.name} tem ${stockLabel} restante${med.doseType === 'liquid' ? 's' : ''}`,
        medId: med.id,
        medName: med.name,
        unread: true,
        urgent: false,
      })
    }

    // ── Tratamento próximo do fim ─────────────────────────────────────────────
    if (!med.continuousUse && med.quantity && med.startDate) {
      const dosesPerDay = med.frequency === 'hourly'
        ? Math.floor(24 / (parseInt(med.intervalHours) || 8))
        : (med.scheduleTimes?.length || 1)
      const stockUnits = med.doseType === 'liquid'
        ? (med.quantMl ?? parseFloat(med.quantity) * parseFloat(med.containerMl || 1))
        : parseInt(med.quantity)
      const unitsPerDose = med.doseType === 'liquid' ? parseFloat(med.doseMl) || 1 : parseInt(med.doseCapsules) || 1
      const daysLeft = Math.ceil(stockUnits / Math.max(dosesPerDay * unitsPerDose, 1))
      if (daysLeft <= 3 && daysLeft >= 0) {
        notifications.push({
          id: `ending-${med.id}`,
          type: 'info',
          title: 'Tratamento encerrando',
          message: `Tratamento de ${med.name} termina em ${daysLeft === 0 ? 'hoje' : `${daysLeft} dia${daysLeft > 1 ? 's' : ''}`}`,
          medId: med.id,
          medName: med.name,
          unread: true,
          urgent: false,
        })
      }
    }
  }

  // Urgentes primeiro
  return notifications.sort((a, b) => b.urgent - a.urgent)
}

function getIcon(type) {
  switch (type) {
    case 'warning': return '⚠️'
    case 'reminder': return '💊'
    case 'stock': return '📦'
    case 'info': return '📅'
    default: return '🔔'
  }
}

function getBorderColor(type, urgent) {
  if (urgent) return 'var(--color-danger)'
  switch (type) {
    case 'reminder': return 'var(--color-primary)'
    case 'stock': return 'var(--amber-400)'
    default: return 'var(--color-border)'
  }
}

export default function Notifications({ onNavigate, onAllRead }) {
  const { user, profile } = useAuth()
  const profileId = profile?.id ?? user?.id

  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem('notif_read_ids')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    try {
      const [meds, logs] = await Promise.all([
        fetchMedicamentos(profileId),
        fetchTodayLogs(profileId).catch(() => []),
      ])
      setNotifications(buildNotifications(meds, logs))
    } catch (err) {
      console.error('Notifications load error:', err)
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => { load() }, [load])

  function markRead(id) {
    setReadIds(prev => {
      const next = new Set([...prev, id])
      try { localStorage.setItem('notif_read_ids', JSON.stringify([...next])) } catch {}
      const stillUnread = notifications.filter(n => n.unread && !next.has(n.id))
      if (stillUnread.length === 0) onAllRead?.()
      return next
    })
  }

  function markAllRead() {
    const next = new Set(notifications.map(n => n.id))
    setReadIds(next)
    try { localStorage.setItem('notif_read_ids', JSON.stringify([...next])) } catch {}
    onAllRead?.()
  }

  const unread = notifications.filter(n => !readIds.has(n.id) && n.unread)

  return (
    <div className={s.page}>
      <PageHeader
        title="Notificações"
        subtitle={unread.length > 0
          ? `${unread.length} notificação${unread.length > 1 ? 'ões' : ''} não lida${unread.length > 1 ? 's' : ''}`
          : 'Tudo em dia!'}
      />

      <div className={s.content}>
        {loading ? (
          <Card>
            <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>⏳ Carregando...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>✅</p>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Nenhuma notificação</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Todos os medicamentos estão em dia!</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <SectionHeader title="Notificações de hoje" />
              {unread.length > 0 && (
                <Button size="sm" variant="outline" onClick={markAllRead}>
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map(n => {
                const isRead = readIds.has(n.id)
                return (
                  <div
                    key={n.id}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      border: `1.5px solid ${isRead ? 'var(--color-border)' : getBorderColor(n.type, n.urgent)}`,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      background: isRead ? 'transparent' : n.urgent ? 'var(--red-50, rgba(239,68,68,0.05))' : 'var(--color-bg-subtle)',
                      opacity: isRead ? 0.6 : 1,
                      transition: 'all .2s',
                    }}
                  >
                    <div style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{getIcon(n.type)}</div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{n.title}</p>
                        {!isRead && <Badge variant={n.urgent ? 'danger' : 'success'}>
                          {n.urgent ? 'Urgente' : 'Novo'}
                        </Badge>}
                      </div>

                      <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>
                        {n.message}
                      </p>

                      {/* Botões de ação */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        {(n.type === 'reminder' || n.type === 'warning') && (
                          <Button
                            size="sm"
                            onClick={() => {
                              markRead(n.id)
                              onNavigate(SCREENS.DASHBOARD.id)
                            }}
                          >
                            💊 Ir ao Dashboard
                          </Button>
                        )}
                        {!isRead && (
                          <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}