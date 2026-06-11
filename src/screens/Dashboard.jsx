import { Card, SectionHeader, Badge, Button } from '../components'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../contexts/AuthContext'
import s from './screens.module.css'

const medications = [
  {
    id: 1,
    name: 'Dipirona',
    dosage: '500mg',
    unit: '1 tablet',
    icon: '💊',
    status: 'done',
    taken: 22,
    total: 30,
    time: '08:00',
    description: 'Take with water. Avoid taking on an empty stomach.',
    stockAlert: false,
    paused: false,
  },
  {
    id: 2,
    name: 'Amoxicillin',
    dosage: '250mg',
    unit: '1 capsule',
    icon: '💊',
    status: 'pending',
    taken: 14,
    total: 21,
    time: '13:00',
    description: 'Antibiotic. Complete the treatment even if symptoms improve',
    stockAlert: false,
    paused: false,
  },
  {
    id: 3,
    name: 'Vitamina D',
    dosage: '2000 UI',
    unit: '1 capsule',
    icon: '☀️',
    status: 'pending',
    taken: 8,
    total: 30,
    time: '20:00',
    description: 'Take with meals for better absorption.',
    stockAlert: false,
    paused: false,
  },
  {
    id: 4,
    name: 'Losartana',
    dosage: '50mg',
    unit: '1 tablet',
    icon: '🫀',
    status: 'done',
    taken: 30,
    total: 30,
    time: '07:00',
    description: null,
    stockAlert: false,
    paused: false,
    continuous: true,
  },
  {
    id: 5,
    name: 'Omeprazol',
    dosage: '20mg',
    unit: '1 capsule',
    icon: '💊',
    status: 'done',
    taken: 18,
    total: 30,
    time: '07:30',
    description: 'Take on an empty stomach, 30 min before breakfast.',
    stockAlert: true,
    stockRemaining: 3,
    paused: false,
  },
  {
    id: 6,
    name: 'Metformina',
    dosage: '850mg',
    unit: '1 tablet',
    icon: '💊',
    status: 'paused',
    taken: 10,
    total: 30,
    time: null,
    description: null,
    stockAlert: false,
    paused: true,
  },
]

function getProgressColor(status, percent) {
  if (status === 'done') return 'var(--green-500)'
  if (percent >= 60) return 'var(--blue-500)'
  return 'var(--amber-500)'
}

function MedCard({ med }) {
  const percent = Math.round((med.taken / med.total) * 100)
  const progressColor = getProgressColor(med.status, percent)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${med.stockAlert ? 'var(--color-danger)' : 'var(--color-border)'}`,
        borderRadius: 14,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: med.paused ? 0.6 : 1,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--color-bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {med.icon}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 15 }}>
            {med.name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {med.dosage} · {med.unit}
          </p>
        </div>

        {med.paused && <Badge variant="default">Pausado</Badge>}
        {med.stockAlert && !med.paused && <Badge variant="danger">Estoque baixo</Badge>}
        {!med.paused && !med.stockAlert && med.status === 'done' && (
          <Badge variant="success">Tomado</Badge>
        )}
        {!med.paused && !med.stockAlert && med.status === 'pending' && (
          <Badge variant="warning">Pendente</Badge>
        )}
      </div>

      {/* Progress */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Progresso do tratamento
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: med.paused ? 'var(--color-muted)' : progressColor,
            }}
          >
            {med.taken}/{med.total}
          </span>
        </div>

        <div
          style={{
            height: 5,
            background: 'var(--color-border)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              borderRadius: 999,
              background: med.paused ? 'var(--color-muted)' : progressColor,
              transition: 'width .4s ease',
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: med.stockAlert ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
          {med.stockAlert
            ? `⚠ ${med.stockRemaining} doses restantes`
            : med.continuous
            ? 'Uso contínuo'
            : med.paused
            ? 'Tratamento pausado'
            : 'Hoje às'}
        </span>

        {med.time && (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
            ⏰ {med.time}
          </span>
        )}
      </div>

      {/* Description */}
      {med.description && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-muted)',
            padding: '8px 10px',
            background: 'var(--color-bg-subtle)',
            borderRadius: 8,
            borderLeft: '2px solid var(--color-border)',
            lineHeight: 1.5,
          }}
        >
          {med.description}
        </p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  const totalStock = 142
  const totalMeds = medications.length
  const pausedCount = medications.filter((m) => m.paused).length
  const streakDays = 14

  return (
    <div className={s.page}>
      <PageHeader
        title="Dashboard"
        subtitle="Track your medications and treatment progress"
      />

      <div className={s.content}>

        {/* STATS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
            marginBottom: 16,
          }}
        >
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Dose Inventory
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
              {totalStock}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>
              available doses
            </p>
          </Card>

          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Registered Medications
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>
              {totalMeds}
            </p>
          </Card>

          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Paused Treatments
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--amber-400)', lineHeight: 1 }}>
              {pausedCount}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>
              in pause
            </p>
          </Card>

          <Card style={{ border: '1px solid var(--color-success)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              days without forgetting
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🔥</span>
              <div>
                <p style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-success)', lineHeight: 1 }}>
                  {streakDays}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>
                  consecutive days
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* MEDICAMENTOS */}
        <Card>
          <SectionHeader title="Medicamentos em uso" />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
            }}
          >
            {medications.map((med) => (
              <MedCard key={med.id} med={med} />
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}